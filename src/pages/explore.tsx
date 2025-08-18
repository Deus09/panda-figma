import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonContent, IonPage } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import ExploreTabSegment from '../components/ExploreTabSegment';
import SearchTabSegment from '../components/SearchTabSegment';
import PersonCard from '../components/PersonCard';
import CategoryChip from '../components/CategoryChip';
import BottomNavBar from '../components/BottomNavBar';
import SkeletonLoader from '../components/SkeletonLoader';
import AiDiscoveryModal from '../components/AiDiscoveryModal';
import ProBadge from '../components/ProBadge';
import { useNetworkErrorHandler } from '../components/NetworkErrorHandler';
import { getPopularMovies, getPopularSeries, searchAll, getMoviesByGenre, getSeriesByGenre, TMDBMovieResult, TMDBMultiSearchResponse } from '../services/tmdb';
import { useModal } from '../context/ModalContext';
import { usePaywall } from '../context/PaywallContext';
import { LocalStorageService } from '../services/localStorage';
import styles from './explore.module.css';

const Explore: React.FC = () => {
  const { openModal } = useModal();
  const { openPaywall } = usePaywall();
  const { t } = useTranslation();
  const { handleNetworkError, NetworkErrorComponent } = useNetworkErrorHandler();
  const [activeTab, setActiveTab] = useState<'filmler' | 'series'>('filmler');
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
  
  // Scroll pozisyonu koruma için ref
  const contentRef = React.useRef<HTMLIonContentElement>(null);
  
  // Infinite scroll için intersection observer
  const loadingRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef<boolean>(false);
  
  // Search states
  const [searchResults, setSearchResults] = useState<TMDBMultiSearchResponse>({
    movies: [],
    series: [],
    persons: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTab, setSearchTab] = useState<'all' | 'movies' | 'series' | 'persons'>('all');

  // AI Discovery states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Film türleri için ID'ler
  const MOVIE_GENRES: { [key: string]: number } = {
    [t('genres.action')]: 28,
    [t('genres.comedy')]: 35,
    [t('genres.drama')]: 18,
    [t('genres.horror')]: 27,
    [t('genres.romantic')]: 10749,
    [t('genres.sci_fi')]: 878,
    [t('genres.thriller')]: 53,
    [t('genres.adventure')]: 12,
  };

  // Dizi türleri için ID'ler (TMDB'de farklı)
  const SERIES_GENRES: { [key: string]: number } = {
    [t('genres.action')]: 10759, // Action & Adventure
    [t('genres.comedy')]: 35,
    [t('genres.drama')]: 18,
    [t('genres.horror')]: 9648, // Mystery (daha uygun dizi türü)
    [t('genres.romantic')]: 10749,
    [t('genres.sci_fi')]: 10765, // Sci-Fi & Fantasy
    [t('genres.thriller')]: 53, // Thriller
    [t('genres.adventure')]: 10759, // Action & Adventure (macera da bu kategoride)
  };

  const categories = [
    { label: t('genres.action'), prefix: 'genre:Action', genreId: 28 },
    { label: t('genres.comedy'), prefix: 'genre:Comedy', genreId: 35 },
    { label: t('genres.drama'), prefix: 'genre:Drama', genreId: 18 },
    { label: t('genres.horror'), prefix: 'genre:Horror', genreId: 27 },
    { label: t('genres.romantic'), prefix: 'genre:Romance', genreId: 10749 },
    { label: t('genres.sci_fi'), prefix: 'genre:Sci-Fi', genreId: 878 },
    { label: t('genres.thriller'), prefix: 'genre:Thriller', genreId: 53 },
    { label: t('genres.adventure'), prefix: 'genre:Adventure', genreId: 12 },
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
      if (activeTab === 'filmler') {
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
    if (page === 1) {
      setGenreLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const data = await getMoviesByGenre(genreId, page);
      if (page === 1) {
        setGenreResults(data.results);
      } else {
        // Yeni verileri eklerken React batch update kullan
        setGenreResults(prev => {
          const newResults = [...prev, ...data.results];
          return newResults;
        });
      }
      setSelectedGenre(genreId);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Failed to load movies by genre');
      console.error('Error loading movies by genre:', err);
    } finally {
      if (page === 1) {
        setGenreLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const loadSeriesByGenre = async (genreId: number, page: number = 1) => {
    if (page === 1) {
      setGenreLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const data = await getSeriesByGenre(genreId, page);
      if (page === 1) {
        setGenreResults(data.results);
      } else {
        // Yeni verileri eklerken React batch update kullan
        setGenreResults(prev => {
          const newResults = [...prev, ...data.results];
          return newResults;
        });
      }
      setSelectedGenre(genreId);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Failed to load series by genre');
      console.error('Error loading series by genre:', err);
    } finally {
      if (page === 1) {
        setGenreLoading(false);
      } else {
        setIsLoadingMore(false);
      }
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
    if (activeTab === 'filmler') {
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
  const loadMoreData = useCallback(async () => {
    if (isLoadingRef.current || currentPage >= totalPages || !selectedGenre || !isGenreMode) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      // Arama kutusundaki türün adını al
      const genreName = search.trim();
      
      if (activeTab === 'filmler') {
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
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [currentPage, totalPages, selectedGenre, isGenreMode, search, activeTab, MOVIE_GENRES, SERIES_GENRES]);

  // Intersection Observer için infinite scroll
  useEffect(() => {
    if (!isGenreMode || !loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingRef.current && currentPage < totalPages) {
          loadMoreData();
        }
      },
      {
        root: null,
        rootMargin: '200px', // 200px önce yükleme başlasın
        threshold: 0.1
      }
    );

    observer.observe(loadingRef.current);

    return () => observer.disconnect();
  }, [isGenreMode, currentPage, totalPages, loadMoreData]);

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopularMovies();
      setMovies(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load movies';
      setError(errorMessage);
      handleNetworkError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load series';
      setError(errorMessage);
      handleNetworkError(errorMessage);
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

  const currentData = isGenreMode ? genreResults : (activeTab === 'filmler' ? movies : series);
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
      <IonContent ref={contentRef} className={styles.exploreContent} scrollEvents={true}>
        <TopHeaderBar title={`Moviloi ${t('navigation.explore')}`} />
        <div className="flex flex-col items-center w-full pt-6 pb-2 px-0">
          {/* Searchbar */}
          <div className="w-full max-w-[332px] flex flex-row items-center bg-[#EFEEEA] rounded-[12px] px-[15px] py-[4px] gap-[8px] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000" className="w-[14px] h-[14px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
            </svg>
            <input
              className="bg-transparent flex-1 outline-none text-black text-[14px] placeholder:text-[#A3ABB2] font-normal font-poppins"
              placeholder="Fight Club | Brad Pitt | David Fincher"
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
                aria-label={t('common.close')}
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
            currentLoading && currentData.length === 0 ? (
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
                {/* Normal Grid Yapısı - Geçici olarak Swiper yerine */}
                <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[332px] mx-auto mt-2" style={{ 
                  willChange: 'contents', 
                  contain: 'layout style paint',
                  minHeight: 'fit-content' 
                }}>
                  {currentData.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                      onClick={() => activeTab === 'filmler' || isGenreMode ? handleMovieClick(item.id) : handleSeriesClick(item.id)}
                      style={{ contain: 'layout style paint' }}
                    >
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                        alt={item.title || 'Movie'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/90x135?text=No+Image';
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Infinite Scroll Loading Indicator - Sadece genre modunda göster */}
                {isGenreMode && currentPage < totalPages && (
                  <div 
                    ref={loadingRef}
                    className="flex justify-center py-6"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        <span className="text-gray-400 font-poppins">Yükleniyor...</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 font-poppins text-sm">
                        Scroll yaparak daha fazla içerik yükleyin
                      </div>
                    )}
                  </div>
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
              <div className="max-w-[332px] mx-auto mt-2">
                <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px]">
                  {/* Film Sonuçları */}
                  {filteredResults.movies.map((movie) => (
                    <div
                      key={`movie-${movie.id}`}
                      className="w-[90px] h-[135px] rounded-[10px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                        alt={movie.title || 'Movie'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/90x135?text=No+Image';
                        }}
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
                        src={series.poster_path ? `https://image.tmdb.org/t/p/w342${series.poster_path}` : 'https://placehold.co/90x135?text=No+Image'}
                        alt={series.name || series.title || 'Series'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/90x135?text=No+Image';
                        }}
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
                </div>
                
                {/* Sonuç bulunamadı */}
                {filteredResults.movies.length === 0 && 
                 filteredResults.series.length === 0 && 
                 filteredResults.persons.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p className="font-poppins">{t('search.no_results')}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavBar className="rounded-t-[24px]" />
      </IonContent>

      {/* AI Discovery FAB Button */}
      <div className="fixed bottom-[110px] right-[20px] z-[1000]">
        <button
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-110 relative"
          onClick={() => {
            // 1. Kullanıcı giriş yapmış mı kontrol et
            const isLoggedIn = LocalStorageService.isUserLoggedIn();
            
            if (!isLoggedIn) {
              // Giriş yapmamış -> Paywall göster
              openPaywall('ai-recommendations');
              return;
            }
            
            // 2. Kullanıcı Pro üye mi kontrol et
            const isPro = LocalStorageService.isUserPro();
            
            if (!isPro) {
              // Free üye -> Paywall göster
              openPaywall('ai-recommendations');
            } else {
              // Pro üye -> AI özelliğini aç
              setIsAiModalOpen(true);
            }
          }}
          aria-label={t('ai.ai_discovery')}
        >
          <span className="text-xs">AI</span>
          <ProBadge size="small" className="absolute -top-1 -right-1" />
        </button>
      </div>

      {/* AI Discovery Modal */}
      <AiDiscoveryModal
        open={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
        
      {/* Network Error Handler */}
      <NetworkErrorComponent />
    </IonPage>
  );
};

export default Explore; 