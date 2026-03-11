import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import Rightbar from "../../components/Booking.jsx/layout";
import { useSession } from "next-auth/react";
import { BACKEND_API_URL, tokenUtils } from "../../config/api";
import Seo from "@/components/Seo";

export default function ReferAFriendPage() {
  const { data: session } = useSession();
  const [emailAddresses, setEmailAddresses] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [applying, setApplying] = useState(false);
  const [userData, setUserData] = useState(null);
  const [origin, setOrigin] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
  });

  const userName = userData?.firstName || session?.user?.name || "Friend";
  const userId = userData?.id || session?.user?.id || "";
  const referralCode = userData?.referralCode;
  const referralLink =
    referralCode && origin
      ? `${origin}/signup?ref=${referralCode}`
      : userId && origin
        ? `${origin}/signup?ref=${userId}`
        : "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchUserData();
    fetchReferralStats();
  }, []);

  const safeJson = async (response) => {
    const contentType = response.headers?.get?.("content-type") || "";
    if (contentType.includes("application/json")) return response.json();
    const text = await response.text().catch(() => "");
    throw new Error(
      `Expected JSON but got "${contentType || "unknown"}" (status ${
        response.status
      }). ${text ? `Body starts: ${text.slice(0, 80)}` : ""}`
    );
  };

  const fetchUserData = async () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) return;

      const response = await fetch(`${BACKEND_API_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await safeJson(response);
      if (response.ok && data?.data?.user) {
        setUserData(data.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) return;

      // This would be your actual referral stats API endpoint
      const response = await fetch(`${BACKEND_API_URL}/api/referrals/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await safeJson(response);
        setReferralStats(data.data || referralStats);
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    }
  };

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendInvites = async () => {
    if (!emailAddresses.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    const emails = emailAddresses
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    if (emails.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    if (emails.length > 5) {
      toast.error("Maximum 5 emails per request");
      return;
    }

    setSending(true);
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        toast.error("Please log in again to send invites. Your session may have expired.");
        setSending(false);
        return;
      }

      // Use same-origin API route to avoid CORS / Failed to fetch
      const apiUrl =
        typeof window !== "undefined"
          ? "/api/referrals/invite"
          : `${BACKEND_API_URL}/api/referrals/invite`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ emails }),
      });

      let data;
      try {
        data = await safeJson(response);
      } catch (parseError) {
        console.error("Invalid API response:", parseError);
        toast.error("Server returned an invalid response. Please try again.");
        setSending(false);
        return;
      }

      if (response.ok && data.success) {
        toast.success("Invites sent successfully!");
        setEmailAddresses("");
        fetchUserData();
        fetchReferralStats();
      } else {
        const msg = data?.message || "Failed to send invites";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error sending invites:", error);
      const isNetworkError =
        error?.message?.includes("fetch") ||
        error?.name === "TypeError" ||
        error?.message?.includes("NetworkError");
      toast.error(
        isNetworkError
          ? "Unable to connect. Check that the backend is running and try again."
          : "Failed to send invites. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleConfirmInvite = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setApplying(true);
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`${BACKEND_API_URL}/api/referrals/apply-code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code: inviteCode,
        }),
      });

      const data = await safeJson(response);

      if (response.ok) {
        toast.success("Invite code applied successfully! You'll receive €10 off your first booking.");
        setInviteCode("");
      } else {
        toast.error(data.message || "Invalid or expired invite code");
      }
    } catch (error) {
      console.error("Error applying invite code:", error);
      toast.error("Failed to apply invite code. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleShareSocial = (platform) => {
    const text = `Join me on OGGO Air and get €10 off your first booking!`;
    const url = referralLink;

    if (!url) {
      toast.error("Please wait while we load your referral link");
      return;
    }

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      default:
        break;
    }
  };

  return (
    <DashboardLayout>
      <Seo title="Refer a Friend" noindex />
      <Rightbar>
        <div className="w-full space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="text-primary-text bg-gradient-to-r from-primary-green to-primary-green/80 px-6 py-8">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                  <svg
                    className="w-8 h-8 "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Refer a Friend</h1>
                  <p className="leading-relaxed">
                    Earn <span className="font-bold">€10</span> for each friend who books. They get{" "}
                    <span className="font-bold">€10 off</span> too!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {referralStats.totalReferrals > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Referrals: </span>
                    <span className="font-semibold text-gray-900">
                      {referralStats.successfulReferrals}/{referralStats.totalReferrals}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Earned: </span>
                    <span className="font-semibold text-primary-green">
                      €{referralStats.totalEarned}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Share Your Link */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Share Your Referral Link</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={referralLink || "Loading..."}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  disabled={!referralLink}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex-shrink-0 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-primary-green text-primary-text hover:bg-primary-green/90"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-gray-600">Share:</span>
                <button
                  onClick={() => handleShareSocial("whatsapp")}
                  disabled={!referralLink}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShareSocial("facebook")}
                  disabled={!referralLink}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShareSocial("twitter")}
                  disabled={!referralLink}
                  className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Email Invites & Redeem Code - Combined */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send Invites */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Send Invites</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="friend@example.com, another@example.com"
                  value={emailAddresses}
                  onChange={(e) => setEmailAddresses(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all text-gray-900"
                />
                <button
                  onClick={handleSendInvites}
                  disabled={sending || !referralLink}
                  className="w-full px-6 py-3 bg-primary-green text-primary-text rounded-lg font-semibold hover:bg-primary-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Email Invites"}
                </button>
              </div>
            </div>

            {/* Redeem Code */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Have a Code?</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all text-gray-900"
                />
                <button
                  onClick={handleConfirmInvite}
                  disabled={applying}
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Applying..." : "Apply Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Rightbar>
    </DashboardLayout>
  );
}

