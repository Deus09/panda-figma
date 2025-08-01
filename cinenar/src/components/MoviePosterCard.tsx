import React from 'react';

type MoviePosterCardProps = {
  title: string;
  poster: string;
  onClick?: () => void;
};

const MoviePosterCard: React.FC<MoviePosterCardProps> = ({ title, poster, onClick }) => {
  return (
    <div 
      className="flex-shrink-0 w-24 h-36 rounded-xl overflow-hidden bg-muted hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
      title={title}
    >
      <img
        src={poster || 'https://placehold.co/96x144?text=No+Image'}
        alt={title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
      />
    </div>
  );
};

export default MoviePosterCard; 