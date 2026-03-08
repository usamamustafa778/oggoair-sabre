import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { IoSearchOutline } from "react-icons/io5";
import HotelFilterComponent from "../filter/HotelFilterComponent";
import HotelCardComponent from "../List/HotelCardComponent";
import PriceFilter from "../filter/PriceFilter";
import LoadingComponent from "../../common/LoadingComponent";
import { APILINK } from "../../../config/api";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";

export default function HotelListBody() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [displayHotels, setDisplayHotels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [hotelNameSearchValue, setHotelNameSearchValue] = useState("");

  const [filterTypes, setFilterTypes] = useState({
    rating: [],
    amenities: [],
    dining: [],
    bookWithConfidence: [],
    reviewScore: [],
    sorting: "Recommended",
  });
  const [filterAbleTypes, setFilterAbleTypes] = useState({
    rating: [],
    amenities: [],
    dining: [],
    bookWithConfidence: [],
    reviewScore: [],
    sorting: "Recommended",
  });

  useEffect(() => {
    if (router.isReady && router.query) {
      const {
        latitude,
        longitude,
        place_name,
        checkin,
        checkout,
        adults,
        child,
        infant,
        rooms,
        freeCancellation,
        bestRating,
      } = router.query;

      // Get tomorrow's date for default check-in
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get date 7 days from tomorrow for default check-out
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);

      // Format data properly for API - ensure all values are strings and no null values
      const formattedData = {
        latitude: latitude ? parseFloat(latitude).toString() : "0",
        longitude: longitude ? parseFloat(longitude).toString() : "0",
        place_name: place_name || "Unknown",
        checkin: checkin || tomorrow.toISOString().split("T")[0],
        checkout: checkout || nextWeek.toISOString().split("T")[0],
        adults: adults ? parseInt(adults).toString() : "1",
        child: child ? parseInt(child).toString() : "0",
        infant: infant ? parseInt(infant).toString() : "0",
        rooms: rooms ? parseInt(rooms).toString() : "1",
        freeCancellation: freeCancellation === "true" ? "true" : "false",
        bestRating: bestRating === "true" ? "true" : "false",
      };

      getHotelData(formattedData);
    }
  }, [router.isReady, router.query]);

  const getHotelData = async (data) => {
    try {
      setLoading(true);

      // Remove any duplicate fields and ensure clean data
      const cleanData = {
        latitude: data.latitude,
        longitude: data.longitude,
        place_name: data.place_name,
        checkin: data.checkin,
        checkout: data.checkout,
        adults: data.adults,
        child: data.child,
        infant: data.infant,
        rooms: data.rooms,
        freeCancellation: data.freeCancellation,
        bestRating: data.bestRating,
      };

      const res = await axios.post(
        "https://www.oggoair.com/api/hotels",
        cleanData
      );

      if (res.data.status && res.data.data && res.data.data.length > 0) {
        setHotels(res.data.data);
        setFilteredHotels(res.data.data);
      } else {

        // Try with broader search parameters
        const broaderData = {
          ...cleanData,
          latitude: "25.1972", // Dubai Downtown
          longitude: "55.2744",
          place_name: "Dubai, UAE",
        };

        const broaderRes = await axios.post(
          `${APILINK}/api/hotels`,
          broaderData
        );

        if (
          broaderRes.data.status &&
          broaderRes.data.data &&
          broaderRes.data.data.length > 0
        ) {
          setHotels(broaderRes.data.data);
          setFilteredHotels(broaderRes.data.data);
        } else {
          setHotels([]);
          setFilteredHotels([]);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Failed to fetch hotels");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const filterAbleComponents = {
      rating: [],
      amenities: [],
      dining: [],
      bookWithConfidence: [],
      reviewScore: [],
      sorting: "Recommended",
    };

    hotels.forEach((hotel, index) => {
      // rating
      if (!filterAbleComponents.rating.includes(hotel.accommodation.rating)) {
        if (hotel.accommodation.rating !== null) {
          filterAbleComponents.rating.push(hotel.accommodation.rating);
        }
      }
      // amenities
      hotel.accommodation.amenities?.forEach((amenity) => {
        if (!filterAbleComponents.amenities.includes(amenity.description)) {
          filterAbleComponents.amenities.push(amenity.description);
        }
      });

      // reviewScore
      if (
        !filterAbleComponents.reviewScore.includes(
          Math.floor(hotel.accommodation.review_score)
        )
      ) {
        if (Math.floor(hotel.accommodation.review_score) !== 0) {
          filterAbleComponents.reviewScore.push(
            Math.floor(hotel.accommodation.review_score)
          );
        }
      }
    });

    // Sorting rating and reviewScore in descending order
    filterAbleComponents.rating.sort((a, b) => b - a);
    filterAbleComponents.reviewScore.sort((a, b) => b - a);

    setFilterAbleTypes(filterAbleComponents);
  }, [hotels]);

  useEffect(() => {
    let filteredHotels = [...hotels];

    // rating
    if (!filterTypes.rating.length) {
      filteredHotels = [...hotels];
    } else {
      filteredHotels = [...hotels].filter((hotel) =>
        filterTypes.rating.includes(hotel.accommodation.rating)
      );
    }
    // review score
    if (!filterTypes.reviewScore.length) {
      filteredHotels = [...filteredHotels];
    } else {
      filteredHotels = [...filteredHotels].filter((hotel) =>
        filterTypes.reviewScore.includes(
          Math.floor(hotel.accommodation.review_score)
        )
      );
    }
    // amenities
    if (!filterTypes.amenities?.length) {
      filteredHotels = [...filteredHotels];
    } else {
      const newHotels = [];

      filteredHotels.forEach((hotel) => {
        hotel.accommodation.amenities?.forEach((amenity) => {
          if (
            filterTypes.amenities.includes(amenity.description) &&
            !newHotels.includes(hotel)
          ) {
            newHotels.push(hotel);
          }
        });
      });

      filteredHotels = newHotels;
    }

    // sorting
    if (filterTypes.sorting === "Recommended") {
      filteredHotels = [...filteredHotels];
    } else if (filterTypes.sorting === "Low to High") {
      filteredHotels.sort(
        (a, b) => a.cheapest_rate_total_amount - b.cheapest_rate_total_amount
      );
    } else if (filterTypes.sorting === "High to Low") {
      filteredHotels.sort(
        (a, b) => b.cheapest_rate_total_amount - a.cheapest_rate_total_amount
      );
    }
    setFilteredHotels(filteredHotels);
  }, [filterTypes, hotels]);

  useEffect(() => {
    setDisplayHotels(filteredHotels.slice(0, 10));
    setCurrentIndex(10);
  }, [filteredHotels]);

  const increaseHotelData = () => {
    // Update the display hotels with the next set of 10 hotels
    const nextHotels = filteredHotels.slice(currentIndex, currentIndex + 10);
    setDisplayHotels((prev) => [...prev, ...nextHotels]); // Append to the existing list of hotels
    setCurrentIndex((prevIndex) => prevIndex + 10); // Update the index for the next batch
  };

  const searchHotelByName = () => {
    if (hotelNameSearchValue && hotelNameSearchValue.trim()) {
      const searchTerm = hotelNameSearchValue.toLowerCase().trim();
      const filteredResults = hotels.filter((hotel) => {
        const hotelName = hotel.accommodation?.name?.toLowerCase() || "";
        return hotelName.includes(searchTerm);
      });
      setFilteredHotels(filteredResults);
    } else {
      setFilteredHotels(hotels);
    }
  };

  // Real-time search as user types
  const handleHotelNameSearch = (value) => {
    setHotelNameSearchValue(value);
    if (value && value.trim()) {
      const searchTerm = value.toLowerCase().trim();
      const filteredResults = hotels.filter((hotel) => {
        const hotelName = hotel.accommodation?.name?.toLowerCase() || "";
        return hotelName.includes(searchTerm);
      });
      setFilteredHotels(filteredResults);
    } else {
      setFilteredHotels(hotels);
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <FullContainer className="w-full flex justify-center px-3 bg-primary-bg pt-24 lg:pt-39">
      <Container className="mt-5 w-full">
        <div className="flex flex-col lg:flex-row pt-7 gap-8 w-full">
          <div className="lg:w-[33.5%] space-y-6">
            <HotelFilterComponent
              filterTypes={filterTypes}
              setFilterTypes={setFilterTypes}
              filterAbleTypes={filterAbleTypes}
              setFilterAbleTypes={setFilterAbleTypes}
              hotelNameSearchValue={hotelNameSearchValue}
              setHotelNameSearchValue={setHotelNameSearchValue}
              searchHotelByName={searchHotelByName}
              handleHotelNameSearch={handleHotelNameSearch}
            />
          </div>
          <div className="lg:w-[66.5%] flex flex-col gap-3 ">
            <div className="w-full flex items-center justify-between bg-white p-5 rounded-lg mb-2">
              <h3 className="text-base lg:text-lg text-primary-text font-bold">
                Dubai: {filteredHotels.length} accommodation options available
              </h3>
            </div>

            {displayHotels.map((hotel, index) => {
              return <HotelCardComponent hotel={hotel} key={index} />;
            })}

            {displayHotels.length === 0 && !loading && (
              <div className="w-full flex justify-center mt-10">
                <div className="text-center">
                  <div className="text-gray-500 text-xl mb-4 ">
                    No hotels found
                  </div>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search criteria or try a different
                    destination.
                  </p>
                  <button
                    onClick={() => router.push("/hotel")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Search Again
                  </button>
                </div>
              </div>
            )}

            {filteredHotels.length - currentIndex > 0 && (
              <div className="w-full flex justify-center mt-10">
                <button
                  onClick={increaseHotelData}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
                >
                  Show 10 more hotels
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </FullContainer>
  );
}
