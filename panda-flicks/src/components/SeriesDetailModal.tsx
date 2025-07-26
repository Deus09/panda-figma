import React, { useState, useEffect } from 'react';
import { getSeriesDetails, getSeriesCast, getSeriesTrailerKey, getSimilarSeries, TMDBSeriesDetails, TMDBCastMember, TMDBMovieResult } from '../services/tmdb';

interface SeriesDetailModalProps {
  open: boolean;
  onClose: () => void;
  seriesId: number | null;
}

const SeriesDetailModal: React.FC<SeriesDetailModalProps> = ({ open, onClose, seriesId }) => {
  const [seriesDetails, setSeriesDetails] = useState<TMDBSeriesDetails | null>(null);
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [similarSeries, setSimilarSeries] = useState<TMDBMovieResult[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);

  useEffect(() => {
    if (open && seriesId) {
      setSelectedSeriesId(seriesId);
      loadSeriesDetails();
      loadTrailer();
      loadSimilarSeries();
    }
  }, [open, seriesId]);

  useEffect(() => {
    if (selectedSeriesId) {
      loadSeriesDetails();
      loadTrailer();
      loadSimilarSeries();
    }
  }, [selectedSeriesId]);

  const loadSeriesDetails = async () => {
    if (!selectedSeriesId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [details, castData] = await Promise.all([
        getSeriesDetails(selectedSeriesId),
        getSeriesCast(selectedSeriesId)
      ]);
      
      setSeriesDetails(details);
      setCast(castData);
    } catch (err) {
      setError('Failed to load series details');
      console.error('Error loading series details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrailer = async () => {
    if (!selectedSeriesId) return;
    const key = await getSeriesTrailerKey(selectedSeriesId);
    setTrailerKey(key);
  };

  const loadSimilarSeries = async () => {
    if (!selectedSeriesId) return;
    const series = await getSimilarSeries(selectedSeriesId);
    setSimilarSeries(series);
  };

  const handleSimilarSeriesClick = (newSeriesId: number) => {
    // Reset states for new series
    setSeriesDetails(null);
    setCast([]);
    setTrailerKey(null);
    setSimilarSeries([]);
    setError(null);
    setLoading(true);
    // Set new series ID - this will trigger useEffect
    setSelectedSeriesId(newSeriesId);
  };

  const formatYear = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  if (!open) return null;

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

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white font-poppins">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 font-poppins">{error}</div>
          </div>
        ) : seriesDetails ? (
          <>
            {/* Poster Background */}
            <div className="relative h-[424px] w-full">
              <img
                src={seriesDetails.backdrop_path ? `https://image.tmdb.org/t/p/w500${seriesDetails.backdrop_path}` : 'https://placehold.co/393x424?text=No+Image'}
                alt={seriesDetails.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
            </div>

            {/* Content Container */}
            <div className="relative -mt-16 px-[18px] pb-6">
              <div className="bg-[#0C1117] rounded-t-[24px] p-4">
                {/* Series Title and Genres */}
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-[#F8F8FF] font-poppins font-extrabold text-2xl leading-6 drop-shadow-[0_4px_15px_rgba(255,255,255,0.7)]">
                    {seriesDetails.name}
                  </h1>
                  <div className="flex gap-1">
                    {seriesDetails.genres?.slice(0, 2).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-1 py-0.5 bg-[rgba(254,119,67,0.5)] rounded-lg text-[#F8F8FF] text-[10px] font-poppins font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Seasons and Episodes */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#F8F8FF] font-poppins font-semibold text-base drop-shadow-[0_8px_15px_rgba(255,255,255,0.7)]">
                    {seriesDetails.number_of_seasons} seasons
                  </span>
                  <div className="w-2.5 h-2.5 bg-[#F8F8FF] rounded-full drop-shadow-[0_8px_15px_rgba(255,255,255,0.7)]"></div>
                  <span className="text-[#F8F8FF] font-poppins font-semibold text-base drop-shadow-[0_8px_15px_rgba(255,255,255,0.7)]">
                    {seriesDetails.number_of_episodes} episodes
                  </span>
                </div>

                {/* Rating */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FE7743] rounded-xl mb-2 drop-shadow-[0_4px_15px_rgba(239,238,234,0.5)]">
                  <span className="text-[#F8F8FF] font-poppins text-xs">IMDB Rating:</span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#F8F8FF] font-poppins text-sm">
                      {seriesDetails.vote_average ? seriesDetails.vote_average.toFixed(1) : 'N/A'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F8F8FF">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-[#EFEEEA] font-poppins text-xs leading-6 mb-4">
                  {seriesDetails.overview || 'No overview available.'}
                </p>

                {/* Cast Section */}
                <div className="mb-4">
                  <h2 className="text-[#EFEEEA] font-poppins font-bold text-2xl mb-1">Stars</h2>
                  <div className="flex gap-4 overflow-x-auto">
                    {cast.slice(0, 6).map((member) => (
                      <div key={member.id} className="flex flex-col items-center gap-1 min-w-[46px]">
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-[#D9D9D9]">
                          <img
                            src={member.profile_path ? `https://image.tmdb.org/t/p/w92${member.profile_path}` : 'https://placehold.co/50x50?text=?'}
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
                <div>
                  <h2 className="text-[#F8F8FF] font-poppins font-bold text-2xl mb-2">Liked others</h2>
                  <div className="flex gap-3 overflow-x-auto">
                    {similarSeries.slice(0, 5).map((series) => (
                      <div 
                        key={series.id} 
                        className="w-[90px] h-[135px] bg-gray-800 rounded-lg border border-white flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleSimilarSeriesClick(series.id)}
                      >
                        <img
                          src={series.poster_path ? `https://image.tmdb.org/t/p/w185${series.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                          alt={series.title}
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
      </div>
    </div>
  );
};

export default SeriesDetailModal; 