import React, { useState, useEffect } from "react";

export default function Promotion() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "oggoair Guarantee.",
      subtitle:
        "Don't panic! Here's what to do when you miss your connecting flight",
      description:
        "We've got you covered with 24/7 support and automatic rebooking assistance when travel doesn't go as planned.",
      illustration: (
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl"></div>
          <div className="relative p-6 h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <div className="absolute top-4 right-4 w-16 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-xs font-bold text-black">
              FLIGHT TICKET
            </div>
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-orange-200 rounded-full"></div>
            <div className="absolute bottom-6 right-6 w-6 h-6 bg-blue-200 rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Price Protection Promise.",
      subtitle:
        "Found a cheaper flight after booking? We'll match the price or refund the difference",
      description:
        "Shop with confidence knowing that if you find a lower price within 24 hours, we'll make it right.",
      illustration: (
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl"></div>
          <div className="relative p-6 h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-purple-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="absolute top-4 right-4 w-16 h-10 bg-green-400 rounded-lg flex items-center justify-center text-xs font-bold text-white">
              BEST PRICE
            </div>
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-yellow-200 rounded-full"></div>
            <div className="absolute bottom-6 right-6 w-6 h-6 bg-purple-200 rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "24/7 Travel Support.",
      subtitle: "Get instant help whenever you need it, anywhere in the world",
      description:
        "Our expert travel agents are available around the clock to assist with changes, cancellations, and travel emergencies.",
      illustration: (
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl"></div>
          <div className="relative p-6 h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5S17.33 5 16.5 5 15 5.67 15 6.5zm4 8.5H5v-2h14v2zm0-4H5V9h14v2z" />
              </svg>
            </div>
            <div className="absolute top-4 right-4 w-16 h-10 bg-red-400 rounded-lg flex items-center justify-center text-xs font-bold text-white">
              24/7 HELP
            </div>
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-green-200 rounded-full"></div>
            <div className="absolute bottom-6 right-6 w-6 h-6 bg-cyan-200 rounded-full"></div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-2 pb-8 pt-16 w-11/12">
      <div className="relative overflow-hidden border border-gray-300 rounded-3xl">
        <div className="relative">
          {/* Slider Content */}
          <div className="relative h-96 md:h-80">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-500 bg-white ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 transform translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 transform -translate-x-full"
                    : "opacity-0 transform translate-x-full"
                }`}
              >
                <div className="flex flex-col md:flex-row items-center h-full px-10 md:pt-5 md:pb-16">
                  {/* Content */}
                  <div className="flex-1 md:pr-8 mb-8 md:mb-0">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
                      {slide.title}
                    </h2>
                    <h3 className="text-lg md:text-xl text-primary-text mb-6 leading-relaxed">
                      {slide.subtitle}
                    </h3>
                    <p className="text-slate-500 text-base leading-relaxed max-w-md">
                      {slide.description}
                    </p>
                  </div>

                  {/* Illustration */}
                  <div className="flex-shrink-0">{slide.illustration}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {/* <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-200 group"
          >
            <svg
              className="w-6 h-6 text-slate-600 group-hover:text-slate-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-200 group"
          >
            <svg
              className="w-6 h-6 text-slate-600 group-hover:text-slate-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button> */}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex w-full px-12 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-slate-600"
                  : "w-4 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
