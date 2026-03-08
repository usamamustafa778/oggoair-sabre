import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Check, ChevronDownIcon } from "lucide-react";
import { countries } from "../../data/countries";
import Image from "next/image";
import { formatPriceInEur } from "../../utils/priceConverter";

export default function ReviewAndPayBody({ bookingDetails, loading, error }) {
  const router = useRouter();
  const [checkConditions, setCheckConditions] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [discountsExpanded, setDiscountsExpanded] = useState(true);
  const [passengersExpanded, setPassengersExpanded] = useState(true);

  const handlePayment = async () => {
    if (!checkConditions) {
      alert("Please accept the terms and conditions");
      return;
    }

    try {
      setProcessingPayment(true);
      // Calculate actual amount in cents from booking details
      const totalAmount =
        bookingDetails.payment?.totalAmount ||
        bookingDetails.bookingDetails?.total_amount ||
        0;
      const amountInCents = Math.round(totalAmount * 100); // Convert dollars to cents

      // Construct redirect URL with process ID and booking ID
      const flightId = router.query.id || bookingDetails._id;
      const bookingId = bookingDetails._id;

      // Use payment domain for redirect URL
      const paymentBaseUrl = process.env.NEXT_PUBLIC_PAYMENT_URL || "https://payment.oggotrip.com";
      const redirectUrl = `${paymentBaseUrl}/flight/confirmation?id=${flightId}&booking_id=${bookingId}`;

      const createOrderRes = await axios.post(
        `/api/payments/revolut/create-order`,
        {
          amount: 100,
          // amount: amountInCents,
          currency: "EUR",
          metadata: { bookingId: bookingDetails._id, flightId },
          redirect_url: redirectUrl,
        }
      );

      if (createOrderRes.data?.success && createOrderRes.data?.data) {
        const checkoutUrl = createOrderRes.data.data.checkout_url;

        // Redirect directly to Revolut hosted checkout
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          alert("Revolut Pay checkout URL not available.");
        }
      } else {
        throw new Error(
          createOrderRes.data?.message || "Payment failed - no order created"
        );
      }
    } catch (error) {
      console.error("Payment error:", error);

      // Show more detailed error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.message ||
        "Payment failed. Please try again.";

      alert(`Payment Error: ${errorMessage}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No booking details found.
      </div>
    );
  }

  // Ensure bookingDetails.bookingDetails exists (old project structure)
  if (!bookingDetails.bookingDetails) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Invalid booking details structure.
      </div>
    );
  }

  // Use countries from data file instead of hardcoded list
  const coundtydata = countries.map((country) => ({
    code: country.code,
    name: country.name,
    dialCode: country.dialCode,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white space-y-5 flex flex-col shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl p-5 mb-6 text-primary-text">
        <h2 className="text-2xl font-bold text-primary-text">Review & Pay</h2>

        <div className="border-2 flex flex-row gap-2 border-gray-300 rounded-xl p-6">
          <Image
            src="/st-images/user2.png"
            alt="passport"
            width={100}
            height={100}
            className="h-6 w-auto"
          />
          <span className=" text-[16px] text-primary-text">
            These passenger details must match your Passport or Photo ID
          </span>
        </div>
        {/* flight details */}
        {/* Current Search Cards */}
        <div className="flex flex-col  gap-4 sm:gap-6">
          {/* First card - One way */}
          <div className="bg-[#f9f9fb] border-2 border-gray-200 sm  rounded-[10px] sm:rounded-2xl">
            <div className=" rounded-lg border-2 border-white sm:rounded-xl  px-4 sm:px-7 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src="/st-images/flightSearch/flight.png"
                  alt="Flight"
                  width={26}
                  height={26}
                  className="text-gray-800 w-[20px] sm:w-[24px] h-auto"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base sm:text-lg lg:text-xl text-primary-text mb-1 sm:mb-3 leading-tight">
                    <span className="block sm:inline">New York (JFK)</span>
                    <span className="hidden sm:inline"> → </span>
                    <span className="block sm:inline sm:ml-1">
                      London (LHR)
                    </span>
                  </div>
                  <div className="text-sm sm:text-base text-primary-text leading-tight">
                    Dec 15, 2024 | 1 Passenger | Economy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Passenger Information and Extras Card */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h2 className="text-xl font-semibold text-primary-text mb-6">
            Passenger information and extras
          </h2>

          {/* Divider */}
          <hr className="border-gray-300 mb-6" />

          {/* Personal Details Section */}
          <div className="mb-4">
            <h3 className="text-base font text-primary-text mb-4">
              Personal details
            </h3>

            {(() => {
              // Get passenger data from localStorage
              const passengerSnapshot = localStorage.getItem("passenger_data");
              let personalData = {
                name: "John Doe",
                passport: "AB1234567",
                dateOfBirth: "01/01/1990 (Male)",
                expiry: "Expiry. 01/01/2030",
                country: "Andorra",
              };

              if (passengerSnapshot) {
                try {
                  const parsed = JSON.parse(passengerSnapshot);
                  const mainPassenger = parsed?.passengersInfo?.[0];
                  if (mainPassenger) {
                    personalData = {
                      name:
                        `${mainPassenger.firstName || ""} ${
                          mainPassenger.lastName || ""
                        }`.trim() || "John Doe",
                      passport: mainPassenger.passport || "AB1234567",
                      dateOfBirth: mainPassenger.dateOfBirth
                        ? `${mainPassenger.dateOfBirth} (${
                            mainPassenger.gender === "Mrs/Ms"
                              ? "Female"
                              : "Male"
                          })`
                        : "01/01/1990 (Male)",
                      expiry: mainPassenger.passportExpiryDate
                        ? `Expiry. ${mainPassenger.passportExpiryDate}`
                        : "Expiry. 01/01/2030",
                      country: mainPassenger.cityzenShip || "Andorra",
                    };
                  }
                } catch (error) {
                  console.error("Error parsing passenger data:", error);
                }
              }

              // Find country code from country name
              const countryData =
                coundtydata.find((c) => c.name === personalData.country) ||
                coundtydata[0];

              return (
                <div className="grid grid-cols-1 text-[16.5px] md:grid-cols-3 gap-2">
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/payment/user.png"
                      alt="user"
                      width={20}
                      height={20}
                    />
                    <span className="text-primary-text">
                      {personalData.name}
                    </span>
                  </div>

                  {/* Passport */}
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/payment/passport.png"
                      alt="passport"
                      width={20}
                      height={20}
                    />
                    <span className="text-primary-text">
                      {personalData.passport}
                    </span>
                  </div>

                  {/* Country */}
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/${countryData.code.toLowerCase()}.svg`}
                      alt={countryData.name}
                      className="w-6 h-6 rounded"
                    />
                    <span className="text-primary-text ml-1">
                      {countryData.name}
                    </span>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/payment/calendar.png"
                      alt="date-of-birth"
                      width={20}
                      height={20}
                    />
                    <span className="text-primary-text ">
                      {personalData.dateOfBirth}
                    </span>
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/payment/expiry.png"
                      alt="expiry"
                      width={20}
                      height={20}
                    />
                    <span className="text-primary-text ">
                      {personalData.expiry}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Contact Details Card */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h2 className="text-xl font-semibold text-primary-text mb-6">
            Contact details
          </h2>

          {/* Divider */}
          <hr className="border-gray-300 mb-6" />

          {(() => {
            // Get contact data from localStorage
            const passengerSnapshot = localStorage.getItem("passenger_data");
            let contactData = {
              email: "user@example.com",
              phone: "123456789",
              dialCode: "+376",
            };
            let selectedCountry = coundtydata[0];

            if (passengerSnapshot) {
              try {
                const parsed = JSON.parse(passengerSnapshot);
                if (parsed?.contact) {
                  contactData = {
                    email: parsed.contact.email || "user@example.com",
                    phone: parsed.contact.phoneNumber || "123456789",
                    dialCode: parsed.contact.dialCode || "+376",
                  };
                } else {
                  // Fallback to passenger data if contact is not available
                  const mainPassenger = parsed?.passengersInfo?.[0];
                  if (mainPassenger) {
                    contactData = {
                      email: mainPassenger.email || "user@example.com",
                      phone: mainPassenger.phoneNumber || "123456789",
                      dialCode: mainPassenger.dialCode || "+376",
                    };
                  }
                }

                // Find country by dial code
                const countryByDialCode = coundtydata.find(
                  (c) => c.dialCode === contactData.dialCode
                );
                if (countryByDialCode) {
                  selectedCountry = countryByDialCode;
                }
              } catch (error) {
                console.error("Error parsing contact data:", error);
              }
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ">
                <div className="flex flex-col md:flex-row md:col-span-3 gap-4 mb-4">
                  <div className="w-full max-w-[260px]">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email address
                    </label>
                    <div className="w-full px-3 py-3.5 border border-gray-100 bg-gray-50 text-sm rounded-xl text-primary-text font-medium">
                      {contactData.email}
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex gap-0.5">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Dialing code
                        </label>
                        <div className="w-[125px] relative">
                          <div className="w-full px-3 h-[50px] border border-gray-100 bg-gray-50 text-sm rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`}
                                alt={selectedCountry.name}
                                className="w-6 h-6 rounded"
                              />
                              <span className="text-primary-text font-medium">
                                {selectedCountry.dialCode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Phone number
                        </label>
                        <div className="w-full px-3 py-3.5 border border-gray-100 bg-gray-50 text-sm rounded-xl text-primary-text font-medium">
                          {contactData.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SMS Updates Checkbox */}
          <div className="flex items-center gap-3 mt-6">
            <div className="w-5 h-5 bg-primary-green  rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-text" />
            </div>
            <span className="text-gray-500 tracking-widest text-base">
              I want to receive SMS updates about my trip.
            </span>
          </div>
        </div>

        {/* oggotrip.com Benefits Card */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-primary-text">
              oggotrip.com benefits
            </h2>
            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded text-sm font-medium">
              Included
            </span>
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5">
            {/* Disruption Protection */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center ">
                <Image
                  src="/st-images/payment/bene1.png"
                  alt="disruption"
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-base  text-primary-text">
                Disruption Protection
              </span>
            </div>

            {/* Digital Boarding Pass */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center ">
                <Image
                  src="/st-images/payment/bene2.png"
                  alt="disruption"
                  width={18}
                  height={18}
                />
              </div>
              <span className="text-base  text-primary-text">
                Digital Boarding Pass
              </span>
            </div>

            {/* Premium services */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center ">
                <Image
                  src="/st-images/payment/bene3.png"
                  alt="disruption"
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-base  text-primary-text">
                Premium services
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300 my-6" />

          {/* Baggage Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary-text">
                Baggage
              </h3>
              <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded text-sm font-medium">
                Included
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center ">
                <Image
                  src="/st-images/payment/bene4.png"
                  alt="disruption"
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-base text-primary-text">
                1x Personal item
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300 my-6" />

          {/* Travel Insurance Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary-text">
                Travel insurance
              </h3>
              <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded text-sm font-medium">
                Included
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center ">
                <Image
                  src="/st-images/payment/bene5.png"
                  alt="disruption"
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-base text-primary-text">
                1x Travel Plus
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300 my-6" />

          {/* Ticket Type Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary-text">
                Ticket type and service package
              </h3>
              <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded text-sm font-medium">
                Included
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center ">
                <Image
                  src="/st-images/payment/bene6.png"
                  alt="disruption"
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-base  text-primary-text">
                1x Standard ticket
              </span>
            </div>
          </div>
        </div>

        {/* Discounts Card */}
        <div className="bg-white rounded-xl border-2 border-gray-300 p-5 shadow-sm">
          <div
            className="flex items-center justify-between "
            onClick={() => setDiscountsExpanded(!discountsExpanded)}
          >
            <h2 className="text-base font-semibold text-primary-text">
              Discounts
            </h2>
            <button className="text-primary-text hover:text-primary-text/80 transition-transform duration-200">
              <svg
                className={`w-5 h-5 transition-transform duration-200 cursor-pointer ${
                  discountsExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          {discountsExpanded && (
            <div className="space-y-4 border-t border-gray-300 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="discount" className="w-5 h-5" />
                <span className="font-light text-sm text-primary-text tracking-tight">
                  Use a voucher code
                </span>
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Enter voucher code"
                />
                <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-secondary-green text-primary-text rounded-md ">
                  Apply voucher
                </button>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="discount" className="w-5 h-5" />
                <span className="font-light text-sm text-primary-text tracking-tight">
                  Don't use a discount
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-xl border-2 border-gray-300 p-5 shadow-sm">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setPassengersExpanded(!passengersExpanded)}
          >
            <h2 className="text-base font-semibold text-primary-text flex items-center gap-2">
              <Image
                src="/st-images/user2.png"
                alt="Passenger"
                width={24}
                height={24}
              />
              {bookingDetails.bookingDetails.passengers
                ? bookingDetails.bookingDetails.passengers.length
                : 1}{" "}
              passenger
              {bookingDetails.bookingDetails.passengers &&
              bookingDetails.bookingDetails.passengers.length > 1
                ? "s"
                : ""}
            </h2>
            <button className="text-primary-text hover:text-primary-text/80 transition-transform duration-200">
              <ChevronDownIcon
                className={`w-5 h-5 text-primary-text transition-transform duration-200 cursor-pointer ${
                  passengersExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          {passengersExpanded && (
            <div className="space-y-3 pt-2 mt-4">
              {bookingDetails.bookingDetails.passengers &&
              bookingDetails.bookingDetails.passengers.length > 0 ? (
                bookingDetails.bookingDetails.passengers.map(
                  (passenger, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-primary-text text-base font-medium">
                        {passenger.type === "adult"
                          ? "Adult"
                          : passenger.type === "child"
                          ? "Child"
                          : "Infant"}{" "}
                        {index + 1}
                      </span>
                      <span className="font-medium text-primary-text">
                        {formatPriceInEur(
                          bookingDetails.bookingDetails.total_amount
                        )}
                      </span>
                    </div>
                  )
                )
              ) : (
                <div className="flex justify-between">
                  <span className="text-primary-text text-base font-medium">
                    Passenger
                  </span>
                  <span className="font-medium text-primary-text">
                    {formatPriceInEur(
                      bookingDetails.bookingDetails.total_amount
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between ">
                <span className="text-primary-text text-base font-medium">
                  Agency fee
                </span>
                <span className="font-medium text-primary-text">
                  {formatPriceInEur(
                    bookingDetails.payment?.comissionAmount || "20.00"
                  )}
                </span>
              </div>
              <div className="flex justify-between ">
                <span className="text-primary-text text-base font-medium">
                  Tickets x{" "}
                  {bookingDetails.bookingDetails.passengers
                    ? bookingDetails.bookingDetails.passengers.length
                    : 1}
                </span>
                <span className="font-medium text-primary-text text-base">
                  {formatPriceInEur(bookingDetails.bookingDetails.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-primary-text text-base font-medium pt-2">
                <span className="text-sm">
                  {" "}
                  <span className="font-bold text-base">Total</span> (taxes
                  included)
                </span>
                <span>
                  {formatPriceInEur(
                    bookingDetails.payment?.totalAmount ||
                      bookingDetails.bookingDetails.total_amount
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}

        <div>
          <h2 className="text-base font-semibold text-primary-text mb-4">
            By clicking pay:
          </h2>
          <div className="space-y-2.5 font-medium ">
            <label className="flex items-center gap-1 cursor-pointer">
              <div className="w-1.5 h-1.5 text-primary-text bg-primary-text rounded-full "></div>
              <div className="text-sm text-primary-text">
                <p>
                  I accept the{" "}
                  <span className="text-red-500">
                    terms and conditions of Oggoair{" "}
                  </span>{" "}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <div className="w-1.5 h-1.5 text-primary-text bg-primary-text rounded-full "></div>
              <div className="text-sm text-primary-text">
                <p>
                  I agree to the processing and use of my data in accordance
                  with the <span className="text-red-500">Oggoair privacy</span>{" "}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkConditions}
                onChange={(e) => setCheckConditions(e.target.checked)}
                className="mt-1 scale-175"
              />
              <div className="text-sm text-primary-text">
                <p>
                  I confirm that by booking a Ryanair flight as part of my Omio
                  Offer, I have read and accepted Ryanair's{" "}
                  <span className="text-red-500">
                    {" "}
                    General Terms and Conditions of Carriage, Website Terms,
                    Cookie Policy, Privacy Statement
                  </span>{" "}
                  and <span className="text-red-500">Notice</span>, I also
                  acknowledge that I will need to log into or create a myRyanair
                  account in order to manage my booking.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <div className="w-1.5 h-1.5 text-primary-text bg-primary-text rounded-full "></div>
              <div className="text-sm text-primary-text">
                <p>
                  I accept the{" "}
                  <span className="text-red-500">terms and conditions </span> of
                  easyjet
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-between mt-7">
        <button
          onClick={() => router.push("/flight/extraService")}
          className="bg-gray-200 text-primary-text px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Back
        </button>
        <button
          onClick={handlePayment}
          disabled={!checkConditions || processingPayment}
          className="bg-primary-text text-primary-green cursor-pointer active:scale-90 transition-all duration-300 px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processingPayment ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}
