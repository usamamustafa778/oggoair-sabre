export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // All additional services data (including core baggage service)
  const additionalServices = [
    {
      _id: "service_1",
      name: "Travel insurance",
      subtitle: "From medical emergencies to flight disruptions – we've got you covered.",
      image: "/st-images/travelinsurance.png",
      benefits: [
        "Emergency medical expenses included, plus 24/7 immediate medical assistance",
        "Coverage against delays, lost luggage, stolen documents or flight disruption",
        "Covers accommodation if your last outbound flight is delayed or cancelled",
      ],
      details: `Comprehensive protection for your stress-free travels, including 28 days cover for medical emergencies, flight delays, lost luggage and even stolen documents. Plus: a 24/7 live helpline, accommodation cover for delays and more.`,
      morebenefits: [
        "EUR 100K in emergency medical coverage, plus up to EUR 5,000 to get you home",
        "Covers delays, flight disruptions and even personal liability",
        "Protection even if you decide to cancel your flight due to a delay of more than 36 hours",
        "Valid for 14 days for a single journey and up to 28 days for return flights",
      ],
      pdf: [
        "Product information",
        "Terms and conditions",
      ],
      charge: 37.98,
      serviceType: "optional",
      priority: 1,
      isAlwaysAvailable: true
    },
    {
      _id: "service_2", 
      name: "Airline bankruptcy protection",
      subtitle: "Make sure you and your travel partners are protected if your airline goes bankrupt and cancels your flight",
      secondSubtitle: "Get coverage for:",
      image:"/st-images/airlineprotection.png",
      benefits: [
        "Your flight ticket to return home if your trip has already started",
        "Your prepaid flight, if you have not yet departed",
      ],
      details: `Airline Insolvency Protection covers prepaid costs associated with flight cancellations due to an airline bankruptcy and any flight costs that may arise if your trip has already started and you need to return home. You confirm that you have read and agree to the Terms of Service.`,

      // morebenefits: [
      //   "Full coverage for prepaid flight costs in case of airline bankruptcy",
      //   "Return flight coverage if your trip has already started",
      //   "24/7 emergency assistance for rebooking and support",
      //   "Valid for all passengers in your booking",
      // ],
      pdf: [
        "General terms and conditions",
      ],
      charge: 4.39,
      serviceType: "optional",
      priority: 2,
      isAlwaysAvailable: true
    },
    {
      _id: "service_3",
      name: "Lost Luggage Service", 
      // subtitle: "Track your baggage status in real time and receive notifications via email, SMS and chat messages",
      image:"/st-images/lostluggage.png",
      benefits: [
        "Track your baggage status in real time and receive notifications via email, SMS and chat messages",
        "Receive $500 for every bag that doesn't arrive within 96 hours",
        "This service does not affect any refunds you may be entitled to from your airline or insurance",
      ],
      details: `This service is offered in partnership with Blue Ribbon and covers the checked baggage of all passengers in your booking. Baggage service adds extra protection to your travel insurance, with coverage for every passenger flight - regardless of the number of connections.`,
      morebenefits: [
        "Real-time tracking of checked baggage via SMS, with updates in case of loss or mishandling",
        "Compensation is USD 500 per piece of baggage if lost or delayed more than 96 hours",
        "Online and hassle-free claim report via direct portal",
        "Mishandled bags must be reported within 24 hours",
        "You will regularly receive emails regarding the whereabouts of your mishandled bags",
      ],
      pdf: [
        "For more information, please consult Blue Ribbon's general terms and conditions here.",
      ],
      charge: 6.99,
      serviceType: "optional",
      priority: 3,
      isAlwaysAvailable: true
    },
    {
      _id: "service_4",
      name: "Fast Track",
      // subtitle: "Get access to the fast lane at airport security and save valuable time",
      image:"/st-images/fasttrack.png",
      benefits: [
        "Get access to the fast lane at airport security and save valuable time",
        "Receive your Fast Track pass directly on your phone",
        "Covers all passengers in the booking",
      ],
      details: `Experience the fastest way through airport security with Fast Track`,
      morebenefits: [
        "Use your Fast Track pass to access a priority lane that gets you through airport security faster and smoother",
        "If you have purchased Fast Track, you will receive your pass via SMS and email no later than 8 hours before departure",
        "Fast Track is valid at the departure airports for your incoming and outgoing flight(s)",
        "Fast Track is personal and cannot be used by anyone else",
        "Fast Track is offered through a partner of ours",
      ],
      // availability: [
      //   { airport: "Al Maktoum Intl (DWC)", available: false },
      //   { airport: "Istanbul Sabiha Gokcen (SAW)", available: true },
      // ],
      // pdf: [
      //   "Terms and conditions",
      // ],
      charge: 6.99,
      serviceType: "optional",
      priority: 4,
      isAlwaysAvailable: false
    },
    // {
    //   _id: "service_5",
    //   name: "SMS Ticket",
    //   subtitle: "Receive your boarding pass via SMS for easy access",
    //   image:"/st-images/fasticket.png",
    //   benefits: [
    //     "Get your boarding pass delivered directly to your phone via SMS",
    //     "No need to print or download - just show the SMS at the gate",
    //     "Instant delivery 24 hours before departure",
    //   ],
    //   details: `Convenient digital boarding pass service that sends your boarding pass directly to your mobile phone via SMS. No more printing or downloading required.`,
    //   morebenefits: [
    //     "SMS is sent 24 hours before your scheduled departure time",
    //     "Works with all major airlines and airports",
    //     "Backup email delivery included",
    //     "Valid for all passengers in your booking",
    //   ],
    //   pdf: [
    //     "Terms and conditions",
    //   ],
    //   charge: 2.50,
    //   serviceType: "optional",
    //   priority: 5,
    //   isAlwaysAvailable: true
    // },
    // {
    //   _id: "service_6",
    //   name: "Mobile Route",
    //   subtitle: "Get real-time updates about your journey via mobile notifications",
    //   benefits: [
    //     "Real-time flight status updates and notifications",
    //     "Gate change alerts and departure time updates",
    //     "Weather and travel advisory notifications",
    //   ],
    //   details: `Stay informed about your journey with real-time mobile notifications about flight status, gate changes, delays, and other important updates throughout your trip.`,
    //   morebenefits: [
    //     "Notifications sent via SMS, email, and push notifications",
    //     "Customizable alert preferences for different types of updates",
    //     "Available 24/7 for all your travel needs",
    //     "Covers all passengers in your booking",
    //   ],
    //   pdf: [
    //     "Terms and conditions",
    //   ],
    //   charge: 1.99,
    //   image: "Mobile Route",
    //   serviceType: "optional",
    //   priority: 6,
    //   isAlwaysAvailable: true
    // },
    // {
    //   _id: "service_0",
    //   name: "Additional baggage",
    //   subtitle: "Pay for your baggage at once and save up to 50% than at the airport!",
    //   image: "/st-images/additionalbaggage.png",
    //   benefits: [
    //     "Save up to 50% compared to airport prices",
    //     "Pre-book your baggage allowance in advance",
    //     "Avoid last-minute fees and hassles",
    //   ],
    //   details: `Pre-book your additional baggage allowance and save significantly compared to airport prices. This service allows you to secure your baggage allowance in advance, ensuring a smooth travel experience.`,
    //   morebenefits: [
    //     "Valid for all passengers in your booking",
    //     "Can be purchased up to 24 hours before departure",
    //     "Refundable if flight is cancelled",
    //     "Covers both checked and carry-on baggage",
    //   ],
    //   pdf: [
    //     "Terms and conditions",
    //   ],
    //   charge: 20,
    //   serviceType: "core",
    //   priority: 7,
    //   isAlwaysAvailable: true
    // }
  ];

  res.status(200).json({
    success: true,
    data: additionalServices
  });
}  