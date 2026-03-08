import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import Image from 'next/image';

// Custom CSS for animations
const toastStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  
  .animate-slideIn {
    animation: slideIn 0.5s ease-out;
  }
  
  .animate-progress {
    animation: progress 3s linear;
  }

  .readmore-content {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    transform-origin: top;
  }

  .readmore-content.expanded {
    max-height: 1000px;
    opacity: 1;
    transform: scaleY(1);
  }

  .readmore-content.collapsed {
    max-height: 0;
    opacity: 0;
    transform: scaleY(0);
  }

  .readmore-inner {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top;
  }

  .readmore-content.expanded .readmore-inner {
    transform: translateY(0);
  }

  .readmore-content.collapsed .readmore-inner {
    transform: translateY(-10px);
  }
`;

const AdditionalServiceCard = ({
  service,
  selectedServices,
  toggleServices
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleServiceToggle = (service) => {
    if (toggleServices) {
      // Check if this will be a new selection (not currently selected)
      const willBeSelected = !selectedServices?.includes(service);

      toggleServices(service);

      if (willBeSelected) {
        // Reset toast state first, then show it again
        setShowToast(false);
        setTimeout(() => {
          setShowToast(true);
          // Auto-hide toast after 3 seconds
          setTimeout(() => setShowToast(false), 3000);
        }, 100);
      }
    }
  };

  if (!service) {
    return null;
  }

  const isSelected = selectedServices && selectedServices.includes(service);

  // Debug: Log service data

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: toastStyles }} />
      <div className="bg-white rounded-xl pt-[14px] px-[14px] border-2 border-gray-300">
        <h2 className={`text-lg font-semibold text-primary-text mb-2 ${service.name === 'Travel insurance' ? '' : 'hidden'}`}>Additional services</h2>
        <div className="w-full bg-gray-100 rounded-xl border-2 border-gray-300 p-3.5 mb-4">
          <div className="flex items-start gap-6">
            {/* Left Icon Block */}
            <div className="flex-shrink-0 w-27 h-auto flex items-center justify-center">
              <Image
                src={service.image || `/st-images/additional-searvices/${service.image || 'default'}.png`}
                className="w-full h-full object-contain"
                alt={service.name || 'Service'}
                width={500}
                height={900}
              />
            </div>

            {/* Middle Content */}
            <div className="flex-1 min-w-0">
              {service.name === 'Fast Track' && (
                <div className='mb-3'><span className='text-[14px] font-medium rounded-full px-3 py-2 bg-secondary-green text-primary-text'>Limited Fast Track availability</span> </div>
                )}
                <>
                  <h3 className="text-lg font-semibold text-primary-text mb-1.5">{service.name || 'Service Name'}</h3>
                  <p className="text-sm text-primary-text mb-2">{service.subtitle || ''}</p>
                </>

              {/* Benefits List - if service has benefits */}
              <div className='border-b border-gray-400 pb-4'>

              {service.benefits && service.benefits.length > 0 && (
                <div className="space-y-2">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary-text flex-shrink-0 stroke-3" />
                      <span className="text-sm text-primary-text">{benefit}</span>
                    </div>
                  ))}
                </div>
              )}
              {service.name === 'Airline bankruptcy protection' && service.pdf && service.pdf.length > 0 && (
                <div className=" mt-1">
                  {service.pdf.map((link, index) => (
                    <a
                    key={index}
                    href="#"
                    className="text-red-500 hover:text-red-400 text-sm flex items-center gap-2"
                    >
                      <span className="underline">
                        {link}, click here »
                      </span>
                      <Image src="/st-images/downloadpdf.png" alt="pdf" width={18} height={18} />
                    </a>
                  ))}
                </div>
              )}
              </div>

              {/* Read More Section */}
              {service.details && (
                <div className="mb-3 py-3 border-b border-gray-400">
                  <button
                    onClick={toggleExpand}
                    className="text-primary-text text-base font-medium flex items-center justify-between w-full cursor-pointer gap-1 mb-1"
                  >
                    Read more
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    )}
                  </button>

                  <div className={`readmore-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    <div className="readmore-inner">
                      <div className="text-sm text-primary-text">
                                               {/* Fast Track Service Availability Card */}
                        {service.name === 'Fast Track' && (
                          <div className="bg-secondary-green rounded-lg p-4 mb-4 mt-3 border border-secondary-green/20">
                            <h4 className="text-base font-semibold text-primary-text mb-3">Fast Track Service available</h4>
                            
                            {/* Departure Section */}
                            <div className="mb-3">
                              <h5 className="text-sm font-semibold text-primary-textmb-1">Departure</h5>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-primary-text font-medium">Al Maktoum Intl (DWC)</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 rounded-full border border-primary-text flex items-center justify-center">
                                    <span className="text-xs text-primary-text font-medium">i</span>
                                  </div>
                                  <span className="text-sm text-primary-text font-medium">Not available</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Return Section */}
                            <div>
                              <h5 className="text-sm font-semibold text-primary-text mb-1">Return</h5>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-primary-text font-medium">Istanbul Sabiha Gokcen (SAW)</span>
                                <span className="text-sm text-primary-text font-medium">Available</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="">{service.details}</p>

                        {/* More Benefits */}
                        {service.morebenefits && service.morebenefits.length > 0 && (
                          <div className="space-y-1.5 pt-1 pl-2">
                            {service.morebenefits.map((benefit, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-primary-text rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-primary-text">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* PDF Links */}
                        {service.name !== 'Airline bankruptcy protection' && service.pdf && service.pdf.length > 0 && (
                          <div className=" mt-1">
                            {service.pdf.map((link, index) => (
                              <a
                                key={index}
                                href="#"
                                className="text-red-500 hover:text-red-400 text-sm flex items-center gap-2"
                              >
                                <span className="underline">
                                  {link}, click here »
                                </span>
                                <Image src="/st-images/downloadpdf.png" alt="pdf" width={18} height={18} />
                                <span className="text-base text-primary-text">(pdf)</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selection Options */}
              <div className=" w-full max-w-[280px] mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Select an option *</span>
                  <span className="text-sm font-semibold text-gray-800">€{service.charge || 0} Only</span>
                </div>

                <div className="flex flex-row rounded-lg  border">
                  <label className="flex items-center justify-center w-full gap-2 px-1.5 cursor-pointer border-r-2 border-primary-text py-3">
                    <input
                      type="radio"
                      name={`service-${service._id || service.name}`}
                      value="no"
                      checked={!isSelected}
                      onChange={() => handleServiceToggle(service)}
                      className="text-blue-600 h-5 w-5"
                    />
                    <span className="text-sm text-primary-text font-medium text-center">No, thank you</span>
                  </label>
                  <label className="flex items-center justify-center w-full gap-2 px-1.5 cursor-pointer py-3">
                    <input
                      type="radio"
                      name={`service-${service._id || service.name}`}
                      value="yes"
                      checked={isSelected}
                      onChange={() => handleServiceToggle(service)}
                      className="text-blue-600 h-5 w-5"
                    />
                    <span className="text-sm text-primary-text font-medium text-center">Add to Cart</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Success Toast */}
        {showToast && (
          <div key={`toast-${service._id || service.name}-${Date.now()}`} className="fixed top-6 right-6 z-[99999]">
            <div className="bg-white border-l-4 border-green-500 rounded-xl shadow-2xl flex items-center gap-4 p-4 min-w-[320px] transform transition-all duration-500 ease-out animate-slideIn">
              {/* Animated Success Icon */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                {/* Pulse animation */}
                <div className="absolute inset-0 w-12 h-12 bg-green-400 rounded-full animate-ping opacity-20"></div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">Successfully Added!</h4>
                <p className="text-gray-600 text-sm">{service.name} has been added to your cart</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowToast(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 group"
              >
                <span className="text-gray-500 group-hover:text-gray-700 text-lg font-light">×</span>
              </button>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b-xl animate-progress"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdditionalServiceCard; 