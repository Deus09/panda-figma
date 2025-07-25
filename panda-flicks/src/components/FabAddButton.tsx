import React from 'react';
import fabAdd from '../assets/fab-add.svg';

const FabAddButton: React.FC = () => (
  <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#FE7743] flex items-center justify-center shadow-lg z-50">
    <img src={fabAdd} alt="Add" className="w-6 h-6" />
  </button>
);

export default FabAddButton; 