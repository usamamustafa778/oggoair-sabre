import React, { useState } from 'react';

export default function ShowMoreLess({ content, maxLength = 100 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content || content.length <= maxLength) {
    return <p className="text-gray-600 text-sm">{content}</p>;
  }

  return (
    <div>
      <p className="text-gray-600 text-sm">
        {isExpanded ? content : `${content.substring(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-1"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
} 