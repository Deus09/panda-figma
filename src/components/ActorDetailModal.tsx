import React, { useState, useEffect } from 'react';
import { getActorDetails, getActorCredits, TMDBActorDetails, TMDBActorCredit } from '../services/tmdb';
import FilmographyCard from './FilmographyCard';
import { useModal } from '../context/ModalContext';

interface ActorDetailModalProps {
  open: boolean;
  onClose: () => void; // Modal kapandığında tetiklenecek dış callback
  actorId: number | null;
  onMovieClick?: (movieId: number) => void; // Film kartına tıklandığında opsiyonel
  onSeriesClick?: (seriesId: number) => void; // Dizi kartına tıklandığında opsiyonel
}

type FilmographyTab = 'movies' | 'tv';

const ActorDetailModal: React.FC<ActorDetailModalProps> = ({ 
  open, 
  onClose, 
  actorId,
  onMovieClick,
  onSeriesClick
}) => {
  const { openModal, closeModal } = useModal();
  const [actorDetails, setActorDetails] = useState<TMDBActorDetails | null>(null);
  const [credits, setCredits] = useState<TMDBActorCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<FilmographyTab>('movies');

  useEffect(() => {
    if (open && actorId) {
      loadActorData();
    }
  }, [open, actorId]);

  const loadActorData = async () => {
    if (!actorId) return;
    
    setLoading(true);
    setError(null);
    setIsBioExpanded(false);
    setActiveTab('movies');
    
    try {
      const [details, filmography] = await Promise.all([
        getActorDetails(actorId),
        getActorCredits(actorId)
      ]);
      
      setActorDetails(details);
      setCredits(filmography);
      console.log('Actor details loaded:', details);
      console.log('Filmography loaded:', filmography);
    } catch (err) {
      setError('Oyuncu detayları yüklenemedi');
      console.error('Error loading actor details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate?: string, deathDate?: string) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getFilteredCredits = () => {
    const filtered = credits.filter(credit => {
      if (activeTab === 'movies') {
        return credit.media_type === 'movie';
      } else {
        return credit.media_type === 'tv';
      }
    });
    console.log(`Filtered credits for ${activeTab}:`, filtered);
    console.log('All credits:', credits);
    console.log('Active tab:', activeTab);
    return filtered;
  };

  const getPopularCredits = () => {
    const filtered = getFilteredCredits();
    return filtered
      .filter(credit => credit.vote_average && credit.vote_average > 6)
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 4);
  };

  const handleFilmographyCardClick = (id: number, mediaType: 'movie' | 'tv') => {
    if (mediaType === 'movie') {
      onMovieClick?.(id); // dış callback
      openModal('movie', id);
    } else if (mediaType === 'tv') {
      onSeriesClick?.(id); // dış callback
      // İleride dizi detay modalı açılabilir
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full h-full bg-[#0C1117] overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => { closeModal(); onClose(); }}
          className="absolute top-12 left-4 z-10 w-6 h-6 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="#F8F8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white font-poppins">Yükleniyor...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 font-poppins">{error}</div>
          </div>
        ) : actorDetails ? (
          <div className="px-[18px] py-16">
            {/* Hero Section */}
            <div className="flex gap-4 mb-6">
              {/* Profile Photo */}
              <div className="w-32 h-48 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={actorDetails.profile_path ? `https://image.tmdb.org/t/p/w300${actorDetails.profile_path}` : 'https://placehold.co/128x192?text=No+Photo'}
                  alt={actorDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actor Info */}
              <div className="flex-1">
                <h1 className="text-[#F8F8FF] font-poppins font-bold text-2xl leading-7 mb-3">
                  {actorDetails.name}
                </h1>
                
                <div className="space-y-2">
                  {actorDetails.birthday && (
                    <div className="flex items-center gap-2 text-[#EFEEEA] font-poppins text-sm">
                      <span>🎂</span>
                      <span>
                        {calculateAge(actorDetails.birthday, actorDetails.deathday)} yaşında
                        {actorDetails.deathday && ' (vefat etmiş)'}
                      </span>
                    </div>
                  )}
                  
                  {actorDetails.place_of_birth && (
                    <div className="flex items-center gap-2 text-[#EFEEEA] font-poppins text-sm">
                      <span>📍</span>
                      <span>{actorDetails.place_of_birth}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Biography Section */}
            {actorDetails.biography && (
              <div className="mb-6">
                <h2 className="text-[#F8F8FF] font-poppins font-bold text-xl mb-3">
                  Biyografi
                </h2>
                
                <div className="relative">
                  <p className={`text-[#EFEEEA] font-poppins text-sm leading-6 transition-all duration-300 ${!isBioExpanded ? 'line-clamp-4' : ''}`}>
                    {actorDetails.biography}
                  </p>
                  
                  {actorDetails.biography.length > 200 && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="text-[#FE7743] font-poppins text-sm font-medium mt-2 hover:underline transition-all"
                    >
                      {isBioExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filmography Section */}
            <div>
              <h2 className="text-[#F8F8FF] font-poppins font-bold text-xl mb-4">
                Filmografi
              </h2>

              {/* Tab Segment */}
              <div className="flex w-[193px] h-[32px] rounded-[10px] overflow-hidden border border-white bg-[#222] mb-4">
                <button
                  className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-sm border-r border-white rounded-l-[9px] transition-all duration-300 ${activeTab === 'movies' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
                  onClick={() => {
                    console.log('Switching to movies tab');
                    setActiveTab('movies');
                  }}
                  type="button"
                >
                  Filmler
                </button>
                <button
                  className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-sm rounded-r-[9px] transition-all duration-300 ${activeTab === 'tv' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
                  onClick={() => {
                    console.log('Switching to tv tab');
                    setActiveTab('tv');
                  }}
                  type="button"
                >
                  Diziler
                </button>
              </div>

              {/* Popular Works */}
              {getPopularCredits().length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[#EFEEEA] font-poppins font-semibold text-lg mb-3">
                    Bilinen Yapımları
                  </h3>
                  
                  <div className="flex gap-3 overflow-x-auto pb-4">
                    {getPopularCredits().map((credit, index) => (
                      <div 
                        key={`popular-${credit.id}-${credit.media_type}-${index}`}
                        className="w-[90px] h-[135px] bg-gray-800 rounded-lg border border-white flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleFilmographyCardClick(credit.id, credit.media_type)}
                      >
                        <img
                          src={credit.poster_path ? `https://image.tmdb.org/t/p/w500${credit.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                          alt={credit.title || credit.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Filmography */}
              <div>
                <h3 className="text-[#EFEEEA] font-poppins font-semibold text-lg mb-3">
                  Tüm {activeTab === 'movies' ? 'Filmler' : 'Diziler'}
                </h3>
                
                <div className="space-y-3">
                  {getFilteredCredits().map((credit, index) => (
                    <FilmographyCard
                      key={`${credit.id}-${credit.media_type}-${index}`}
                      credit={credit}
                      onCardClick={handleFilmographyCardClick}
                    />
                  ))}
                  
                  {getFilteredCredits().length === 0 && (
                    <div className="text-[#EFEEEA] font-poppins text-sm opacity-70 text-center py-8">
                      {activeTab === 'movies' ? 'Film bulunamadı' : 'Dizi bulunamadı'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ActorDetailModal;
