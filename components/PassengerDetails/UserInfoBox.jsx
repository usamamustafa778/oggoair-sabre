import React from 'react';

const UserInfoBox = ({ userName }) => {
  return (
    <div className="bg-white border border-dashed text-center border-gray-300 rounded-lg p-4">
      <p className="text-gray-700">You are signed in as {userName}</p>
    </div>
  );
};

export default UserInfoBox; 