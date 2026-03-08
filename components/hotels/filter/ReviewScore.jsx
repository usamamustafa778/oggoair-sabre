import React from 'react';

export default function ReviewScore({ filterTypes, setFilterTypes, filterAbleTypes }) {
  const handleReviewScoreChange = (score) => {
    if (filterTypes.reviewScore.includes(score)) {
      setFilterTypes(prev => ({
        ...prev,
        reviewScore: prev.reviewScore.filter(s => s !== score)
      }));
    } else {
      setFilterTypes(prev => ({
        ...prev,
        reviewScore: [...prev.reviewScore, score]
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-300">
      <div className="">
        <p className="text-base font-semibold text-primary-text mb-2">Review Score</p>
        <div className="space-y-3">
          {filterAbleTypes.reviewScore?.map((score) => (
            <label key={score} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterTypes.reviewScore.includes(score)}
                onChange={() => handleReviewScoreChange(score)}
                className="mr-3"
              />
                <span className="text-base text-primary-text font-medium">{score}+</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
} 