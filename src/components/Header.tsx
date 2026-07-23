import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineUser, HiOutlineMagnifyingGlass, HiOutlineShoppingBag, HiOutlineHeart, HiBars3 } from "react-icons/hi2";
import { useAppSelector } from "../hooks";
import SidebarMenu from "./SidebarMenu";
import SearchModal from "./SearchModal";
import { motion } from "framer-motion";
import customFetch from "../axios/custom";
import { ThemeSettings } from "../pages/HomeLayout";

const defaultNavItems = [
  { label: "HOME", path: "/" },
  { label: "PERFUMES", path: "/shop/perfumes" },
  { label: "ORIENTAL & OUD", path: "/shop/oriental-oud" },
  { label: "OILS (ATTAR)", path: "/shop/oils" },
  { label: "BAKHOOR", path: "/shop/bakhoor" },
  { label: "GIFT SETS", path: "/shop/gift-sets" },
  { label: "CONTACT US", path: "/contact" },
];

interface HeaderProps {
  themeSettings?: ThemeSettings;
  logoText?: string;
  logoImage?: string;
  logoSize?: number;
}

const Header = ({ themeSettings, logoText: propLogoText, logoImage: propLogoImage, logoSize: propLogoSize }: HeaderProps) => {
  const logoText = themeSettings?.logo_text || propLogoText || "GEMINI NANO";
  const logoImage = themeSettings?.logo_image || propLogoImage || "inspiredbynature-logo.png";
  const logoSize = themeSettings?.logo_size || propLogoSize || 70;
  const announcement = themeSettings?.announcement;

  const logoSrc = logoImage
    ? logoImage.startsWith("http") || logoImage.startsWith("/")
      ? logoImage
      : `/assets/${logoImage}`
    : "/assets/gemini-nano-logo.png";
  const logoHeight = logoSize || 70;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navItems, setNavItems] = useState<Array<{ label: string; path: string; sale?: boolean }>>(defaultNavItems);
  const { wishlistItems } = useAppSelector((state) => state.wishlist);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const isLoggedIn = useAppSelector((state) => state.auth.loginStatus);
  
  const cartItemsCount = productsInCart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const res = await customFetch.get("/nav-items");
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setNavItems(data.map((item: any) => ({
            label: item.label,
            path: item.slug === "" ? "/" : `/shop/${item.slug}`,
            sale: item.label.toLowerCase().includes("sale") || item.label.toLowerCase().includes("special"),
          })));
        }
      } catch (e) {
        console.warn("Failed to fetch nav items, using defaults", e);
      }
    };
    fetchNavItems();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-canvas border-b border-hairline/60 transition-all duration-300">
        {/* Announcement Bar */}
        {announcement?.enabled && (
          <div
            className="w-full text-center py-2.5 px-4 flex items-center justify-between text-[11px] tracking-[0.2em] font-semibold uppercase relative transition-all duration-300"
            style={{
              backgroundColor: announcement.bg_color || "#000000",
              color: announcement.text_color || "#ffffff",
            }}
          >
            <button className="hover:opacity-75 focus:outline-none pl-4 pr-2 py-1 text-sm font-bold">
              &lsaquo;
            </button>
            <div className="mx-auto select-none text-center font-bold tracking-widest">
              {announcement.text}
            </div>
            <button className="hover:opacity-75 focus:outline-none pr-4 pl-2 py-1 text-sm font-bold">
              &rsaquo;
            </button>
          </div>
        )}

        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8">
          {/* Top Header Row: Logo Centered on Mobile/Desktop, actions on right */}
          <div className="relative flex items-center justify-between h-20 md:h-24">
            
            {/* Mobile Menu Trigger & Search Icon */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                className="text-xl text-ink p-1"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open menu"
              >
                <HiBars3 className="text-2xl" />
              </button>
            </div>

            {/* Logo - Centered absolute on mobile, relative on desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 lg:flex-1 lg:flex lg:justify-start">
              <Link to="/">
                <img
                  src={logoSrc}
                  alt={logoText}
                  className="w-auto object-contain transition-all duration-300"
                  style={{ maxHeight: `${logoHeight}px` }}
                  onError={(e) => {
                    // Fallback to text logo if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </Link>
            </div>

            {/* Actions Panel (right side) */}
            <div className="flex items-center gap-2 sm:gap-4 lg:flex-1 lg:justify-end">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-ink hover:opacity-60 transition-opacity p-1 focus:outline-none"
                aria-label="Search products"
              >
                <HiOutlineMagnifyingGlass className="text-2xl" />
              </button>
              <Link to={isLoggedIn ? "/user-profile" : "/login"} className="text-ink hover:opacity-60 transition-opacity p-1 hidden sm:inline-block" aria-label="User Account">
                <HiOutlineUser className="text-2xl" />
              </Link>
              <Link to="/wishlist" className="text-ink hover:opacity-60 transition-opacity p-1 relative hidden sm:inline-block">
                <HiOutlineHeart className="text-2xl" />
                {wishlistItems.length > 0 && (
                  <motion.span
                    key={wishlistItems.length}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: [0.6, 1.3, 0.9] }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute -top-1 -right-1 bg-ink text-on-primary text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </Link>
              <Link id="header-cart-icon" to="/cart" className="text-ink hover:opacity-60 transition-opacity p-1 relative">
                <HiOutlineShoppingBag className="text-2xl" />
                {cartItemsCount > 0 && (
                  <motion.span
                    key={cartItemsCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: [0.6, 1.3, 0.9] }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute -top-1 -right-1 bg-ink text-on-primary text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Row (centered bottom row) */}
          <nav className="hidden lg:flex items-center justify-center gap-10 pb-5 border-t border-hairline/20 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-[12px] tracking-[0.15em] uppercase font-bold hover:opacity-60 transition-opacity ${
                  item.sale ? "!text-primary" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;