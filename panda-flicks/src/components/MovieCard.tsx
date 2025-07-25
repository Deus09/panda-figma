import React from 'react';

type MovieCardProps = {
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
};

const MovieCard: React.FC<MovieCardProps> = ({ title, date, rating, review, poster }) => (
  <div className="flex flex-row bg-[#222] rounded-2xl shadow-lg p-[11px_16px] gap-5 w-full max-w-full min-h-[140px]">
    <img
      src={poster || 'https://placehold.co/72x108?text=No+Image'}
      alt={title}
      className="w-[72px] h-[108px] rounded-xl object-cover bg-[#E5E5E5]"
    />
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <h3 className="text-white font-semibold text-base leading-tight mb-1">{title}</h3>
        <div className="flex flex-row items-center text-xs gap-2 mb-1">
          <span className="font-medium text-[#FE7743]">Watched:</span>
          <span className="font-medium text-white">{date}</span>
        </div>
        <div className="flex flex-row items-center text-xs gap-2 mb-1">
          <span className="font-medium text-[#FE7743]">Rating:</span>
          <span className="font-medium text-white">{rating}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FE7743" className="inline ml-1"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <div className="text-xs text-[#EFEEEA] mt-2">
          {review}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <span className="text-[#FE7743] cursor-pointer text-[10px] font-medium">Read More</span>
      </div>
    </div>
  </div>
);

export default MovieCard; 