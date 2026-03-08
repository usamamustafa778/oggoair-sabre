import React from 'react';

const ExtraServiceFooter = ({ onProceedToPayment, loading, selectedServices, bookingDetails }) => {
  const calculateTotal = () => {
    if (!bookingDetails) return 0;
    
    let total = parseFloat(bookingDetails.bookingDetails?.total_amount || 0) + 
                parseFloat(bookingDetails.payment?.comissionAmount || 0);
    
    for (let service of selectedServices) {
      total += parseFloat(service.charge || 0);
    }
    
    return total;
  };

  return (
    <div className="w-full mt-5">
      <div className="mt-5 p-5 rounded-2xl bg-[#F8F9FE] flex items-center justify-center">
        <p className="font-semibold text-lg text-center">
          Pay for your order, you are one step away from travel!
        </p>
      </div>
      <div className="w-full flex items-center justify-center mt-5">
        <button
          className="bg-primary-green hover:bg-primary-green/80 disabled:bg-gray-400 text-primary-text cursor-pointer font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          onClick={onProceedToPayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Review & Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default ExtraServiceFooter; 