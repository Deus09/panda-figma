import React from 'react';

interface CategoryChipProps {
  label: string;
  prefix?: string;
  onClick: (prefix?: string) => void;
  isSelected?: boolean;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ label, prefix, onClick, isSelected }) => {
  return (
    <button
      className={`px-3 py-1.5 rounded-full font-poppins text-xs font-medium transition-all duration-200 ${
        isSelected
          ? 'bg-[#FE7743] text-white'
          : 'bg-[#333] text-[#EFEEEA] hover:bg-[#444]'
      }`}
      onClick={() => onClick(prefix)}
    >
      {label}
    </button>
  );
};

export default CategoryChip;
