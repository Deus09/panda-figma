import React from 'react';
import logo from '../assets/logo.png';

const TopHeaderBar: React.FC = () => (
  <div className="flex flex-row items-center gap-10 px-5 py-2.5 bg-[#222] w-full min-h-[60px]">
    <img src={logo} alt="Pandaflicks Logo" className="w-10 h-10 rounded-full" />
    <span className="text-white font-extrabold text-2xl leading-[36px] tracking-tight">Pandaflicks</span>
  </div>
);

export default TopHeaderBar; 