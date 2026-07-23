import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ScrollToTop } from "../components";
import customFetch from "../axios/custom";
import { trackFbEvent } from "../utils/fbPixel";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  mobile_image: string;
  btn_text: string;
  btn_link: string;
  overlay_color: string;
  overlay_opacity: number;
  title_color: string;
  subtitle_color: string;
  content_alignment: "left" | "center" | "right";
  btn_bg: string;
  btn_text_color: string;
  slide_duration: number;
}

interface CollectionTab {
  label: string;
  category: string;
}

export interface ThemeSettings {
  announcement: {
    text: string;
    bg_color: string;
    text_color: string;
    enabled: boolean;
  };
  logo_text: string;
  logo_image: string;
  logo_size: number;
  slides: Slide[];
  categories_section: {
    enabled: boolean;
    title: string;
  };
  featured_collections: {
    enabled: boolean;
    title: string;
    tabs: CollectionTab[];
  };
  trending_products: {
    enabled: boolean;
    title: string;
    limit: number;
  };
  whatsapp: {
    phone: string;
    enabled: boolean;
    message: string;
    position: "bottom-right" | "bottom-left";
  };
  installments: {
    enabled: boolean;
    provider: string;
    count: number;
  };
  promotional_section: {
    enabled: boolean;
    left_image: string;
    left_subtitle: string;
    left_title: string;
    left_btn_text: string;
    left_btn_link: string;
    right_image: string;
    right_subtitle: string;
    right_title: string;
    right_btn_text: string;
    right_btn_link: string;
  };
  instagram_gallery: {
    enabled: boolean;
    title: string;
    hashtag: string;
    items: {
      image: string;
      link: string;
    }[];
  };
  trust_bar: {
    enabled: boolean;
    items: {
      icon: string;
      title: string;
      subtitle: string;
    }[];
  };
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
    button_text: string;
  };
  footer: {
    facebook_url: string;
    instagram_url: string;
    tiktok_url: string;
    pinterest_url: string;
    youtube_url: string;
    phone: string;
    email: string;
  };
}

import localDb from "../data/db.json";

export const originalThemeSettings: ThemeSettings = (() => {
  try {
    const raw = localDb.stores?.[0]?.theme_settings;
    if (raw) {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    }
  } catch (e) {
    console.error("Failed to parse theme_settings from db.json", e);
  }
  return {} as ThemeSettings;
})();

export const defaultThemeSettings = originalThemeSettings;

const HomeLayout = () => {
  const [settings, setSettings] = useState<ThemeSettings | null>(originalThemeSettings);
  const location = useLocation();
  const [flyingItems, setFlyingItems] = useState<Array<{ id: number; image: string; startX: number; startY: number }>>([]);

  useEffect(() => {
    const handleCartFly = (e: Event) => {
      const customEvent = e as CustomEvent<{ image: string; startX: number; startY: number }>;
      const { image, startX, startY } = customEvent.detail;
      setFlyingItems((prev) => [...prev, { id: Date.now() + Math.random(), image, startX, startY }]);
    };

    window.addEventListener("cart-fly", handleCartFly);
    return () => window.removeEventListener("cart-fly", handleCartFly);
  }, []);

  useEffect(() => {
    // Load SEO settings from localStorage
    const seoStored = localStorage.getItem("inspiredbynature_seo_settings");
    const seo = seoStored ? JSON.parse(seoStored) : {
      metaTitleTemplate: "{Page Title} | INSPIREDBYNATURE",
      defaultMetaDescription: "Premium luxury fragrances, eau de parfum, and gift sets by Gemini Nano. Free shipping nationwide.",
      gaTrackingId: "G-XXXXXXXXXX",
      fbPixelId: "123456789012345",
    };

    // Determine Page Title
    let pageTitle = "Home";
    const path = location.pathname;
    if (path.startsWith("/product/")) {
      pageTitle = "Product Details";
    } else if (path === "/shop") {
      pageTitle = "Shop Collection";
    } else if (path === "/cart") {
      pageTitle = "Your Shopping Cart";
    } else if (path === "/checkout") {
      pageTitle = "Secure Checkout";
    } else if (path === "/wishlist") {
      pageTitle = "Your Wishlist";
    } else if (path.startsWith("/admin")) {
      pageTitle = "Admin Dashboard";
    } else {
      const segment = path.split("/").pop();
      if (segment) {
        pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }

    // Set Document Title
    const formattedTitle = seo.metaTitleTemplate.replace("{Page Title}", pageTitle);
    document.title = formattedTitle;

    // Set Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.defaultMetaDescription);

    // Google Analytics Script Injection
    const gaId = seo.gaTrackingId;
    if (gaId && gaId !== "G-XXXXXXXXXX" && /^G-[A-Za-z0-9]+$/.test(gaId)) {
      const gaScriptId = "inspiredbynature-ga-script";
      if (!document.getElementById(gaScriptId)) {
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
        script1.id = gaScriptId;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.id = gaScriptId + "-init";
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId.replace(/[^A-Za-z0-9-]/g, '')}');
        `;
        document.head.appendChild(script2);
      }
    }

    // Facebook Pixel Script Injection
    const fbId = seo.fbPixelId;
    if (fbId && fbId !== "123456789012345" && /^\d+$/.test(fbId)) {
      const fbScriptId = "inspiredbynature-fb-pixel";
      if (!document.getElementById(fbScriptId)) {
        const script = document.createElement("script");
        script.id = fbScriptId;
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fbId.replace(/[^0-9]/g, '')}');
        `;
        document.head.appendChild(script);
      }
      // Track PageView on route transitions
      trackFbEvent("PageView");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await customFetch.get("/stores");
        const storeData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (storeData && storeData.theme_settings) {
          const parsed = typeof storeData.theme_settings === "string" ? JSON.parse(storeData.theme_settings) : storeData.theme_settings;
          setSettings({
            ...defaultThemeSettings,
            ...parsed,
            announcement: { ...defaultThemeSettings.announcement, ...(parsed.announcement || {}) },
            whatsapp: { ...defaultThemeSettings.whatsapp, ...(parsed.whatsapp || {}) },
            installments: { ...defaultThemeSettings.installments, ...(parsed.installments || {}) },
            featured_collections: { ...defaultThemeSettings.featured_collections, ...(parsed.featured_collections || {}) },
            trending_products: { ...defaultThemeSettings.trending_products, ...(parsed.trending_products || {}) },
            instagram_gallery: { ...defaultThemeSettings.instagram_gallery, ...(parsed.instagram_gallery || {}) },
            trust_bar: { ...defaultThemeSettings.trust_bar, ...(parsed.trust_bar || {}) },
            newsletter: { ...defaultThemeSettings.newsletter, ...(parsed.newsletter || {}) },
            footer: { ...defaultThemeSettings.footer, ...(parsed.footer || {}) },
          });
          return;
        }
      } catch (e) {
        console.error("Failed to load store settings on frontend layout", e);
      }

      // Guaranteed fallback so layout never hangs on loading spinner
      setSettings(defaultThemeSettings);
    };
    fetchSettings();
  }, []);

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 48, height: 48,
          border: '3px solid #e5e5e5',
          borderTopColor: '#8b7d6b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const wa = settings.whatsapp;
  const whatsappUrl = `https://wa.me/${wa.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    wa.message
  )}`;

  return (
    <>
      <ScrollToTop />
      <Header logoText={settings.logo_text} logoImage={settings.logo_image} logoSize={settings.logo_size} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Outlet context={settings} />
        </motion.div>
      </AnimatePresence>
      <Footer themeSettings={settings} />

      {/* Floating WhatsApp Button */}
      {wa.enabled && wa.phone && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed z-50 bg-[#25d366] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center whatsapp-bounce`}
          style={{
            bottom: "24px",
            right: wa.position === "bottom-right" ? "24px" : "auto",
            left: wa.position === "bottom-left" ? "24px" : "auto",
          }}
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.498 1.453 5.438 1.454 5.761 0 10.447-4.686 10.45-10.45.002-2.791-1.085-5.413-3.061-7.393C17.45 1.787 14.832.7 12.04.7 6.279.7 1.59 5.387 1.587 11.149c-.001 1.942.505 3.84 1.467 5.437l-.963 3.518 3.556-.931zm13.136-7.37c-.3-.15-1.771-.875-2.04-.972-.27-.1-.466-.15-.66.15-.194.3-.75.94-.919 1.135-.168.19-.337.21-.637.06-.3-.15-1.264-.467-2.41-1.488-.891-.795-1.493-1.778-1.668-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.349.45-.523.15-.174.2-.291.3-.485.1-.194.05-.364-.025-.515-.075-.15-.66-1.59-.905-2.18-.24-.578-.48-.5-.66-.51-.17-.008-.365-.01-.56-.01-.195 0-.514.073-.78.365-.268.291-1.025 1.002-1.025 2.444 0 1.442 1.049 2.839 1.196 3.033.147.194 2.062 3.149 4.996 4.413.698.301 1.243.481 1.668.616.7.223 1.338.192 1.843.117.563-.083 1.771-.725 2.02-1.425.25-.7.25-1.299.175-1.425-.076-.127-.27-.2-.57-.35z" />
          </svg>
        </a>
      )}

      {/* Flying Cart Overlay Elements */}
      <AnimatePresence>
        {flyingItems.map((item) => {
          const cartIcon = document.getElementById("header-cart-icon");
          const rect = cartIcon?.getBoundingClientRect();
          const targetX = rect ? rect.left + rect.width / 2 : window.innerWidth - 80;
          const targetY = rect ? rect.top + rect.height / 2 : 40;

          return (
            <motion.div
              key={item.id}
              initial={{
                position: "fixed",
                left: item.startX - 24,
                top: item.startY - 24,
                width: 48,
                height: 48,
                borderRadius: "9999px",
                border: "2px solid #151515",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                zIndex: 9999,
                overflow: "hidden",
                pointerEvents: "none",
                backgroundColor: "#ffffff",
              }}
              animate={{
                left: [item.startX - 24, item.startX + (targetX - item.startX) * 0.4, targetX - 12],
                top: [item.startY - 24, item.startY - 120, targetY - 12],
                scale: [1, 0.8, 0.15],
                opacity: [1, 0.9, 0.2],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.85,
                ease: [0.25, 1, 0.5, 1],
              }}
              onAnimationComplete={() => {
                setFlyingItems((prev) => prev.filter((i) => i.id !== item.id));
              }}
            >
              <img
                src={`/assets/${item.image}`}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
};

export default HomeLayout;
