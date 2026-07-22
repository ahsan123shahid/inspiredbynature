"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Slide = {
  id: number;
  desktopImage: string;
  mobileImage?: string;
  overlayOpacity?: number;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  linkUrl?: string;
};

type BannerProps = {
  slides: Slide[];
};

export default function Banner({ slides }: BannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      <picture>
        <source media="(max-width: 768px)" srcSet={slide.mobileImage || slide.desktopImage} />
        <img src={slide.desktopImage} alt="" className="w-full h-full object-cover" />
      </picture>
      {slide.overlayOpacity && (
        <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlayOpacity }} />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-on-primary text-center">
        {slide.title && <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.95]">{slide.title}</h1>}
        {slide.subtitle && <p className="text-lg md:text-2xl italic mt-2 font-serif">{slide.subtitle}</p>}
        {slide.buttonText && slide.buttonLink && (
          <Link href={slide.buttonLink} className="btn-primary mt-6 inline-block">
            {slide.buttonText}
          </Link>
        )}
      </div>
      {slide.linkUrl && !slide.buttonLink && (
        <Link href={slide.linkUrl} className="absolute inset-0" aria-label="Go to slide" />
      )}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-on-primary" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
