import React from "react";
import Image from "next/image";

const UserEmailBox = () => {
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
    <>
      <h2 className="text-2xl font-bold text-primary-text">Extra Services</h2>
      <div className="border-2 border-gray-300 bg-white rounded-xl px-3.5 py-4">
        <div className="bg-[#F7F7F9] border-2 border-gray-300 rounded-xl p-4 py-6.5 flex items-center">
          <Image
            src="/st-images/ticket.png"
            alt="email"
            className="text-primary-text mr-3 "
            width={21}
            height={21}
          />
          <p className="text-primary-text font-medium">
            Your ticket will be sent to {user?.email || "example@gmail.com"}
          </p>
        </div>
      </div>
    </>
  );
};

export default UserEmailBox;
