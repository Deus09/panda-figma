import React from 'react';
import logo from '../assets/logo.png';

const TopHeaderBar: React.FC = () => (
  <div className="flex flex-row items-center justify-between bg-[#222] w-[393px] h-[60px] px-[20px] py-[10px]" style={{gap: '125px'}}>
    <div className="flex flex-row items-center gap-[10px]">
      <img src={logo} alt="Pandaflicks Logo" className="w-[40px] h-[40px] rounded-full bg-[#D9D9D9]" />
      <span className="text-white font-extrabold text-[24px] leading-[36px] font-poppins">Pandaflicks</span>
    </div>
  </div>
);

export default TopHeaderBar; 