import React, { useState, useRef, useEffect } from 'react';
import { MovieLog } from '../services/localStorage';

type MovieCardProps = {
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
  onUpdate?: (updates: Partial<Omit<MovieLog, 'id' | 'createdAt'>>) => void;
  onDelete?: () => void;
  onClick?: () => void;
};

const MovieCard: React.FC<MovieCardProps> = ({ title, date, rating, review, poster, onUpdate, onDelete, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [editData, setEditData] = useState({
    title, date, rating, review
  });

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({ title, date, rating, review });
    setIsEditing(false);
  };

  // Swipe işlevleri
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isEditing) return;
    
    const currentPosition = e.touches[0].clientX;
    const diff = startX - currentPosition;
    
    // Sadece sağa kaydırma (pozitif değerler) izin ver
    if (diff < 0) {
      setCurrentX(0);
    } else if (diff > 120) {
      setCurrentX(120); // Maksimum kaydırma mesafesi
    } else {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (isEditing) return;
    setIsDragging(false);
    
    // Eğer 40px'den fazla kaydırıldıysa, swipe'ı aktif et
    if (currentX > 40) {
      setIsSwiped(true);
      setCurrentX(120);
    } else {
      setIsSwiped(false);
      setCurrentX(0);
    }
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setStartX(e.clientX);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isEditing) return;
    
    const currentPosition = e.clientX;
    const diff = startX - currentPosition;
    
    if (diff < 0) {
      setCurrentX(0);
    } else if (diff > 120) {
      setCurrentX(120);
    } else {
      setCurrentX(diff);
    }
  };

  const handleMouseUp = () => {
    if (isEditing) return;
    setIsDragging(false);
    
    if (currentX > 40) {
      setIsSwiped(true);
      setCurrentX(120);
    } else {
      setIsSwiped(false);
      setCurrentX(0);
    }
  };

  // Kart dışına tıklandığında swipe'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsSwiped(false);
        setCurrentX(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsSwiped(false);
    setCurrentX(0);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    }
    setIsSwiped(false);
    setCurrentX(0);
  };

  return (
    <div 
      ref={cardRef}
      className="relative w-[357px] min-w-[357px] overflow-hidden rounded-[16px]"
      onClick={onClick}
    >
      {/* Action Buttons - Background */}
      <div className="absolute right-0 top-0 w-[120px] h-[158px] flex items-center justify-center">
        <div className="flex items-center h-full w-full">
          {/* Edit Button */}
          {onUpdate && (
            <button
              onClick={handleEditClick}
              className="flex-1 h-full bg-[#4A90E2] hover:bg-[#357ABD] flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="flex-1 h-full bg-[#E74C3C] hover:bg-[#C0392B] flex items-center justify-center transition-all duration-200 active:scale-95 rounded-r-[16px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div 
        className="flex flex-row bg-[#222] rounded-[16px] shadow-[0_4px_10px_0_rgba(163,171,178,0.25)] p-[11px_16px] gap-5 w-[357px] min-w-[357px] min-h-[158px] transition-transform duration-300 ease-out relative z-10"
        style={{ 
          transform: `translateX(-${currentX}px)`,
          cursor: isDragging ? 'grabbing' : (isEditing ? 'default' : 'grab')
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={poster || 'https://placehold.co/72x108?text=No+Image'}
          alt={title}
          className="w-[72px] h-[108px] rounded-[12px] object-cover bg-[#E5E5E5]"
        />
        <div className="flex flex-col flex-1 justify-between h-full">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="text-white font-semibold text-[16px] leading-[24px] mb-1 font-poppins bg-[#333] rounded px-2 py-1 w-full"
              />
            ) : (
              <h3 className="text-white font-semibold text-[16px] leading-[24px] mb-1 font-poppins">{title}</h3>
            )}
            
            <div className="flex flex-row items-center text-[14px] gap-2 mb-1 font-poppins">
              <span className="font-normal text-[#FE7743]">Watched:</span>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                  className="font-medium text-white bg-[#333] rounded px-1 text-[12px]"
                />
              ) : (
                <span className="font-medium text-white">{date}</span>
              )}
            </div>
            
            <div className="flex flex-row items-center text-[14px] gap-2 mb-1 font-poppins">
              <span className="font-normal text-[#FE7743]">Rating:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.rating}
                  onChange={(e) => setEditData(prev => ({ ...prev, rating: e.target.value }))}
                  className="font-medium text-white bg-[#333] rounded px-1 text-[12px] w-16"
                  placeholder="9/10"
                />
              ) : (
                <span className="font-medium text-white">{rating}</span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FE7743" className="inline ml-1"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
            
            {isEditing ? (
              <textarea
                value={editData.review}
                onChange={(e) => setEditData(prev => ({ ...prev, review: e.target.value }))}
                className="text-[10px] text-white mt-2 font-poppins bg-[#333] rounded p-2 w-full resize-none"
                rows={3}
                placeholder="Your review..."
              />
            ) : (
              <div className={`text-[10px] text-[#EFEEEA] mt-2 font-poppins transition-all duration-300 ${expanded ? '' : 'line-clamp-3 overflow-hidden'}`}>{review}</div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            {/* Edit mode controls */}
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-[10px] font-medium font-poppins transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-[10px] font-medium font-poppins transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Read more/less for review */}
            {!isEditing && (review.split('\n').length > 3 || review.length > 120) ? (
              <div className="flex-1 flex justify-end">
                <span
                  className="text-[#FE7743] cursor-pointer text-[10px] font-medium font-poppins hover:underline"
                  onClick={() => setExpanded((prev: boolean) => !prev)}
                >
                  {expanded ? 'Show Less' : 'Read More'}
                </span>
              </div>
            ) : null}
            
            {/* Swipe indicator */}
            {!isEditing && !isSwiped && (
              <div className="flex-1 flex justify-end">
                <span className="text-gray-500 text-[8px] font-poppins opacity-60">
                  ← Swipe for options
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;