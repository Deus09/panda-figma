import React, { useState, useEffect } from 'react';
import { IonToast } from '@ionic/react';
import { getMovieDetails, getMovieCast, getMovieTrailerKey, getSimilarMovies, TMDBMovieDetails, TMDBCastMember, TMDBMovieResult } from '../services/tmdb';
import { LocalStorageService } from '../services/localStorage';
import ActorDetailModal from './ActorDetailModal';
import AddButtonModal from './AddButtonModal';
import { useModal } from '../context/ModalContext';

interface MovieDetailModalProps {
  open: boolean;
  onClose: () => void;
  movieId: number | null;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ open, onClose, movieId }) => {
  const { openModal, closeModal } = useModal();
  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetails | null>(null);
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovieResult[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [actorModalOpen, setActorModalOpen] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  
  // İzleme durumu state'i
  const [logStatus, setLogStatus] = useState<'watched' | 'watchlist' | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Film ekleme modalı state'i
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  useEffect(() => {
    if (open && movieId) {
      setSelectedMovieId(movieId);
      loadMovieDetails();
      loadTrailer();
      loadSimilarMovies();
      // İzleme durumunu kontrol et
      const status = LocalStorageService.getLogStatusByTmdbId(movieId, 'movie');
      setLogStatus(status);
    } else if (!open) {
      // Modal kapandığında state'leri temizle
      setMovieDetails(null);
      setCast([]);
      setTrailerKey(null);
      setSimilarMovies([]);
      setError(null);
      setLoading(false);
      setSelectedMovieId(null);
      setLogStatus(null);
      setShowToast(false);
      if (toastTimeout) {
        clearTimeout(toastTimeout);
        setToastTimeout(null);
      }
    }
  }, [open, movieId]);





  const loadMovieDetails = async () => {
    const movieIdToLoad = selectedMovieId || movieId;
    if (!movieIdToLoad) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [details, castData] = await Promise.all([
        getMovieDetails(movieIdToLoad),
        getMovieCast(movieIdToLoad)
      ]);
      
      setMovieDetails(details);
      setCast(castData);
    } catch (err) {
      setError('Failed to load movie details');
      console.error('Error loading movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrailer = async () => {
    const movieIdToLoad = selectedMovieId || movieId;
    if (!movieIdToLoad) return;
    const key = await getMovieTrailerKey(movieIdToLoad);
    setTrailerKey(key);
  };

  const loadSimilarMovies = async () => {
    const movieIdToLoad = selectedMovieId || movieId;
    if (!movieIdToLoad) return;
    const movies = await getSimilarMovies(movieIdToLoad);
    setSimilarMovies(movies);
  };

  const handleSimilarMovieClick = (newMovieId: number) => {
    // Reset states for new movie
    setMovieDetails(null);
    setCast([]);
    setTrailerKey(null);
    setSimilarMovies([]);
    setError(null);
    setLoading(true);
    // Set new movie ID and trigger loading
    setSelectedMovieId(newMovieId);
    // Load new movie data
    loadMovieDetails();
    loadTrailer();
    loadSimilarMovies();
  };

  const handleActorClick = (actorId: number) => {
    openModal('actor', actorId);
  };

  const handleActorModalClose = () => {
    setActorModalOpen(false);
    setSelectedActorId(null);
  };

  // İzleme durumu buton işleyicileri
  const handleWatchlistToggle = () => {
    const movieIdToUpdate = selectedMovieId || movieId;
    if (!movieIdToUpdate || !movieDetails) return;

    const newType = logStatus === 'watchlist' ? null : 'watchlist';
    
    if (newType === null) {
      // Kaydı sil
      const logs = LocalStorageService.getMovieLogs();
      const logToDelete = logs.find(log => log.tmdbId === movieIdToUpdate && log.mediaType === 'movie');
      if (logToDelete) {
        LocalStorageService.deleteMovieLog(logToDelete.id);
      }
      setLogStatus(null);
    } else {
      // Önce mevcut kaydı güncellemeyi dene
      let updatedLog = LocalStorageService.updateLogTypeByTmdbId(movieIdToUpdate, newType, 'movie');
      
      if (!updatedLog) {
        // Kayıt yoksa yeni kayıt oluştur
        updatedLog = LocalStorageService.saveMovieLog({
          title: movieDetails.title,
          date: new Date().toISOString().split('T')[0],
          rating: '',
          review: '',
          poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : '',
          type: newType,
          mediaType: 'movie',
          tmdbId: movieIdToUpdate,
          contentType: 'movie',
          genres: movieDetails.genres?.map(g => g.name) || [],
          releaseYear: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : undefined,
          runtime: movieDetails.runtime || 120
        });
      }
      setLogStatus(newType);
    }
  };

  const handleWatchedToggle = () => {
    const movieIdToUpdate = selectedMovieId || movieId;
    if (!movieIdToUpdate || !movieDetails) return;

    const newType = logStatus === 'watched' ? null : 'watched';
    
    if (newType === null) {
      // Kaydı sil
      const logs = LocalStorageService.getMovieLogs();
      const logToDelete = logs.find(log => log.tmdbId === movieIdToUpdate && log.mediaType === 'movie');
      if (logToDelete) {
        LocalStorageService.deleteMovieLog(logToDelete.id);
      }
      setLogStatus(null);
    } else {
      // Önce mevcut kaydı güncellemeyi dene
      let updatedLog = LocalStorageService.updateLogTypeByTmdbId(movieIdToUpdate, newType, 'movie');
      
      if (!updatedLog) {
        // Kayıt yoksa yeni kayıt oluştur
        updatedLog = LocalStorageService.saveMovieLog({
          title: movieDetails.title,
          date: new Date().toISOString().split('T')[0],
          rating: '',
          review: '',
          poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : '',
          type: newType,
          mediaType: 'movie',
          tmdbId: movieIdToUpdate,
          contentType: 'movie',
          genres: movieDetails.genres?.map(g => g.name) || [],
          releaseYear: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : undefined,
          runtime: movieDetails.runtime || 120
        });
      }
      setLogStatus(newType);
      
      // Toast bildirimi göster
      if (newType === 'watched') {
        setShowToast(true);
        const timeout = setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setToastTimeout(timeout);
      }
    }
  };

  const handleRatingClick = () => {
    // Toast'u kapat
    setShowToast(false);
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      setToastTimeout(null);
    }
    
    // Film ekleme modalını aç
    if (movieDetails) {
      setPrefillData({
        title: movieDetails.title,
        poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : '',
        tmdbId: movieDetails.id,
        mediaType: 'movie',
        contentType: 'movie',
        genres: movieDetails.genres?.map(g => g.name) || [],
        releaseYear: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : undefined,
        runtime: movieDetails.runtime || 120,
        type: 'watched' // Zaten izlendi olarak işaretlendiği için
      });
      setShowAddMovieModal(true);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };

  const formatYear = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  if (!open) return null;

  function handleWatchlistAdd(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.stopPropagation();
    handleWatchlistToggle();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full h-full bg-[#0C1117] overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-6 h-6 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="#F8F8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistAdd}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all duration-200"
          aria-label="Daha sonra izle listesine ekle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50" fill="#F8F8FF">
            <path d="M 12.8125 2 C 12.335938 2.089844 11.992188 2.511719 12 3 L 12 47 C 11.996094 47.359375 12.1875 47.691406 12.496094 47.871094 C 12.804688 48.054688 13.1875 48.054688 13.5 47.875 L 25 41.15625 L 36.5 47.875 C 36.8125 48.054688 37.195313 48.054688 37.503906 47.871094 C 37.8125 47.691406 38.003906 47.359375 38 47 L 38 3 C 38 2.449219 37.550781 2 37 2 L 13 2 C 12.96875 2 12.9375 2 12.90625 2 C 12.875 2 12.84375 2 12.8125 2 Z M 14 4 L 36 4 L 36 45.25 L 25.5 39.125 C 25.191406 38.945313 24.808594 38.945313 24.5 39.125 L 14 45.25 Z"></path>
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white font-poppins">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 font-poppins">{error}</div>
          </div>
        ) : movieDetails ? (
          <>
            {/* Poster Background */}
            <div className="relative h-[424px] w-full">
              <img
                src={movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w500${movieDetails.backdrop_path}` : 'https://placehold.co/393x424?text=No+Image'}
                alt={movieDetails.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
            </div>

            {/* Content Container */}
            <div className="relative -mt-16 px-[18px] pb-20">
              <div className="bg-[#0C1117] rounded-t-[24px] p-4 pb-8">
                {/* Movie Title and Genres */}
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-[#F8F8FF] font-poppins font-extrabold text-2xl leading-6 drop-shadow-[0_4px_15px_rgba(255,255,255,0.7)]">
                    {movieDetails.title}
                  </h1>
                  <div className="flex gap-1">
                    {movieDetails.genres?.slice(0, 2).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-1 py-0.5 bg-[rgba(254,119,67,0.5)] rounded-lg text-[#F8F8FF] text-[10px] font-poppins font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Year and Runtime */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#F8F8FF] font-poppins font-semibold text-base drop-shadow-[0_8px_15px_rgba(255,255,255,0.7)]">
                    {formatYear(movieDetails.release_date)}
                  </span>
                  <div className="w-2.5 h-2.5 bg-[#F8F8FF] rounded-full drop-shadow-[0_8px_15px_rgba(255,255,255,0.7)]"></div>
                  <span className="text-[#F8F8FF] font-poppins font-semibold text-base drop-shadow-[0_8px_15px_rgba(255,255,255,0.7)]">
                    {movieDetails.runtime ? formatRuntime(movieDetails.runtime) : ''}
                  </span>
                </div>

                {/* İzleme Durumu Butonları */}
                <div className="flex items-center gap-4 mb-4">
                  {/* İzledim Butonu */}
                  <button
                    onClick={handleWatchedToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                      logStatus === 'watched' 
                        ? 'bg-[#FE7743] text-white shadow-lg' 
                        : 'bg-transparent text-[#F8F8FF] border border-[#F8F8FF] hover:bg-[#F8F8FF] hover:text-[#0C1117]'
                    }`}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill={logStatus === 'watched' ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-poppins font-medium text-sm">
                      {logStatus === 'watched' ? 'İzlendi' : 'İzledim'}
                    </span>
                  </button>

                  {/* İzleme Listesi Butonu - sadece izlenmediyse göster */}
                  {logStatus !== 'watched' && (
                    <button
                      onClick={handleWatchlistToggle}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                        logStatus === 'watchlist' 
                          ? 'bg-[#FE7743] text-white shadow-lg' 
                          : 'bg-transparent text-[#F8F8FF] border border-[#F8F8FF] hover:bg-[#F8F8FF] hover:text-[#0C1117]'
                      }`}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={logStatus === 'watchlist' ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-poppins font-medium text-sm">
                        {logStatus === 'watchlist' ? 'Listede' : 'Listeme Ekle'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Rating */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FE7743] rounded-xl mb-2 drop-shadow-[0_4px_15px_rgba(255,255,255,0.5)]">
                  <span className="text-[#F8F8FF] font-poppins text-xs">IMDB Rating:</span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#F8F8FF] font-poppins text-sm">
                      {movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F8F8FF">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-[#EFEEEA] font-poppins text-xs leading-6 mb-4">
                  {movieDetails.overview || 'No overview available.'}
                </p>

                {/* Cast Section */}
                <div className="mb-4">
                  <h2 className="text-[#EFEEEA] font-poppins font-bold text-2xl mb-1">Stars</h2>
                  <div className="flex gap-4 overflow-x-auto">
                    {cast.slice(0, 6).map((member) => (
                      <div 
                        key={member.id} 
                        className="flex flex-col items-center gap-1 min-w-[46px] cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleActorClick(member.id)}
                      >
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-[#D9D9D9]">
                          <img
                            src={member.profile_path ? `https://image.tmdb.org/t/p/w500${member.profile_path}` : 'https://placehold.co/50x50?text=?'}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[#F8F8FF] font-poppins text-[10px] font-medium text-center leading-3">
                          {member.name.split(' ').slice(0, 2).join('\n')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Watch Trailer Section */}
                <div className="mb-4">
                  <h2 className="text-[#F8F8FF] font-poppins font-bold text-2xl mb-2">Watch Trailer</h2>
                  {trailerKey ? (
                    <div className="w-full h-40 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${trailerKey}`}
                        title="YouTube trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-[#F8F8FF] font-poppins">Trailer not found</span>
                    </div>
                  )}
                </div>

                {/* Liked Others Section */}
                <div className="mb-6">
                  <h2 className="text-[#F8F8FF] font-poppins font-bold text-2xl mb-2">Liked others</h2>
                  <div className="flex gap-3 overflow-x-auto pb-4">
                    {similarMovies.slice(0, 5).map((movie) => (
                      <div 
                        key={movie.id} 
                        className="w-[90px] h-[135px] bg-gray-800 rounded-lg border border-white flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleSimilarMovieClick(movie.id)}
                      >
                        <img
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Actor Detail Modal */}
        <ActorDetailModal
          open={actorModalOpen}
          onClose={handleActorModalClose}
          actorId={selectedActorId}
          onMovieClick={handleSimilarMovieClick}
        />

        {/* Add Movie Modal */}
        <AddButtonModal
          open={showAddMovieModal}
          onClose={() => {
            setShowAddMovieModal(false);
            setPrefillData(null);
          }}
          onSave={(log?: any) => {
            setShowAddMovieModal(false);
            setPrefillData(null);
            // Başarı mesajı göster
            console.log('Film puan ve yorum ile güncellendi:', log);
          }}
          onAddMovieLog={(log: any) => {
            // Film log'unu güncelle
            if (log && movieDetails) {
              LocalStorageService.updateMovieLog(log.id, {
                rating: log.rating,
                review: log.review
              });
            }
          }}
          prefillData={prefillData}
        />

        {/* Success Toast */}
        {showToast && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm mx-4">
              <h1 className="text-black text-2xl font-bold mb-4">Başarılı!</h1>
              <p className="text-black mb-4">
                "{movieDetails?.title}" izlendi olarak işaretlendi.
              </p>
              <button 
                className="w-full h-[40px] rounded-[12px] bg-[#FE7743] text-white text-[14px] font-poppins font-semibold shadow-lg hover:bg-[#e66a3a] transition-colors duration-200"
                onClick={handleRatingClick}
              >
                Puan & Yorum Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailModal;