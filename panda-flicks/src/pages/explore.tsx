import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import TabSegment from '../components/TabSegment';
import MovieDetailModal from '../components/MovieDetailModal';
import SeriesDetailModal from '../components/SeriesDetailModal';
import { getPopularMovies, getPopularSeries, TMDBMovieResult } from '../services/tmdb';

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flicks' | 'series'>('flicks');
  const [movies, setMovies] = useState<TMDBMovieResult[]>([]);
  const [series, setSeries] = useState<TMDBMovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Movie modal states
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);

  // Series modal states
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [showSeriesDetail, setShowSeriesDetail] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (activeTab === 'series' && series.length === 0) {
      loadSeries();
    }
  }, [activeTab, series.length]);

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopularMovies();
      setMovies(data);
    } catch (err) {
      setError('Failed to load movies');
      console.error('Error loading movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSeries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopularSeries();
      setSeries(data);
    } catch (err) {
      setError('Failed to load series');
      console.error('Error loading series:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentData = activeTab === 'flicks' ? movies : series;

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setShowMovieDetail(true);
  };

  const handleSeriesClick = (seriesId: number) => {
    setSelectedSeriesId(seriesId);
    setShowSeriesDetail(true);
  };

  const handleCloseMovieModal = () => {
    setShowMovieDetail(false);
    setSelectedMovieId(null);
  };

  const handleCloseSeriesModal = () => {
    setShowSeriesDetail(false);
    setSelectedSeriesId(null);
  };

  return (
    <IonPage className="bg-[#0C1117]">
      <IonContent className="bg-[#0C1117]">
        <div className="flex flex-col items-center w-full pt-6 pb-2 px-0">
          {/* Başlık */}
          <span className="block text-white font-bold text-[22px] leading-[33px] mb-2 font-poppins w-full max-w-[332px] text-left">Panda Explorer</span>
          {/* Searchbar */}
          <div className="w-full max-w-[332px] flex flex-row items-center bg-[#EFEEEA] rounded-[12px] px-[15px] py-[4px] gap-[8px] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000" className="w-[14px] h-[14px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
            </svg>
            <input
              className="bg-transparent flex-1 outline-none text-black text-[14px] placeholder:text-[#A3ABB2] font-normal font-poppins"
              placeholder="Fight Club"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Segment */}
          <div className="w-full max-w-[332px] flex justify-center mb-2">
            <TabSegment activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
        {/* Poster Grid */}
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white font-poppins">Loading...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-400 font-poppins">{error}</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[332px] mx-auto mt-2">
              {currentData.map((item) => (
                <div
                  key={item.id}
                  className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                  onClick={() => activeTab === 'flicks' ? handleMovieClick(item.id) : handleSeriesClick(item.id)}
                >
                  <img
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Movie Detail Modal */}
        <MovieDetailModal
          open={showMovieDetail}
          onClose={handleCloseMovieModal}
          movieId={selectedMovieId}
        />

        {/* Series Detail Modal */}
        <SeriesDetailModal
          open={showSeriesDetail}
          onClose={handleCloseSeriesModal}
          seriesId={selectedSeriesId}
        />
      </IonContent>
    </IonPage>
  );
};

export default Explore; 