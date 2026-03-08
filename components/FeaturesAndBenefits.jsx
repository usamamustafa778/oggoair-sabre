import React from "react";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
const features = [
  {
    img: "/img/1.png",
    title: "Compare cheap flights and train tickets with buses",
    desc: "With oggoair, you can compare airline tickets with train tickets and Greyhound bus tickets.",
  },
  {
    img: "/img/2.png",
    title: "Find cheap tickets with ease",
    desc: "Search and book cheap flight, bus, ferry and train tickets! Discover the best tickets for you with oggoair.",
  },
  {
    img: "/img/3.png",
    title: "Timetables and tickets for all your travels needs",
    desc: "It's never been easier to book a train ticket, bus ticket, airplane ticket or ferry ticket before.",
  },
];

const benefits = [
  {
    img: "/benefits/lowest-budget.png",
    title: "Lowest Budget Airline",
    subtitle: "Fare Guarantee",
  },
  {
    img: "/benefits/easy-book-in.png",
    title: "Easy Book In",
    subtitle: "Book Your Ticket in 3 Steps",
  },
  {
    img: "/benefits/secure-payment.png",
    title: "24/7 Support",
    subtitle: "Assistance at any time of day",
  },
  {

    img: "/benefits/support-24-7.png",
    title: "Secure Payment",
    subtitle: "Protected transactions",
  },
];

export default function FeaturesAndBenefits() {
  return (
    <FullContainer className="pt-20 md:pt-24 pb-12 md:pb-16 bg-white">
      <Container className="mx-auto max-w-6xl -pt-20">
        {/* Top row - 3 feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              <div className="flex justify-center pt-6 pb-4">
                <img
                  src={f.img}
                  alt=""
                  className="w-40 h-36 md:w-44 md:h-40 object-contain"
                />
              </div>
              <div className="px-6 pb-6 text-center">
                <h3
                  className="text-xl md:text-2xl font-bold mb-2 leading-snug"
                  style={{ color: "#132968" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-base md:text-lg leading-relaxed"
                  style={{ color: "#132968" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row - 4 benefit blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mt-10 md:mt-12">
          {benefits.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center"
            >
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "#EEF1F7" }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-16 h-16 object-contain"
                />
              </div>
                <h4
                  className="font-bold text-1xl md:text-2xl mb-1"
                  style={{ color: "#132968" }}
                >
                  {item.title}
                </h4>
                <p
                  className="text-lg"
                  style={{ color: "#6b7280" }}
                >
                  {item.subtitle}
                </p>
            </div>
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
