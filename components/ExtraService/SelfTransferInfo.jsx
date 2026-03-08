import React from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

const SelfTransferInfo = () => {
  return (
    <div className="bg-white rounded-xl p-[14px] border-2 border-gray-300">
      <div className="mb-[8px] flex flex-row items-center gap-2 ">
        <ChevronLeft className="w-5 h-5 text-primary-text" />
        <span className="text-base font-medium text-gray-500 -tracking-normal">
          Edit Traveler Information
        </span>
      </div>
      <div className="flex items-start gap-3 border-2 py-[16px] min-h-[190px] px-[14px] rounded-xl bg-gray-100 border-gray-300">
        <Image
          src="/st-images/selfTransfer.png"
          alt="shield"
          width={100}
          height={100}
          className="w-auto h-8"
        />
        <div className="flex flex-col gap-1.5 ">
          <h3 className="text-lg font-semibold text-primary-text">
            Self-transfer
          </h3>
          <p className="text-sm text-primary-text leading-[21px]">
            We help you save big by combining individual tickets into your dream
            itinerary. Remember to check in between flights, re-check in any
            baggage and follow visa requirements for any stopovers. Your trip is
            protected by the Self Transfer Guarantee with 24/7 support. Find out
            more about what it means for you to travel with Self Transfer here .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelfTransferInfo;
