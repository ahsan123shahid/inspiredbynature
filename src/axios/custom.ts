import axios from "axios";

/**
 * Custom Axios client instance preconfigured for the eCommerce store's backend API.
 * Reads configurations dynamically from Vite environment variables.
 */
const customFetch = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    headers: {
        Accept: "application/json"
    }
})

customFetch.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

customFetch.interceptors.response.use(
    (response) => {
        if (response.data && response.data.status === "success" && Object.prototype.hasOwnProperty.call(response.data, "data")) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default customFetch;