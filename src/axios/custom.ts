import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

const customFetch = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    Accept: "application/json",
  },
});

customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customFetch.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      response.data.status === "success" &&
      Object.prototype.hasOwnProperty.call(response.data, "data")
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return customFetch(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let refreshToken: string | null = null;
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            refreshToken = user.refresh_token || null;
          }
        } catch {
          refreshToken = null;
        }

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { Accept: "application/json" } }
        );

        const { access_token, refresh_token } = response.data;

        localStorage.setItem("token", access_token);

        const existingUser = localStorage.getItem("user");
        if (existingUser) {
          const user = JSON.parse(existingUser);
          user.access_token = access_token;
          user.refresh_token = refresh_token;
          localStorage.setItem("user", JSON.stringify(user));
        }

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return customFetch(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default customFetch;