import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import iconHome from '../assets/icon-home.svg';
import iconExplore from '../assets/icon-explore.svg';
import iconSocial from '../assets/icon-social.svg';
import iconLists from '../assets/icon-lists.svg';
import iconProfile from '../assets/icon-profile.svg';

const navItems = [
  { icon: iconHome, label: 'Home', path: '/home' },
  { icon: iconExplore, label: 'Explore', path: '/explore' },
  { icon: iconSocial, label: 'Social', path: null },
  { icon: iconLists, label: 'Lists', path: '/lists' },
  { icon: iconProfile, label: 'Profile', path: null },
];

const BottomNavBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const history = useHistory();
  const location = useLocation();

  return (
    <nav className={`fixed bottom-0 left-0 w-full bg-[#222] flex flex-row justify-between items-center px-[10px] py-[8px] z-50 border-t border-[#333] rounded-t-[27px] h-[85px] ${className}`} style={{ minHeight: 85 }}>
      {navItems.map((item, idx) => {
        const isActive = item.path && location.pathname.startsWith(item.path);
        return (
          <button
            key={item.label}
            className={`flex flex-col items-center flex-1 focus:outline-none transition-all duration-200 ${isActive ? 'text-[#FE7743] bg-[#fff] rounded-[27px]' : 'text-[#A3ABB2] bg-transparent'} h-[69px] mx-[2px]`}
            onClick={() => item.path && history.push(item.path)}
            disabled={!item.path}
            style={{ cursor: item.path ? 'pointer' : 'default', background: 'none', border: 'none' }}
          >
            <img src={item.icon} alt={item.label} className={`w-[32px] h-[32px] mb-1 ${isActive ? '' : 'opacity-70'}`} />
            <span className={`text-[12px] font-medium font-poppins ${isActive ? 'text-[#FE7743]' : 'text-[#A3ABB2]'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar; 