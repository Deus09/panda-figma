import React, { useState } from 'react';

type MovieCardProps = {
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
};

const MovieCard: React.FC<MovieCardProps> = ({ title, date, rating, review, poster }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-row bg-[#222] rounded-[16px] shadow-[0_4px_10px_0_rgba(163,171,178,0.25)] p-[11px_16px] gap-5 w-[357px] min-w-[357px] min-h-[158px] transition-all duration-300">
      <img
        src={poster || 'https://placehold.co/72x108?text=No+Image'}
        alt={title}
        className="w-[72px] h-[108px] rounded-[12px] object-cover bg-[#E5E5E5]"
      />
      <div className="flex flex-col flex-1 justify-between h-full">
        <div>
          <h3 className="text-white font-semibold text-[16px] leading-[24px] mb-1 font-poppins">{title}</h3>
          <div className="flex flex-row items-center text-[10px] gap-2 mb-1 font-poppins">
            <span className="font-normal text-[#FE7743]">Watched:</span>
            <span className="font-medium text-white">{date}</span>
          </div>
          <div className="flex flex-row items-center text-[10px] gap-2 mb-1 font-poppins">
            <span className="font-normal text-[#FE7743]">Rating:</span>
            <span className="font-medium text-white">{rating}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FE7743" className="inline ml-1"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
          <div className={`text-[10px] text-[#EFEEEA] mt-2 font-poppins transition-all duration-300 ${expanded ? '' : 'line-clamp-3 overflow-hidden'}`}>{review}</div>
        </div>
        <div className="flex justify-end mt-2">
          {review.split('\n').length > 3 || review.length > 120 ? (
            <span
              className="text-[#FE7743] cursor-pointer text-[10px] font-medium font-poppins"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Show Less' : 'Read More'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default MovieCard; 