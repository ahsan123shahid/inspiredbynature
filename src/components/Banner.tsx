import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ThemeSettings } from "../pages/HomeLayout";

interface BannerProps {
  themeSettings?: ThemeSettings;
}

const alignmentClasses: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const Banner = ({ themeSettings }: BannerProps) => {
  const slides = themeSettings?.slides || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || slides.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const onImageLoad = useCallback((url: string) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const current = slides[activeIndex];
    const duration = current?.slide_duration || 5000;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, duration);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, activeIndex, slides]);

  if (slides.length === 0) {
    return (
      <div className="w-full flex flex-col justify-end items-center pb-16 md:pb-24 bg-canvas-cream h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px]">
        <h2 className="text-display-hero text-ink text-center">
          BASICS
        </h2>
        <p className="text-script-lead text-ink/70 mt-2">
          summer petals
        </p>
      </div>
    );
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] overflow-hidden bg-canvas-cream select-none"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const rawImage = isMobile && slide.mobile_image ? slide.mobile_image : slide.image;
        const imageUrl = rawImage.startsWith("http") || rawImage.startsWith("/")
          ? rawImage
          : `/assets/${rawImage}`;
        const loaded = loadedImages.has(imageUrl);
        const align = alignmentClasses[slide.content_alignment] || alignmentClasses.center;

        const content = (
          <>
            <div
              className={`absolute inset-0 transition-[transform] duration-[10000ms] ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            >
              <img
                src={imageUrl}
                alt=""
                onLoad={() => onImageLoad(imageUrl)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  onImageLoad(imageUrl);
                }}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(0deg, ${slide.overlay_color}${hexToAlpha(slide.overlay_opacity)} 0%, ${slide.overlay_color}${hexToAlpha(Math.max(0, slide.overlay_opacity - 0.25))} 100%)`,
                }}
              />
            </div>

            <div className="relative z-20 px-8 flex flex-col max-w-4xl mx-auto text-center items-center animate-fade-in pointer-events-none">
              <h2
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-[0.15em] uppercase"
                style={{ color: slide.title_color || "#d4af37" }}
              >
                {slide.title}
              </h2>
              <p
                className="text-xs sm:text-sm md:text-base lg:text-lg font-serif italic tracking-wide mt-2 opacity-90"
                style={{ color: slide.subtitle_color || "#ffffff" }}
              >
                {slide.subtitle}
              </p>
              {slide.id === "1" && (
                <p className="text-[9px] sm:text-xs md:text-sm tracking-[0.2em] uppercase font-sans mt-3 text-white/80">
                  Blush Noire | Bohairah | Opaline Wave
                </p>
              )}
              {slide.btn_text && (
                <div className="flex justify-center items-center gap-4 pt-6 pointer-events-auto">
                  <span
                    className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold px-8 py-3 border border-white hover:bg-white hover:text-black transition-all duration-300 inline-block"
                    style={{
                      borderColor: slide.btn_bg || "#ffffff",
                      color: slide.btn_text_color || "#ffffff",
                    }}
                  >
                    {slide.btn_text}
                  </span>
                </div>
              )}
            </div>
          </>
        );

        if (slide.btn_link) {
          return (
            <Link
              key={slide.id || index}
              to={slide.btn_link}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex flex-col justify-center ${align} ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex flex-col justify-center ${align} ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {content}
          </div>
        );
      })}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function hexToAlpha(opacity: number): string {
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
  return alpha.toString(16).padStart(2, "0");
}

export default Banner;