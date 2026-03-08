import React from 'react';

export default function PriceFilter({ filterTypes, setFilterTypes }) {
  const handleSortingChange = (sorting) => {
    setFilterTypes(prev => ({
      ...prev,
      sorting
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-300">
      <div className="">
        <p className="text-base font-semibold text-primary-text mb-2">Price range</p>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="price-0-100"
              className="mr-3"
            />
            <label htmlFor="price-0-100" className="text-base text-primary-text">
              $0 - $100
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="price-100-200"
              className="mr-3"
            />
            <label htmlFor="price-100-200" className="text-base text-primary-text">
              $100 - $200
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="price-200-300"
              className="mr-3"
            />
            <label htmlFor="price-200-300" className="text-base text-primary-text">
              $200 - $300
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="price-300-plus"
              className="mr-3"
            />
            <label htmlFor="price-300-plus" className="text-base text-primary-text">
              $300+
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 