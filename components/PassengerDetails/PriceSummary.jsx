import React from 'react';
import { ChevronRight } from 'lucide-react';

const PriceSummary = () => {
  const priceItems = [
    { label: 'Adult 2', amount: '$104.40' },
    { label: 'Child 1 (10 Years)', amount: '$104.40' },
    { label: 'Infant (1 year)', amount: '$104.40' },
    { label: 'Agency fee', amount: '$5.00' },
    { label: 'Tickets x 3', amount: '$109.40' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">3 passengers</h3>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        {priceItems.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium">{item.amount}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold">Total (taxes included)</span>
            <span className="font-semibold">$109.40</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary; 