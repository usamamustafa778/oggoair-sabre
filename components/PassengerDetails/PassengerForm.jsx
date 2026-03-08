import React from "react";
import { Shield } from "lucide-react";
import InstructionBox from "./InstructionBox";
import UserInfoBox from "./UserInfoBox";

const PassengerForm = ({ passenger, onUpdate, onDateUpdate }) => {
  const updatePassenger = (field, value) => {
    onUpdate(passenger.id, field, value);
  };

  const updateDateField = (dateType, field, value) => {
    onDateUpdate(passenger.id, dateType, field, value);
  };

  return (
    <div className="bg-[#F7F7F9] rounded-lg p-5 space-y-3">
      {passenger.type === "Main passenger" && (
        <UserInfoBox userName="KHURRAM IQBAL" />
      )}
      {passenger.type === "Main passenger" && <InstructionBox />}
      <div className="bg-[#F7F7F9] border-2 border-white rounded-xl text-primary-text px-4 py-3">
        <div className="flex items-center justify-between mb-6 ">
          <h3 className="text-lg font-semibold text-primary-text">
            {passenger.type}
            {passenger.age && (
              <span className="ml-2 text-sm text-gray-600">
                ({passenger.ageType} (Age: {passenger.age}))
              </span>
            )}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-1.5">
          {/* Email (only for main passenger) */}
          <div className="flex flex-col md:flex-row md:col-span-2 gap-4">
            {passenger.type === "Main passenger" && (
              <div className="w-full max-w-[250px]">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={passenger.email}
                  onChange={(e) => updatePassenger("email", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-100 bg-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Phone (only for main passenger) */}
            {passenger.type === "Main passenger" && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Phone number
                </label>
                <div className="flex gap-0.5">
                  <div className="flex items-center gap-2 px-3 py-3 border border-gray-100 bg-white rounded-xl">
                    <span className="text-sm">🇵🇹</span>
                    <span className="text-sm">+351</span>
                  </div>
                  <input
                    type="tel"
                    value={passenger.phone.replace("+351 ", "")}
                    onChange={(e) =>
                      updatePassenger("phone", `+351 ${e.target.value}`)
                    }
                    className="flex-1 px-3 py-3 border border-gray-100 bg-white text-sm rounded-xl w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4  border-gray-300 border-t md:col-span-2 md:pt-8">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`gender-${passenger.id}`}
                value="Mr"
                checked={passenger.gender === "Mr"}
                onChange={(e) => updatePassenger("gender", e.target.value)}
                className="w-6 h-6"
              />
              <span className="text-sm">Mr</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`gender-${passenger.id}`}
                value="Mrs/Ms"
                checked={passenger.gender === "Mrs/Ms"}
                onChange={(e) => updatePassenger("gender", e.target.value)}
                className="w-6 h-6"
              />
              <span className="text-sm">Mrs/Ms</span>
            </label>
          </div>

          {/* Select Passenger */}
          <div className="flex flex-col md:flex-row md:col-span-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Select Passenger
              </label>
              <select className="w-full px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>KHURRAM IQBAL</option>
              </select>
            </div>

            {/* First Name */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First name
              </label>
              <input
                type="text"
                value={passenger.firstName}
                onChange={(e) => updatePassenger("firstName", e.target.value)}
                className="w-full px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Last name
              </label>
              <input
                type="text"
                value={passenger.lastName}
                onChange={(e) => updatePassenger("lastName", e.target.value)}
                className="w-full px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Date of birth
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DD"
                value={passenger.dateOfBirth.day}
                onChange={(e) =>
                  updateDateField("dateOfBirth", "day", e.target.value)
                }
                className="w-1/3 px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={passenger.dateOfBirth.month || ""}
                onChange={(e) =>
                  updateDateField("dateOfBirth", "month", e.target.value)
                }
                className="w-1/3 px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="" disabled>
                  Month
                </option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <input
                type="text"
                placeholder="YYYY"
                value={passenger.dateOfBirth.year}
                onChange={(e) =>
                  updateDateField("dateOfBirth", "year", e.target.value)
                }
                className="w-1/3 px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Country/region of residence
            </label>
            <div className="flex items-center gap-2 px-3 py-3 border border-gray-100 bg-white rounded-lg">
              <span className="text-sm">🇳🇱</span>
              <span className="text-sm">{passenger.country}</span>
            </div>
          </div>

          {/* Passport Number */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Passport No.
            </label>
            <input
              type="text"
              value={passenger.passportNo}
              onChange={(e) => updatePassenger("passportNo", e.target.value)}
              className="w-full px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Passport Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Passport Expiry
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DD"
                value={passenger.passportExpiry.day}
                onChange={(e) =>
                  updateDateField("passportExpiry", "day", e.target.value)
                }
                className="w-1/3 px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={passenger.passportExpiry.month || ""}
                onChange={(e) =>
                  updateDateField("passportExpiry", "month", e.target.value)
                }
                className="w-1/3 px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="" disabled>
                  Month
                </option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <input
                type="text"
                placeholder="YYYY"
                value={passenger.passportExpiry.year}
                onChange={(e) =>
                  updateDateField("passportExpiry", "year", e.target.value)
                }
                className="w-1/3 px-3 py-3 border border-gray-100 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Details Toggle */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-gray-700">
                Save these details to your profile
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={passenger.saveToProfile}
                  onChange={(e) =>
                    updatePassenger("saveToProfile", e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-10 py-[2px]  rounded-full transition-colors ${
                    passenger.saveToProfile ? "bg-primary-green" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      passenger.saveToProfile
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 mt-3 border-2 py-4 px-3 rounded-xl border-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
            <Shield className="w-4 h-4 " />
            <span className="text-sm text-primary-text">
              Your data is safe with us. Want to know more about how we use it?{" "}
              <a href="#" className="underline">
                Click here
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerForm;
