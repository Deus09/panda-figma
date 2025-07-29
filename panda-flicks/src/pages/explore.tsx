import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import ExploreTabSegment from '../components/ExploreTabSegment';
import SearchTabSegment from '../components/SearchTabSegment';
import PersonCard from '../components/PersonCard';
import CategoryChip from '../components/CategoryChip';
import BottomNavBar from '../components/BottomNavBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { getPopularMovies, getPopularSeries, searchAll, getMoviesByGenre, getSeriesByGenre, searchMovies, searchSeries, TMDBMovieResult, TMDBMultiSearchResponse, TMDBSearchResult, TMDBPaginatedResponse } from '../services/tmdb';
import { useModal } from '../context/ModalContext';
import styles from './explore.module.css';

const Explore: React.FC = () => {
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState<'flicks' | 'series'>('flicks');
  const [movies, setMovies] = useState<TMDBMovieResult[]>([]);
  const [series, setSeries] = useState<TMDBMovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Genre filtering states
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<TMDBMovieResult[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [isGenreMode, setIsGenreMode] = useState(false);
  
  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Search states
  const [searchResults, setSearchResults] = useState<TMDBMultiSearchResponse>({
    movies: [],
    series: [],
    persons: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTab, setSearchTab] = useState<'all' | 'movies' | 'series' | 'persons'>('all');

  // Film türleri için ID'ler
  const MOVIE_GENRES: { [key: string]: number } = {
    'Aksiyon': 28,
    'Komedi': 35,
    'Dram': 18,
    'Korku': 27,
    'Romantik': 10749,
    'Bilim Kurgu': 878,
  };

  // Dizi türleri için ID'ler (TMDB'de farklı)
  const SERIES_GENRES: { [key: string]: number } = {
    'Aksiyon': 10759, // Action & Adventure
    'Komedi': 35,
    'Dram': 18,
    'Korku': 9648, // Mystery (daha uygun dizi türü)
    'Romantik': 10749,
    'Bilim Kurgu': 10765, // Sci-Fi & Fantasy
  };

  const categories = [
    { label: 'Aksiyon', prefix: 'genre:Action', genreId: 28 },
    { label: 'Komedi', prefix: 'genre:Comedy', genreId: 35 },
    { label: 'Dram', prefix: 'genre:Drama', genreId: 18 },
    { label: 'Korku', prefix: 'genre:Horror', genreId: 27 },
    { label: 'Romantik', prefix: 'genre:Romance', genreId: 10749 },
    { label: 'Bilim Kurgu', prefix: 'genre:Sci-Fi', genreId: 878 },
  ];

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (activeTab === 'series' && series.length === 0) {
      loadSeries();
    }
  }, [activeTab, series.length]);

  // Sekme değiştiğinde genre araması varsa tekrar yap
  useEffect(() => {
    if (selectedGenre && isGenreMode && search.trim()) {
      // Arama kutusundaki türün adını al
      const genreName = search.trim();
      
      // Pagination'ı sıfırla ve sonuçları temizle
      setCurrentPage(1);
      setTotalPages(0);
      setGenreResults([]);
      
      // Yeni sekmeye göre doğru tür ID'sini bul ve API çağrısı yap
      if (activeTab === 'flicks') {
        const genreId = MOVIE_GENRES[genreName];
        if (genreId) {
          loadMoviesByGenre(genreId, 1);
        }
      } else {
        const genreId = SERIES_GENRES[genreName];
        if (genreId) {
          loadSeriesByGenre(genreId, 1);
        }
      }
    }
  }, [activeTab, selectedGenre, isGenreMode, search]);

  // Search fonksiyonu
  useEffect(() => {
    if (search.trim()) {
      // Eğer arama kutusu dolu ve genre modunda değilsek, normal arama yap
      const genreName = Object.keys(MOVIE_GENRES).find(name => name === search.trim());
      
      if (!genreName) {
        // Normal metin araması - genre filtresini temizle
        if (selectedGenre || isGenreMode) {
          setSelectedGenre(null);
          setGenreResults([]);
          setIsGenreMode(false);
        }
        
        const timeoutId = setTimeout(() => {
          performSearch(search.trim());
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
      }
    } else {
      // Arama kutusu boş - tüm modları temizle
      setIsSearchMode(false);
      setIsGenreMode(false);
      setSearchResults({ movies: [], series: [], persons: [] });
      setSelectedGenre(null);
      setGenreResults([]);
      setSelectedCategory(null);
      setCurrentPage(1);
      setTotalPages(0);
    }
  }, [search, selectedGenre, activeTab]);

  const performSearch = async (query: string) => {
    setSearchLoading(true);
    setIsSearchMode(true);
    try {
      // Tüm kategorilerde arama yap (filmler, diziler ve oyuncular)
      const results = await searchAll(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults({ movies: [], series: [], persons: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  const loadMoviesByGenre = async (genreId: number, page: number = 1) => {
    setGenreLoading(true);
    setError(null);
    try {
      const data = await getMoviesByGenre(genreId, page);
      if (page === 1) {
        setGenreResults(data.results);
      } else {
        setGenreResults(prev => [...prev, ...data.results]);
      }
      setSelectedGenre(genreId);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Failed to load movies by genre');
      console.error('Error loading movies by genre:', err);
    } finally {
      setGenreLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadSeriesByGenre = async (genreId: number, page: number = 1) => {
    setGenreLoading(true);
    setError(null);
    try {
      const data = await getSeriesByGenre(genreId, page);
      if (page === 1) {
        setGenreResults(data.results);
      } else {
        setGenreResults(prev => [...prev, ...data.results]);
      }
      setSelectedGenre(genreId);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Failed to load series by genre');
      console.error('Error loading series by genre:', err);
    } finally {
      setGenreLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleGenreClick = async (genreName: string) => {
    // Tür adını arama kutusuna yaz
    setSearch(genreName);
    setSelectedCategory(`genre:${genreName}`);
    
    // Arama modunu temizle
    setIsSearchMode(false);
    setSearchResults({ movies: [], series: [], persons: [] });
    
    // Genre modunu aktif et ve pagination'ı sıfırla
    setIsGenreMode(true);
    setCurrentPage(1);
    setTotalPages(0);
    setGenreResults([]);
    
    let genreId: number | undefined;
    
    // Aktif sekmeye göre doğru tür ID'sini al
    if (activeTab === 'flicks') {
      genreId = MOVIE_GENRES[genreName];
      if (genreId) {
        await loadMoviesByGenre(genreId, 1);
      } else {
        console.warn(`"${genreName}" türü için film kategorisi bulunamadı.`);
        setGenreResults([]);
      }
    } else { // activeTab === 'series'
      genreId = SERIES_GENRES[genreName];
      if (genreId) {
        await loadSeriesByGenre(genreId, 1);
      } else {
        console.warn(`"${genreName}" türü için dizi kategorisi bulunamadı.`);
        setGenreResults([]);
      }
    }
  };

  // Infinite scroll için veri yükleme fonksiyonu
  const loadMoreData = async (event: any) => {
    if (isLoadingMore || currentPage >= totalPages || !selectedGenre || !isGenreMode) {
      event.target.complete();
      return;
    }

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      // Arama kutusundaki türün adını al
      const genreName = search.trim();
      
      if (activeTab === 'flicks') {
        const genreId = MOVIE_GENRES[genreName];
        if (genreId) {
          await loadMoviesByGenre(genreId, nextPage);
        }
      } else {
        const genreId = SERIES_GENRES[genreName];
        if (genreId) {
          await loadSeriesByGenre(genreId, nextPage);
        }
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      event.target.complete();
    }
  };

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

  const handleMovieClick = (movieId: number) => {
    openModal('movie', movieId);
  };

  const handleSeriesClick = (seriesId: number) => {
    openModal('series', seriesId);
  };

  const handlePersonClick = (personId: number) => {
    openModal('actor', personId);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  const currentData = isGenreMode ? genreResults : (activeTab === 'flicks' ? movies : series);
  const currentLoading = isGenreMode ? genreLoading : loading;

  // Arama sonuçlarını filtrele
  const getFilteredSearchResults = () => {
    switch (searchTab) {
      case 'movies':
        return { movies: searchResults.movies, series: [], persons: [] };
      case 'series':
        return { movies: [], series: searchResults.series, persons: [] };
      case 'persons':
        return { movies: [], series: [], persons: searchResults.persons };
      default:
        return searchResults;
    }
  };

  const filteredResults = getFilteredSearchResults();
  const searchCounts = {
    movies: searchResults.movies.length,
    series: searchResults.series.length,
    persons: searchResults.persons.length,
  };

  return (
    <IonPage className={styles.explorePage}>
      <IonContent className={styles.exploreContent}>
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
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory(null);
                  setSelectedGenre(null);
                  setGenreResults([]);
                  setIsSearchMode(false);
                  setIsGenreMode(false);
                  setSearchResults({ movies: [], series: [], persons: [] });
                  setCurrentPage(1);
                  setTotalPages(0);
                }}
                className="w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[#A3ABB2] hover:bg-[#8B9399] transition-colors"
                aria-label="Temizle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#fff" className="w-[10px] h-[10px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Kategori Etiketleri - Arama odaklandığında göster */}
          {isSearchFocused && (
            <div className="w-full max-w-[332px] mb-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <CategoryChip
                    key={category.prefix}
                    label={category.label}
                    prefix={category.prefix}
                    onClick={() => handleGenreClick(category.label)}
                    isSelected={selectedCategory === category.prefix}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Segmentler */}
          {!isSearchMode ? (
            <div className="w-full max-w-[332px] flex justify-center mb-2">
              <ExploreTabSegment activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          ) : (
            <div className="w-full max-w-[332px] flex justify-center mb-2">
              <SearchTabSegment 
                activeTab={searchTab} 
                onTabChange={setSearchTab} 
                counts={searchCounts}
              />
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="flex flex-col items-center pb-24">
          {!isSearchMode ? (
            // Normal Keşif Modu veya Genre Filtresi
            currentLoading ? (
              <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[332px] mx-auto mt-2">
                {Array.from({ length: 9 }, (_, index) => (
                  <SkeletonLoader key={index} type="poster" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-400 font-poppins">{error}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[332px] mx-auto mt-2">
                  {currentData.map((item) => (
                    <div
                      key={item.id}
                      className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                      onClick={() => activeTab === 'flicks' || isGenreMode ? handleMovieClick(item.id) : handleSeriesClick(item.id)}
                    >
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Infinite Scroll - Sadece genre modunda göster */}
                {isGenreMode && (
                  <IonInfiniteScroll
                    onIonInfinite={loadMoreData}
                    threshold="100px"
                    disabled={currentPage >= totalPages || isLoadingMore}
                  >
                    <IonInfiniteScrollContent
                      loadingSpinner="bubbles"
                      loadingText="Daha fazla yükleniyor..."
                    />
                  </IonInfiniteScroll>
                )}
              </>
            )
          ) : (
            // Arama Sonuçları Modu
            searchLoading ? (
              <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[332px] mx-auto mt-2">
                {Array.from({ length: 9 }, (_, index) => (
                  <SkeletonLoader key={index} type="poster" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[332px] mx-auto mt-2">
                {/* Film Sonuçları */}
                {filteredResults.movies.map((movie) => (
                  <div
                    key={`movie-${movie.id}`}
                    className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Dizi Sonuçları */}
                {filteredResults.series.map((series) => (
                  <div
                    key={`series-${series.id}`}
                    className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                    onClick={() => handleSeriesClick(series.id)}
                  >
                    <img
                      src={series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                      alt={series.name || series.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Oyuncu Sonuçları */}
                {filteredResults.persons.map((person) => (
                  <PersonCard
                    key={`person-${person.id}`}
                    person={person}
                    onClick={handlePersonClick}
                  />
                ))}
                
                {/* Sonuç bulunamadı */}
                {filteredResults.movies.length === 0 && 
                 filteredResults.series.length === 0 && 
                 filteredResults.persons.length === 0 && (
                  <div className="col-span-3 text-center text-gray-400 py-8">
                    <p className="font-poppins">Arama sonucu bulunamadı</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavBar className="rounded-t-[24px]" />
      </IonContent>
    </IonPage>
  );
};

export default Explore; 