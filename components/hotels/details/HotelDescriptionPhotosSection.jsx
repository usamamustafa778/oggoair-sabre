import React, { useState } from 'react';
import Image from 'next/image';

export default function HotelDescriptionPhotosSection({ hotel }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Hotel information not available.</p>
      </div>
    );
  }

  const photos = hotel.accommodation?.photos || [];
  const description = hotel.accommodation?.description || 'No description available.';

  return (
    <div className="space-y-6">
      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Photos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Photo */}
            <div className="md:col-span-2">
              <div className="relative h-96 rounded-lg overflow-hidden">
                {photos[selectedImage]?.url ? (
                  <Image
                    src={photos[selectedImage].url}
                    fill
                    alt={`Hotel photo ${selectedImage + 1}`}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Photos */}
            {photos.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative h-24 rounded-lg overflow-hidden cursor-pointer">
                {photo.url ? (
                  <Image
                    src={photo.url}
                    fill
                    alt={`Hotel photo ${index + 1}`}
                    className={`object-cover ${selectedImage === index ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-xl font-semibold mb-4">About this property</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Key Features */}
      {hotel.accommodation?.amenities && hotel.accommodation.amenities.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.accommodation.amenities.slice(0, 9).map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{amenity.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {hotel.accommodation?.address && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Location</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              {hotel.accommodation.address.line1}
              {hotel.accommodation.address.line2 && `, ${hotel.accommodation.address.line2}`}
              {hotel.accommodation.address.city && `, ${hotel.accommodation.address.city}`}
              {hotel.accommodation.address.state && `, ${hotel.accommodation.address.state}`}
              {hotel.accommodation.address.postal_code && ` ${hotel.accommodation.address.postal_code}`}
              {hotel.accommodation.address.country && `, ${hotel.accommodation.address.country}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 