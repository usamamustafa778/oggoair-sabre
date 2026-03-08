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
    desc: "It’s never been easier to book a train ticket, bus ticket, airplane ticket or ferry ticket before.",
  },
];

export default function Features() {
  return (
    <FullContainer className="pb-10 bg-white flex justify-center">
      <Container className=" mx-auto max-w-7xl  py-12 bg-white flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-[20px] border border-gray-300 flex flex-col items-center text-center px-8 py-10"
            >
              <img
                src={f.img}
                alt="feature"
                className="w-40 object-contain mb-6"
              />
              <div className="text-primary-text font-semibold text-2xl mb-3 leading-tight">
                {f.title}
              </div>
              <div className="text-primary-text text-base font-normal">
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
