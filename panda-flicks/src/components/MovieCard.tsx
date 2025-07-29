import React from 'react';
import { MovieLog } from '../services/localStorage';

type MovieCardProps = {
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
  onClick?: () => void;
};

const MovieCard: React.FC<MovieCardProps> = ({ title, date, rating, review, poster, onClick }) => {
  return (
    <div 
      className="w-full max-w-sm flex items-center p-2 rounded-2xl bg-card border border-border gap-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Poster Area */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
        <img
          src={poster || 'https://placehold.co/96x96?text=No+Image'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content Area */}
      <div className="flex-1 min-w-0">
        {/* Film Title */}
        <h3 className="text-foreground font-bold truncate text-body">{title}</h3>
        
        {/* Date and Rating */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <span>{date}</span>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <div className="flex items-center gap-1">
            <span>{rating}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
        </div>
        
        {/* Review */}
        {review && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{review}</p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;