import React from 'react';
import StarRating from './StarRating';
import Facilities from './Facilities';
import ReviewScore from './ReviewScore';
import PriceFilter from './PriceFilter';
import { IoSearchOutline } from 'react-icons/io5';

export default function HotelFilterComponent({
  filterTypes,
  setFilterTypes,
  filterAbleTypes,
  setFilterAbleTypes,
  hotelNameSearchValue,
  setHotelNameSearchValue,
  searchHotelByName,
  handleHotelNameSearch,
}) {
  const filterReset = () => {
    setFilterTypes({
      rating: [],
      amenities: [],
      dining: [],
      bookWithConfidence: [],
      reviewScore: [],
      sorting: "Recommended",
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-md sticky top-1 h-[calc(100vh-.5rem)] overflow-y-scroll pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white p-4 rounded-md">
        <p className=" text-blue-500 cursor-pointer" onClick={filterReset}>
          Reset All Filters
        </p>
      </div>
      
      {/* Sort by section - matching the image design */}
      <div className="  bg-white p-6 rounded-xl border border-gray-300">
        <div className="">
          <p className="text-base font-semibold text-primary-text mb-2">Sort by</p>
          <div className="bg-secondary-green rounded-lg p-3 flex items-end justify-end">
            <select 
              value={filterTypes.sorting}
              onChange={(e) => setFilterTypes(prev => ({ ...prev, sorting: e.target.value }))}
              className="w-full bg-transparent text-primary-text text-base font-medium focus:outline-none"
            >
              <option value="Recommended">Recommended</option>
              <option value="Low to High">Price: Low to High</option>
              <option value="High to Low">Price: High to Low</option>
              <option value="Rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hotel name search section - matching the image design */}
      <div className="bg-white p-6 rounded-xl border border-gray-300">
        <div className="">
          <p className="text-base font-semibold text-primary-text mb-2">Hotel name</p>
          <div className="relative">
            <input
              type="text"
              placeholder="For example Hilton"
              value={hotelNameSearchValue || ""}
              onChange={(e) => handleHotelNameSearch && handleHotelNameSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchHotelByName && searchHotelByName()}
              className="w-full bg-secondary-green rounded-lg px-4 py-3 text-sm focus:outline-none placeholder:text-gray-400"
              />
            <IoSearchOutline
              className="text-primary-text absolute top-3 right-3 cursor-pointer text-lg"
              onClick={searchHotelByName}
            />
          </div>
        </div>
      </div>

      <PriceFilter
        filterTypes={filterTypes}
        setFilterTypes={setFilterTypes}
        filterAbleTypes={filterAbleTypes}
      />

      <StarRating
        filterTypes={filterTypes}
        setFilterTypes={setFilterTypes}
        filterAbleTypes={filterAbleTypes}
      />
      <ReviewScore
        filterTypes={filterTypes}
        setFilterTypes={setFilterTypes}
        filterAbleTypes={filterAbleTypes}
      />
      <Facilities
        filterTypes={filterTypes}
        setFilterTypes={setFilterTypes}
        filterAbleTypes={filterAbleTypes}
      />
    </div>
  );
} 