import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
import {
  Check,
  Plane,
  Building2,
  Car,
  Bus,
  Train,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ModernAuthForm from "./Login/ModernAuthForm";
import { useSession, signOut } from "next-auth/react";
import { tokenUtils } from "@/config/api";

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [airplaneOpen, setAirplaneOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("US");
  const [selectedTravelType, setSelectedTravelType] = useState("Flight");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCustomAuth, setIsCustomAuth] = useState(false);
  const [customUser, setCustomUser] = useState(null);
  const { data: session, status } = useSession();
  const [navTick, setNavTick] = useState(0);
  const airplaneRef = useRef(null);
  const langRef = useRef(null);
  const userRef = useRef(null);
  const router = useRouter();

  const flag = [
    {
      countryCode: "US",
      name: "English (US)",
      flag: "/st-images/flags/usa.webp",
    },
    {
      countryCode: "SA",
      name: "العربية",
      flag: "/st-images/flags/jordan.webp",
    },
    {
      countryCode: "DE",
      name: "Deutsch",
      flag: "/st-images/flags/germany.png",
    },
    {
      countryCode: "RO",
      name: "Română",
      flag: "/st-images/flags/romania.png",
    },
    {
      countryCode: "TR",
      name: "Türkçe",
      flag: "/st-images/flags/turkey.png",
    },
    {
      countryCode: "RU",
      name: "Русский",
      flag: "/st-images/flags/russia.png",
    },
  ];

  const travelTypes = [
    {
      name: "Flight",
      icon: Plane,
      image: null,
    },
    {
      name: "Hotel",
      icon: Building2,
      image: null,
    },
    {
      name: "Cars",
      icon: Car,
      image: null,
    },
    {
      name: "EuroBus",
      icon: Bus,
      image: null,
    },
    {
      name: "EuroRail",
      icon: Train,
      image: null,
    },
  ];

  // Get the selected flag data
  const selectedFlagData = flag.find(
    (item) => item.countryCode === selectedLanguage
  );

  // Get the selected travel type data
  const selectedTravelTypeData = travelTypes.find(
    (item) => item.name === selectedTravelType
  );

  const handleLanguageSelect = (countryCode) => {
    setSelectedLanguage(countryCode);
    setLangOpen(false);
  };

  const handleTravelTypeSelect = (travelType) => {
    setSelectedTravelType(travelType);
    setAirplaneOpen(false);

    // Navigate to home page with travel type query
    router.push({
      pathname: "/",
      query: { type: travelType.toLowerCase() },
    });
  };

  const handleUserToggle = () => {
    if (status === "authenticated" || isCustomAuth) {
      setUserOpen(!userOpen);
      setLangOpen(false);
      setAirplaneOpen(false); // Close airplane dropdown when opening user dropdown
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLanguageToggle = () => {
    setLangOpen(!langOpen);
    setUserOpen(false); // Close user dropdown when opening language dropdown
    setAirplaneOpen(false); // Close airplane dropdown when opening language dropdown
  };

  const handleAirplaneToggle = () => {
    setAirplaneOpen(!airplaneOpen);
    setLangOpen(false); // Close language dropdown when opening airplane dropdown
    setUserOpen(false); // Close user dropdown when opening airplane dropdown
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setUserOpen(false);

    // Refresh custom auth state after successful login
    const isAuthenticated = tokenUtils.isAuthenticated();
    const userData = tokenUtils.getUserData();

    if (isAuthenticated && userData) {
      setCustomUser(userData);
      setIsCustomAuth(true);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (status === "authenticated") {
      await signOut({ redirect: false });
    }

    // Clear token and user data from localStorage
    tokenUtils.removeToken();
    tokenUtils.removeUserData();

    // Clear custom auth state
    setCustomUser(null);
    setIsCustomAuth(false);
    setUserOpen(false);
  };

  // Check for custom authentication state
  useEffect(() => {
    const checkCustomAuth = () => {
      const isAuthenticated = tokenUtils.isAuthenticated();
      const userData = tokenUtils.getUserData();

      if (isAuthenticated) {
        setCustomUser(userData || {});
        setIsCustomAuth(true);
      } else {
        setCustomUser(null);
        setIsCustomAuth(false);
      }
    };

    // Check on component mount
    checkCustomAuth();

    // React to explicit auth change events (within same tab) and storage events (cross-tab)
    const handleStorageChange = (e) => {
      if (!e || e.key === "token" || e.key === "userData") {
        checkCustomAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-changed", handleStorageChange);
    window.addEventListener("navbar-refresh", () => {
      handleStorageChange({ key: null });
      setNavTick((t) => t + 1);
    });
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-changed", handleStorageChange);
      window.removeEventListener("navbar-refresh", () => {});
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update selected travel type based on current route
  useEffect(() => {
    const pathname = router.pathname;
    const queryType = router.query.type;

    if (pathname === "/hotelSearch" || queryType === "hotel") {
      setSelectedTravelType("Hotel");
    } else if (pathname === "/bus/busSearch" || queryType === "eurobus") {
      setSelectedTravelType("EuroBus");
    } else if (
      pathname === "/flight/flightSearch" ||
      pathname === "/returnFlights" ||
      queryType === "flight"
    ) {
      setSelectedTravelType("Flight");
    } else {
      // Default to Flight for home page or other pages
      setSelectedTravelType("Flight");
    }
  }, [router.pathname, router.query.type]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close language dropdown if click is outside
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      // Close user dropdown if click is outside
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserOpen(false);
      }
      // Close airplane dropdown if click is outside
      if (airplaneRef.current && !airplaneRef.current.contains(event.target)) {
        setAirplaneOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (showAuthModal) {
      document.body.classList.add("overflow-hidden", "h-screen");
    } else {
      document.body.classList.remove("overflow-hidden", "h-screen");
    }

    // Cleanup to ensure the body class is removed when component unmounts
    return () => document.body.classList.remove("overflow-hidden", "h-screen");
  }, [showAuthModal]);

  // Get userData object from localStorage (if any)
  let user = null;
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("userData");
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      user = null;
    }
  }

  return (
    <FullContainer
      className={`transition-all duration-300 fixed top-0 !h-fit z-[9999] ${
        isScrolled
          ? "bg-primary-text shadow-[0_4px_24px_0_rgba(34,50,90,0.08)] py-0.5"
          : "bg-transparent min-[400px]:pt-[16px] sm:pt-[25px] md:pt-[38px]"
      }`}
    >
      <Container className="flex flex-col px-2 min-[400px]:px-3 sm:px-4 md:px-6">
        {/* Navbar */}
        <div className="flex justify-between items-center min-h-[45px] min-[400px]:min-h-[50px] sm:min-h-[60px] md:min-h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src={
                router.pathname?.startsWith("/dashboard")
                  ? "/logo-white-green.png"
                  : isScrolled
                  ? "/logo-white-green.png"
                  : router.pathname === "/"
                  ? "/logo-white.png"
                  : "/logo.png"
              }
              alt="oggoair"
              width={500}
              height={500}
              className={`w-[75px] min-[400px]:w-[85px] sm:w-[120px] md:w-[140px] lg:w-[165px] transition-all duration-300`}
            />
          </Link>

          {/* Right controls - each in its own box, spaced apart */}
          <div className="items-center flex gap-1 min-[400px]:gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Travel type dropdown */}
            <div className="relative" ref={airplaneRef}>
              <button
                onClick={handleAirplaneToggle}
                className="flex items-center gap-1 bg-gray-50 hover:bg-white transition-colors duration-300 rounded-full p-0.5 md:p-1"
              >
                {selectedTravelTypeData.image ? (
                  <Image
                    src={selectedTravelTypeData.image}
                    alt={selectedTravelTypeData.name}
                    width={500}
                    height={500}
                    className="w-[16px] h-[16px] min-[400px]:w-[18px] min-[400px]:h-[18px] sm:w-[26px] sm:h-[26px] md:w-[35px] md:h-[35px] lg:w-[42px] lg:h-[42px]"
                  />
                ) : (
                  <div className="bg-primary-green rounded-full p-0.5 md:p-1.5 flex items-center justify-center">
                    <selectedTravelTypeData.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-text" />
                  </div>
                )}
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-700 mr-1 md:mx-2 cursor-pointer" />
              </button>
              {airplaneOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-40 sm:w-44 bg-white rounded-lg overflow-hidden shadow-lg z-10 p-2">
                  {travelTypes.map((travelType, index) => (
                    <div
                      key={index}
                      onClick={() => handleTravelTypeSelect(travelType.name)}
                      className="flex items-center justify-between text-primary-text text-xs sm:text-sm gap-2 px-2 py-2.5 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 text-primary-text text-xs sm:text-sm">
                        {travelType.image ? (
                          <Image
                            src={travelType.image}
                            alt={travelType.name}
                            width={16}
                            height={16}
                            className="w-4 h-4 flex-shrink-0"
                          />
                        ) : (
                          <travelType.icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {travelType.name}
                        </span>
                      </div>
                      {selectedTravelType === travelType.name && (
                        <Check className="w-4 h-4 text-primary-text flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Language dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={handleLanguageToggle}
                className="flex items-center gap-1 bg-gray-50 hover:bg-white transition-colors duration-300 rounded-full p-0.5 md:p-1"
              >
                <div className="overflow-hidden rounded-full h-6 w-6 md:h-9 md:w-9">
                  <Image
                    src={selectedFlagData.flag}
                    alt={selectedFlagData.name}
                    width={90}
                    height={90}
                    className="w-full h-full"
                  />
                </div>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-700 mr-1 md:mx-2 cursor-pointer" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-1 w-40 sm:w-44 bg-white rounded-lg overflow-hidden shadow-lg z-10 p-2">
                  {flag.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleLanguageSelect(item.countryCode)}
                      className="flex items-center justify-between text-primary-text text-xs sm:text-sm gap-2 px-2 py-2.5 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center text-primary-text text-xs sm:text-sm gap-2 sm:gap-3 truncate">
                        <Image
                          src={item.flag}
                          alt={item.name}
                          width={20}
                          height={20}
                          className="rounded-full w-[16px] h-[16px] sm:w-[20px] sm:h-[20px] flex-shrink-0"
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {selectedLanguage === item.countryCode && (
                        <Check className="w-4 h-4 text-primary-text flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User dropdown content */}
            <div className="relative" ref={userRef}>
              <button
                onClick={handleUserToggle}
                className="flex items-center gap-1 bg-gray-50  hover:bg-white transition-colors duration-300 rounded-full p-0.5 md:p-1"
              >
                {status === "authenticated" || isCustomAuth ? (
                  // Show user icon for authenticated users
                  <div className="w-6 h-6 md:w-9 md:h-9  bg-primary-green rounded-full flex items-center justify-center">
                    <Image
                      src="/st-images/user/loginuser.png"
                      alt="User"
                      width={16}
                      height={16}
                      className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                    />
                  </div>
                ) : (
                  // Show "SIGN IN" text for non-authenticated users
                  <div className="px-2 md:px-3 py-1 md:py-1.5">
                    <span className="text-[10px] md:text-sm font-medium text-primary-text whitespace-nowrap">
                      SIGN IN
                    </span>
                  </div>
                )}
                {status === "authenticated" || isCustomAuth ? (
                  <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-700 mr-1 md:mx-2 cursor-pointer" />
                ) : null}
              </button>

              {/* User dropdown content */}
              {userOpen && (status === "authenticated" || isCustomAuth) && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-10 border border-gray-100 overflow-hidden">
                  {/* User Info Header */}
                  <div className="bg-gradient-to-r from-primary-green/5 to-primary-green/10 p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-primary-green/80 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-primary-text font-semibold text-sm">
                          {(
                            session?.user?.name ||
                            customUser?.name ||
                            customUser?.email ||
                            "U"
                          )
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-gray-900 font-semibold text-sm truncate">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-gray-500 text-xs truncate">
                          {session?.user?.email || customUser?.email || ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link href="/dashboard/booking">
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium text-sm">
                            My Bookings
                          </span>
                          <span className="text-gray-500 text-xs">
                            View your travel history
                          </span>
                        </div>
                        <div className="ml-auto">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Logout Button */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-red-600 font-medium text-sm group-hover:text-red-700">
                          Sign Out
                        </span>
                        <span className="text-gray-500 text-xs">
                          End your session
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Search Box */}
      </Container>

      {/* Auth Modal */}
      {showAuthModal && (
        <ModernAuthForm
          setShowAuthModal={setShowAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </FullContainer>
  );
}
