import React, { useState, useEffect, useRef } from 'react';
import { IonDatetime, IonModal } from '@ionic/react';
import { searchMovies, TMDBMovieResult, TMDBCastMember } from '../services/tmdb';
import { improveComment, chatWithCast } from '../services/gemini';
import CastSelectionModal from './CastSelectionModal';
import CastChatModal from './CastChatModal';

interface AddButtonModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (log?: { selectedMovie?: TMDBMovieResult; tmdbId?: number }) => void;
  onAddMovieLog?: (log: any) => void;
  onMovieSelect?: (movie: TMDBMovieResult, id: number) => void;
}

const AddButtonModal: React.FC<AddButtonModalProps> = ({ open, onClose, onSave, onAddMovieLog, onMovieSelect }) => {
  const [watchList, setWatchList] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<TMDBMovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovieResult | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState('');
  const [improving, setImproving] = useState(false);
  const [improved, setImproved] = useState('');
  const [showImproveAlert, setShowImproveAlert] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [pendingImproved, setPendingImproved] = useState('');
  
  // Cast chat states
  const [showCastSelection, setShowCastSelection] = useState(false);
  const [showCastChat, setShowCastChat] = useState(false);
  const [selectedCastMember, setSelectedCastMember] = useState<TMDBCastMember | null>(null);

  React.useEffect(() => {
    console.log('Selected rating:', rating);
  }, [rating]);

  React.useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedMovie(null);
      setTmdbId(null);
      setRating(0);
      setHoverRating(null);
      setDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      });
      setComment('');
      setWatchList(false);
      setShowCastSelection(false);
      setShowCastChat(false);
      setSelectedCastMember(null);
    }
  }, [open]);

  useEffect(() => {
    if (search.length >= 3) {
      setLoading(true);
      searchMovies(search)
        .then(res => setSuggestions(res))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [search]);

  if (!open) return null;

  const handleCancel = () => {
    setSearch('');
    setSelectedMovie(null);
    setTmdbId(null);
    setRating(0);
    setHoverRating(null);
    setDate(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    setComment('');
    setWatchList(false);
    onClose();
  };

  // Sparkle butonuna tıklama fonksiyonu
  const handleImprove = async () => {
    if (!comment.trim() || !selectedMovie) return;
    setImproving(true);
    try {
      const result = await improveComment(comment, selectedMovie.title);
      setPendingImproved(result);
      setActionSheetOpen(true);
    } catch {
      // hata yönetimi eklenebilir
    } finally {
      setImproving(false);
    }
  };

  const handleSave = () => {
    if (!selectedMovie) return;
    console.log('handleSave called, selectedMovie:', selectedMovie.title);
    
    const log = {
      title: selectedMovie.title,
      date,
      rating: rating.toString(),
      review: comment,
      poster: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}` : '',
      type: watchList ? 'watchlist' : 'watched',
    };
    onAddMovieLog?.(log);
    
    // Modal'ı kapat
    onSave({ selectedMovie, tmdbId: tmdbId ?? undefined });
  };

  const handleChatWithCast = () => {
    setShowCastSelection(true);
  };

  const handleCastSelect = (castMember: TMDBCastMember) => {
    setSelectedCastMember(castMember);
    setShowCastChat(true);
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!selectedCastMember || !selectedMovie) {
      throw new Error('No cast member or movie selected');
    }
    
    return await chatWithCast(message, selectedCastMember, selectedMovie.title);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40">
        <div className="w-[393px] max-h-[95vh] h-[95vh] rounded-t-[54px] bg-[#222] pb-6 pt-6 px-4 shadow-2xl animate-slideInUp overflow-y-auto">
          {/* Modal Title */}
          <div className="flex justify-center mb-8">
            <span className="text-[24px] font-extrabold font-poppins text-[#F8F8FF] text-center drop-shadow-[0_4px_15px_rgba(255,255,255,0.5)]">Add Flicks/Series</span>
          </div>
          {/* Search Bar */}
          <div className="mb-8 relative">
            <span className="block text-[16px] font-semibold font-poppins text-[#F8F8FF] mb-1">Search a flick/series</span>
            <div className="relative">
              <input
                className="w-full h-[40px] rounded-[12px] bg-[#EFEEEA] pl-10 pr-10 text-black text-[16px] font-poppins font-semibold outline-none"
                placeholder="Fight Club"
                value={selectedMovie ? selectedMovie.title : search}
                onChange={e => {
                  setSearch(e.target.value);
                  setSelectedMovie(null);
                  setTmdbId(null);
                }}
                onFocus={() => setSuggestions(search.length >= 3 ? suggestions : [])}
              />
              {/* X butonu */}
              {(search.length > 0 || selectedMovie) && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-[#FE7743] focus:outline-none"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch('');
                    setSelectedMovie(null);
                    setTmdbId(null);
                  }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" fill="none" stroke="#000" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
              </svg>
              {search.length >= 3 && suggestions.length > 0 && !selectedMovie && (
                <div ref={suggestionsRef} className="absolute left-0 top-[44px] w-full bg-white rounded-b-[12px] shadow-lg z-50 max-h-72 overflow-y-auto border border-[#FE7743]">
                  {loading && <div className="p-2 text-sm text-gray-400">Loading...</div>}
                  {suggestions.map(movie => (
                    <div
                      key={movie.id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#FE7743]/10"
                      onClick={() => {
                        setSelectedMovie(movie);
                        setTmdbId(movie.id);
                        setSuggestions([]);
                        setSearch(movie.title);
                        if (onMovieSelect) onMovieSelect(movie, movie.id);
                      }}
                    >
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://placehold.co/40x60?text=No+Image'}
                        alt={movie.title}
                        className="w-10 h-16 object-cover rounded"
                      />
                      <span className="text-black text-[15px] font-poppins">{movie.title}</span>
                      <span className="text-xs text-gray-400 ml-auto">{movie.release_date?.slice(0,4) || ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Add Watch List Toggle */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[16px] font-semibold font-poppins text-[#F8F8FF]">Add Watch List</span>
            <button
              type="button"
              aria-pressed={watchList}
              onClick={() => setWatchList(v => !v)}
              className={`w-12 h-7 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${watchList ? 'bg-[#FE7743]' : 'bg-[#D9D9D9]'}`}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${watchList ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
          </div>
          {/* Date Watched */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[16px] font-semibold font-poppins text-[#F8F8FF]">Date Watched</span>
            <button
              type="button"
              className={`w-[130px] h-[40px] rounded-[12px] bg-[#D9D9D9] flex items-center justify-center text-[#000] text-[16px] font-poppins font-semibold relative ${watchList ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !watchList && setShowDatePicker(true)}
              disabled={watchList}
            >
              {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
            </button>
            <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
              <div className="flex flex-col items-center justify-center h-full bg-[#222]">
                <IonDatetime
                  presentation="date"
                  preferWheel={true}
                  value={date}
                  onIonChange={e => {
                    if (e.detail.value) setDate(e.detail.value as string);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full"
                  disabled={watchList}
                />
                <button
                  className="mt-4 px-6 py-2 rounded-lg bg-[#FE7743] text-white font-poppins font-semibold"
                  onClick={() => setShowDatePicker(false)}
                  disabled={watchList}
                >
                  Set Date
                </button>
              </div>
            </IonModal>
          </div>
          {/* Rating */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[16px] font-semibold font-poppins text-[#F8F8FF]">Rating</span>
            <div className={`flex gap-1 ${watchList ? 'opacity-50 pointer-events-none' : ''}`}>
              {[1,2,3,4,5].map(i => {
                const value = i;
                const displayValue = hoverRating !== null ? hoverRating : rating;
                let fill = '#D9D9D9';
                if (displayValue >= value) fill = '#FE7743';
                else if (displayValue >= value - 0.5) fill = 'url(#half-star)';
                return (
                  <svg
                    key={i}
                    width="35" height="33" viewBox="0 0 35 33" fill="none"
                    onMouseMove={watchList ? undefined : e => {
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = e.clientX - left;
                      if (x < width / 2) setHoverRating(value - 0.5);
                      else setHoverRating(value);
                    }}
                    onMouseLeave={watchList ? undefined : () => setHoverRating(null)}
                    onClick={watchList ? undefined : e => {
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = e.clientX - left;
                      if (x < width / 2) setRating(value - 0.5);
                      else setRating(value);
                    }}
                    onTouchStart={watchList ? undefined : e => {
                      const touch = e.touches[0];
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = touch.clientX - left;
                      if (x < width / 2) setHoverRating(value - 0.5);
                      else setHoverRating(value);
                    }}
                    onTouchEnd={watchList ? undefined : e => {
                      const touch = e.changedTouches[0];
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = touch.clientX - left;
                      if (x < width / 2) setRating(value - 0.5);
                      else setRating(value);
                      setHoverRating(null);
                    }}
                    style={{ cursor: watchList ? 'not-allowed' : 'pointer', transition: 'fill 0.2s' }}
                  >
                    <defs>
                      <linearGradient id="half-star" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="50%" stopColor="#FE7743" />
                        <stop offset="50%" stopColor="#D9D9D9" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="17.5,2 22.5,12.5 34,13.5 25,21.5 28,32 17.5,26 7,32 10,21.5 1,13.5 12.5,12.5"
                      fill={fill}
                      stroke="#FE7743"
                      strokeWidth="2"
                    />
                  </svg>
                );
              })}
            </div>
          </div>
          {/* Comment */}
          <div className="mb-8 relative">
            <span className="block text-[16px] font-semibold font-poppins text-[#F8F8FF] mb-1">Add a comment</span>
            <div className="relative">
              <textarea
                className={`w-full min-h-[150px] max-h-[250px] rounded-[12px] bg-[#D9D9D9] p-3 pr-10 text-black text-[16px] font-poppins font-normal resize-none outline-none overflow-y-auto ${watchList ? 'opacity-50 pointer-events-none' : ''}`}
                placeholder="Write your comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={watchList}
                style={{ height: 'auto', maxHeight: 250, minHeight: 150 }}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 250) + 'px';
                }}
              />
              <button
                type="button"
                className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-transparent p-0 m-0 focus:outline-none"
                tabIndex={-1}
                aria-label="Sparkle"
                disabled={watchList || improving || !selectedMovie}
                onClick={handleImprove}
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 50 50">
                  <path d="M22.462 11.035l2.88 7.097c1.204 2.968 3.558 5.322 6.526 6.526l7.097 2.88c1.312.533 1.312 2.391 0 2.923l-7.097 2.88c-2.968 1.204-5.322 3.558-6.526 6.526l-2.88 7.097c-.533 1.312-2.391 1.312-2.923 0l-2.88-7.097c-1.204-2.968-3.558-5.322-6.526-6.526l-7.097-2.88c-1.312-.533-1.312-2.391 0-2.923l7.097-2.88c2.968-1.204 5.322-3.558 6.526-6.526l2.88-7.097C20.071 9.723 21.929 9.723 22.462 11.035zM39.945 2.701l.842 2.428c.664 1.915 2.169 3.42 4.084 4.084l2.428.842c.896.311.896 1.578 0 1.889l-2.428.842c-1.915.664-3.42 2.169-4.084 4.084l-.842 2.428c-.311.896-1.578.896-1.889 0l-.842-2.428c-.664-1.915-2.169-3.42-4.084-4.084l-2.428-.842c-.896-.311-.896-1.578 0-1.889l2.428-.842c1.915-.664 3.42-2.169 4.084-4.084l.842-2.428C38.366 1.805 39.634 1.805 39.945 2.701z"></path>
                </svg>
              </button>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-6">
            <button onClick={handleCancel} className="w-[130px] h-[40px] rounded-[12px] bg-[#EFEEEA] text-[#222] text-[16px] font-poppins font-semibold shadow-md">Cancel</button>
            <button onClick={handleSave} className="w-[130px] h-[40px] rounded-[12px] bg-[#FE7743] text-[#F8F8FF] text-[16px] font-poppins font-semibold shadow-lg">Save</button>
          </div>
        </div>
        {actionSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center w-[90vw] max-w-[350px]">
              <span className="text-black font-poppins text-base mb-4">Yorumunuzu geliştirmek istiyor musunuz?</span>
              <div className="bg-[#F3F2EF] rounded p-2 text-xs text-gray-700 mb-4 w-full max-h-[120px] overflow-y-auto">{pendingImproved}</div>
              <div className="flex gap-4">
                <button className="px-4 py-1 rounded bg-[#FE7743] text-white font-poppins" onClick={() => { setComment(pendingImproved); setActionSheetOpen(false); setPendingImproved(''); }}>Yes</button>
                <button className="px-4 py-1 rounded bg-gray-300 text-black font-poppins" onClick={() => { setActionSheetOpen(false); setPendingImproved(''); }}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cast Selection Modal */}
      <CastSelectionModal
        open={showCastSelection}
        onClose={() => {
          setShowCastSelection(false);
        }}
        movieId={tmdbId || 0}
        movieTitle={selectedMovie?.title || ''}
        onCastSelect={handleCastSelect}
      />

      {/* Cast Chat Modal */}
      {selectedCastMember && (
        <CastChatModal
          open={showCastChat}
          onClose={() => {
            setShowCastChat(false);
            setSelectedCastMember(null);
            // Chat kapandığında ana modal'ı da kapat
            onSave();
          }}
          castMember={selectedCastMember}
          movieTitle={selectedMovie?.title || ''}
          onSendMessage={handleSendMessage}
        />
      )}
    </>
  );
};

export default AddButtonModal; 