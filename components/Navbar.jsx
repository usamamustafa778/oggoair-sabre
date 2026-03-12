import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
import {
  Check,
  ChevronDown,
  User,
  Menu,
} from "lucide-react";
import Link from "next/link";
import ModernAuthForm from "./Login/ModernAuthForm";
import { useSession, signOut } from "next-auth/react";
import { tokenUtils } from "@/config/api";
import {
  getSelectedCurrency,
  setSelectedCurrency,
  CURRENCIES,
} from "@/utils/priceConverter";

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("US");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCustomAuth, setIsCustomAuth] = useState(false);
  const [customUser, setCustomUser] = useState(null);
  const { data: session, status } = useSession();
  const [navTick, setNavTick] = useState(0);
  const [selectedCurrency, setSelectedCurrencyState] = useState("EUR");
  const langRef = useRef(null);
  const userRef = useRef(null);

  const regions = [
    { countryCode: "US", region: "Global", language: "English", flag: "/st-images/flags/usa.png" },
    { countryCode: "RO", region: "Romania", language: "Romanian", flag: "/st-images/flags/romania.png" },
    { countryCode: "MD", region: "Moldova", language: "Romanian", flag: "/st-images/flags/mdl.png" },
    { countryCode: "TR", region: "Türkiye", language: "Türkçe", flag: "/st-images/flags/turkey.png" },
    { countryCode: "JO", region: "Jordan", language: "العربية", flag: "/st-images/flags/jordan.png" },
    { countryCode: "RW", region: "Rwanda", language: "English", flag: "/st-images/flags/rwanda.png" },
  ];

  const PRIMARY_CURRENCY_CODES = ["EUR", "USD", "RON", "MDL", "TRY", "JOD", "RWF"];
  const CURRENCY_FLAGS = {
    EUR: "/st-images/flags/eur.png",
    USD: "/st-images/flags/usa.png",
    RON: "/st-images/flags/romania.png",
    MDL: "/st-images/flags/mdl.png",
    TRY: "/st-images/flags/turkey.png",
    JOD: "/st-images/flags/jordan.png",
    RWF: "/st-images/flags/rwanda.png",
  };

  const selectedFlagData = regions.find(
    (item) => item.countryCode === selectedLanguage
  );

  const handleLanguageSelect = (countryCode) => {
    setSelectedLanguage(countryCode);
    setLangOpen(false);
  };

  const handleCurrencySelect = (currencyCode) => {
    setSelectedCurrencyState(currencyCode);
    setSelectedCurrency(currencyCode);
    setCurrencyOpen(false);
  };

  const handleUserToggle = () => {
    if (status === "authenticated" || isCustomAuth) {
      setUserOpen(!userOpen);
      setLangOpen(false);
      setCurrencyOpen(false);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLanguageToggle = (e) => {
    e.stopPropagation();
    setLangOpen(!langOpen);
    setCurrencyOpen(false);
    setUserOpen(false);
  };

  const handleCurrencyToggle = (e) => {
    e.stopPropagation();
    setCurrencyOpen(!currencyOpen);
    setLangOpen(false);
    setUserOpen(false);
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
    if (typeof window !== "undefined") {
      setSelectedCurrencyState(getSelectedCurrency());
    }
  }, [navTick]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
        setCurrencyOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserOpen(false);
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
      className={`transition-all duration-300 fixed top-0 left-0 right-0 !h-fit z-[9999] pb-2 ${
        isScrolled
          ? "bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.08)] py-2"
          : "bg-white min-[400px]:pt-4 sm:pt-6 md:pt-8"
      }`}
    >
      <Container className="flex flex-col px-2 min-[400px]:px-3 sm:px-4 md:px-6">
        {/* Navbar */}
        <div className="flex justify-between items-center min-h-[45px] min-[400px]:min-h-[50px] sm:min-h-[60px] md:min-h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="oggoair"
              width={600}
              height={600}
              className={`w-[95px] min-[400px]:w-[110px] sm:w-[150px] md:w-[175px] lg:w-[200px] transition-all duration-300`}
            />
          </Link>

          {/* Right controls: Region/Language → Currency → Sign in → User → Menu */}
          <div className="items-center flex gap-2 sm:gap-3 flex-shrink-0">
            {/* Region / Language – separate button */}
            <div className="relative" ref={langRef}>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleLanguageToggle}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 transition-colors duration-200 rounded-full border border-gray-300 text-[#132968]"
                >
                  {selectedFlagData && (
                    <>
                      <span className="text-xs sm:text-sm font-semibold">
                        {selectedFlagData.language}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCurrencyToggle}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 transition-colors duration-200 rounded-full border border-gray-300 text-[#132968]"
                >
                  <span className="text-xs sm:text-sm font-semibold">
                    {selectedCurrency}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                </button>
              </div>

              {/* Region & Language dropdown */}
              {langOpen && (
                <div className="absolute left-0 mt-3 w-[300px] sm:w-[340px] z-10">
                  <div className="bg-[#F5F7FB] rounded-2xl shadow-2xl border border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
                    <h3 className="text-base sm:text-lg font-semibold text-[#132968]">
                      Region &amp; Language
                    </h3>
                    <div className="mt-2 h-[2px] w-12 bg-[#132968]" />
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Suggested region and language
                    </p>
                    <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                      {regions.map((item) => {
                        const isActive = selectedLanguage === item.countryCode;
                        return (
                          <button
                            key={item.countryCode}
                            type="button"
                            onClick={() => handleLanguageSelect(item.countryCode)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-white transition-all border ${
                              isActive
                                ? "border-[#13296833] shadow-md"
                                : "border-transparent shadow-sm hover:shadow-md hover:border-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={item.flag}
                                alt={item.region}
                                width={28}
                                height={20}
                                className="w-8 h-6 rounded-md object-contain flex-shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-[#132968] truncate">
                                  {item.region}
                                </span>
                                <span className="text-xs text-slate-500 truncate">
                                  {item.language}
                                </span>
                              </div>
                            </div>
                            {isActive && (
                              <Check className="w-4 h-4 text-[#132968] flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Currency dropdown */}
              {currencyOpen && (
                <div className="absolute right-0 mt-3 w-[200px] sm:w-[220px] z-10">
                  <div className="bg-[#F5F7FB] rounded-2xl shadow-2xl border border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
                    <h3 className="text-base sm:text-lg font-semibold text-[#132968]">
                      Currency
                    </h3>
                    <div className="mt-2 h-[2px] w-12 bg-[#132968]" />
                    <div className="mt-4 flex flex-col gap-2">
                      {PRIMARY_CURRENCY_CODES.map((code) => {
                        const currency =
                          Object.values(CURRENCIES).find((c) => c.code === code) || { code };
                        const isCurrActive = selectedCurrency === currency.code;
                        const currencyFlag = CURRENCY_FLAGS[code];

                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleCurrencySelect(currency.code)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-2xl bg-white border transition-all ${
                              isCurrActive
                                ? "border-[#13296833] shadow-md"
                                : "border-transparent shadow-sm hover:shadow-md hover:border-slate-100"
                            }`}
                          >
                            {currencyFlag ? (
                              <Image
                                src={currencyFlag}
                                alt={currency.code}
                                width={26}
                                height={18}
                                className="w-8 h-6 rounded-md object-contain flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500 flex-shrink-0">
                                {code.slice(0, 2)}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-slate-600">
                              {code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sign in - between Language and User */}
            {!(status === "authenticated" || isCustomAuth) && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 transition-colors duration-300 rounded-full border border-gray-300 text-sm font-medium text-primary-text"
              >
                Sign in
              </button>
            )}

            {/* User / Profile - only when signed in */}
            {(status === "authenticated" || isCustomAuth) && (
            <div className="relative" ref={userRef}>
              <button
                onClick={handleUserToggle}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border bg-gray-100 hover:bg-gray-200 border-gray-300 transition-colors duration-300"
              >
                <div className="bg-[#D4FF5A] rounded-full p-1.5 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-text" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
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
                  <Link href="/dashboard/bookings?tab=upcoming">
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
            )}

            {/* Hamburger - lime-green circle */}
            <button
              className="w-11 h-11 rounded-full bg-[#D4FF5A] flex items-center justify-center hover:bg-[#b8e84d] transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-primary-text" />
            </button>
          </div>
        </div>
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
