import React from 'react';

export default function Facilities({ filterTypes, setFilterTypes, filterAbleTypes }) {
  const handleAmenityChange = (amenity) => {
    if (filterTypes.amenities.includes(amenity)) {
      setFilterTypes(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }));
    } else {
      setFilterTypes(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-300">
      <div className="">
        <p className="text-base font-semibold text-primary-text mb-2">Facilities</p>
        <div className="space-y-3">
          {filterAbleTypes.amenities?.slice(0, 10).map((amenity) => (
            <label key={amenity} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterTypes.amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="mr-3"
              />
              <span className="text-base text-primary-text font-medium">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
} 