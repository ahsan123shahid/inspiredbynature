import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";
import customFetch from "../axios/custom";

import localDb from "../data/db.json";

interface SubCatItem {
  subcat_id: string;
  cat_id: string;
  subcat_title: string;
  handle: string;
}

interface DynamicCategory {
  id: string;
  cat_title: string;
  handle: string;
  subcategories: SubCatItem[];
}

const defaultNavItems = [
  { label: "Perfumes", path: "/shop/perfumes" },
  { label: "Oriental & Oud", path: "/shop/oriental-oud" },
  { label: "Oils (Attar)", path: "/shop/oils" },
  { label: "Bakhoor", path: "/shop/bakhoor" },
  { label: "Gift Sets", path: "/shop/giftsets" },
];

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (prev: boolean) => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const { loginStatus } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const logout = () => {
    toast.success("Logged out successfully");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("meta_connected");
    store.dispatch(setLoginStatus(false));
    navigate("/login");
  };

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      let rawCats: any[] = [];
      let rawSubcats: any[] = [];

      try {
        const [catRes, subRes] = await Promise.all([
          customFetch.get("/categories"),
          customFetch.get("/sub-categories"),
        ]);
        rawCats = Array.isArray(catRes.data) && catRes.data.length > 0 ? catRes.data : (localDb.categories as any[]);
        rawSubcats = Array.isArray(subRes.data) && subRes.data.length > 0 ? subRes.data : (localDb["sub-categories"] as any[]);
      } catch {
        rawCats = (localDb.categories as any[]) || [];
        rawSubcats = (localDb["sub-categories"] as any[]) || [];
      }

      const structured: DynamicCategory[] = rawCats.map((cat: any) => {
        const matched = rawSubcats.filter(
          (sub: any) => String(sub.cat_id) === String(cat.id) || String(sub.category_id) === String(cat.id)
        );
        return {
          id: String(cat.id),
          cat_title: cat.cat_title,
          handle: cat.handle || cat.cat_title.toLowerCase().replace(/\s+/g, "-"),
          subcategories: matched.map((s: any) => ({
            subcat_id: String(s.subcat_id || s.id),
            cat_id: String(s.cat_id),
            subcat_title: s.subcat_title,
            handle: s.handle || s.subcat_title.toLowerCase().replace(/\s+/g, "-"),
          })),
        };
      });

      setCategories(structured);
    };
    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  return (
    <>
      {(isSidebarOpen || isAnimating) && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          <div
            className={
              isSidebarOpen
                ? "fixed top-0 left-0 w-72 z-50 h-full transition-transform duration-300 ease-in-out bg-canvas shadow-2xl transform translate-x-0 overflow-y-auto"
                : "fixed top-0 left-0 w-72 z-50 h-full transition-transform duration-300 ease-in-out bg-canvas shadow-2xl transform -translate-x-full overflow-y-auto"
            }
          >
          <div className="flex justify-end mr-2 mt-2">
            <HiXMark
              className="text-2xl cursor-pointer text-ink"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
          <div className="flex justify-center mt-4 mb-8">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tighter text-primary"
              style={{ letterSpacing: "-1px" }}
            >
              INSPIREDBYNATURE
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1 pb-10">
            <Link
              to="/"
              className="py-3 border-y border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked font-bold text-ink"
              onClick={() => setIsSidebarOpen(false)}
            >
              Home
            </Link>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.id} className="w-full text-center border-b border-hairline">
                  <Link
                    to={`/shop/${cat.handle}`}
                    className="py-3 w-full block text-body-md uppercase tracking-tracked font-bold text-ink hover:bg-canvas-cream transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {cat.cat_title}
                  </Link>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="bg-canvas-cream/60 py-1 flex flex-col gap-1">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.subcat_id}
                          to={`/shop/${sub.handle}`}
                          className="py-2 text-xs uppercase tracking-wider text-shade-50 hover:text-ink transition-colors"
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          ↳ {sub.subcat_title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              defaultNavItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="py-3 border-b border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked font-medium text-ink hover:bg-canvas-cream transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))
            )}
            <Link
              to="/search"
              className="py-3 border-b border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked text-ink"
              onClick={() => setIsSidebarOpen(false)}
            >
              Search
            </Link>
            {loginStatus ? (
              <button
                onClick={logout}
                className="py-3 border-b border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked text-ink"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 border-b border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked text-ink"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="py-3 border-b border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked text-ink"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
            <Link
              to="/cart"
              className="py-3 border-b border-hairline w-full block flex justify-center text-body-md uppercase tracking-tracked text-ink"
              onClick={() => setIsSidebarOpen(false)}
            >
              Cart
            </Link>
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default SidebarMenu;