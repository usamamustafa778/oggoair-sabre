import React from 'react';
import { User } from 'lucide-react';
import Image from 'next/image';

const InstructionBox = () => {
  return (
    <div className="border border-gray-400 py-6 rounded-xl p-4 flex items-center gap-3">
      <Image src="/st-images/user2.png" alt="info" width={25} height={25} className='w-6 h-6' />
      <p className="text-gray-700">These passenger details must match your Passport or Photo ID</p>
    </div>
  );
};

export default InstructionBox; 