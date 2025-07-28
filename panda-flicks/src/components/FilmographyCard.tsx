import React from 'react';
import { TMDBActorCredit } from '../services/tmdb';

interface FilmographyCardProps {
  credit: TMDBActorCredit;
  onCardClick: (id: number, mediaType: 'movie' | 'tv') => void;
}

const FilmographyCard: React.FC<FilmographyCardProps> = ({ credit, onCardClick }) => {
  const formatYear = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  const getTitle = () => {
    return credit.title || credit.name || 'Unknown Title';
  };

  const getReleaseDate = () => {
    return credit.release_date || credit.first_air_date;
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors"
      onClick={() => onCardClick(credit.id, credit.media_type)}
    >
      {/* Poster */}
      <div className="w-12 h-[72px] bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={credit.poster_path ? `https://image.tmdb.org/t/p/w92${credit.poster_path}` : 'https://placehold.co/48x72?text=No+Image'}
          alt={getTitle()}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[#F8F8FF] font-poppins font-semibold text-sm leading-5 truncate">
          {getTitle()}
        </h3>
        
        <p className="text-[#EFEEEA] font-poppins text-xs leading-4 truncate mt-1">
          as {credit.character || 'Unknown Character'}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#EFEEEA] font-poppins text-xs opacity-70">
            {formatYear(getReleaseDate())}
          </span>
          
          {credit.vote_average && credit.vote_average > 0 && (
            <>
              <div className="w-1 h-1 bg-[#EFEEEA] rounded-full opacity-70"></div>
              <div className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FE7743">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="text-[#EFEEEA] font-poppins text-xs opacity-70">
                  {credit.vote_average.toFixed(1)}
                </span>
              </div>
            </>
          )}
          
          <div className="w-1 h-1 bg-[#EFEEEA] rounded-full opacity-70"></div>
          <span className="text-[#FE7743] font-poppins text-xs font-medium">
            {credit.media_type === 'movie' ? 'Film' : 'Dizi'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilmographyCard;
