import React from 'react';
import { TMDBSearchResult } from '../services/tmdb';

interface PersonCardProps {
  person: TMDBSearchResult;
  onClick: (id: number) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  // İsimden baş harfleri al
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2); // Maksimum 2 harf
  };

  // İsimden renk üret
  const getColorFromName = (name: string): string => {
    const colors = [
      '#FF6B6B', // Coral Red
      '#4ECDC4', // Turquoise
      '#45B7D1', // Sky Blue
      '#96CEB4', // Mint Green
      '#FECA57', // Golden Yellow
      '#FF9FF3', // Pink
      '#54A0FF', // Royal Blue
      '#5F27CD', // Purple
      '#00D2D3', // Cyan
      '#FF9F43', // Orange
      '#10AC84', // Green
      '#EE5A24', // Red Orange
      '#0984E3', // Blue
      '#6C5CE7', // Lavender
      '#FD79A8', // Rose Pink
    ];
    
    // İsmin hash değerini hesapla
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Hash değerini renk array'inin indeksine çevir
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(person.name || 'Unknown');
  const backgroundColor = getColorFromName(person.name || 'Unknown');

  return (
    <div
      className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800 flex flex-col"
      onClick={() => onClick(person.id)}
    >
      <div className="flex-1 overflow-hidden relative">
        {person.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor }}
          >
            <span className="text-white font-bold text-lg font-poppins">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="p-1 bg-gray-900 bg-opacity-80">
        <p className="text-white text-[8px] font-poppins font-medium text-center leading-tight truncate">
          {person.name}
        </p>
        {person.known_for_department && (
          <p className="text-gray-300 text-[6px] font-poppins text-center truncate">
            {person.known_for_department}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
