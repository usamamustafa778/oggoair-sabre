import React from "react";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";

const hotels = [
  {
    city: "Islamabad",
    name: "Lowest Budget Airline",
    img: "/img/icon.png",
    des: "Fare Gurantee",
  },
  {
    city: "Islamabad",
    name: "Easy Book In",
    img: "/img/icon.png",
    des: "Book YOur Ticket In 3 Steps",
  },
  {
    city: "Islamabad",
    name: "24/7 Support",
    img: "/img/icon.png",
    des: "Assistance at any time of day",
  },
  {
    city: "Islamabad",
    name: "Secure Payement",
    img: "/img/icon.png",
    des: "Protected Transactions",
  },
];

export default function SecurePayement() {
  return (
    <FullContainer className="  ">
      <Container className="mx-auto max-w-7xl py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {hotels.map((pay, idx) => (
            <div
              key={idx}
              className="   flex flex-col items-center justify-center overflow-hidden"
            >
              <img
                src={pay.img}
                alt={pay.name}
                className="w-40 h-40  object-cover object-center "
              />
              <div className="  text-[#22325a] font-semibold text-xl   mt-auto pt-6 pb-2 ">
                {pay.name}
              </div>
              <div className="  ">{pay.des}</div>
            </div>
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
