import { IonContent, IonPage } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import MovieCard from '../components/MovieCard';
import SeriesGroupCard from '../components/SeriesGroupCard';
import BottomNavBar from '../components/BottomNavBar';
import FabAddButton from '../components/FabAddButton';
import FilterModal from '../components/FilterModal';
import fabAdd from '../assets/fab-add.svg';
import React, { useState, useEffect, useMemo } from 'react';
import TabSegment from '../components/TabSegment';
import LocalStorageService, { MovieLog } from '../services/localStorage';
import { useModal } from '../context/ModalContext';

// FilterOptions type'ını tanımla
export type FilterOptions = {
  contentType: 'all' | 'movie' | 'tv';
  sortBy: 'date_desc' | 'rating_desc' | 'alpha_asc';
};

// movies array ve mock MovieCard renderlarını kaldır

const Home: React.FC = () => {
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState<'watched' | 'watchlist'>('watched');
  const [movieLogs, setMovieLogs] = useState<MovieLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtre modalı state'leri
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    contentType: 'all',  // 'all', 'movie', 'tv'
    sortBy: 'date_desc'  // 'date_desc', 'rating_desc', 'alpha_asc'
  });

  // Modal'dan gelen filtreleri ana state'e uygulayacak fonksiyon
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setFilterModalOpen(false); // Filtreleri uyguladıktan sonra modalı kapat
  };

  // Component mount olduğunda localStorage'dan verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        // Movie logs'ları yükle
        const savedLogs = LocalStorageService.getMovieLogs();
        setMovieLogs(savedLogs);

        // Son aktif tab'ı yükle
        const lastActiveTab = LocalStorageService.getLastActiveTab();
        setActiveTab(lastActiveTab);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Tab değiştiğinde localStorage'a kaydet
  const handleTabChange = (tab: 'watched' | 'watchlist') => {
    setActiveTab(tab);
    LocalStorageService.saveLastActiveTab(tab);
  };

  // Yeni film log'u eklendiğinde
  const handleAddMovieLog = (logData: Omit<MovieLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLog = LocalStorageService.saveMovieLog(logData);
      setMovieLogs(prev => [...prev, newLog]);
      // Profil istatistiklerini güncelle
      LocalStorageService.updateProfileStats();
    } catch (error) {
      console.error('Error adding movie log:', error);
    }
  };

  // Filtered ve sorted movie logs - Performance optimizasyonu ile useMemo
  const { filteredMovies, groupedSeries, movies } = useMemo(() => {
    // Önce tab'a göre filtrele
    const tabFiltered = movieLogs.filter((log: MovieLog) => log.type === activeTab);
    
    // Sonra content type'a göre filtrele
    const contentFiltered = tabFiltered.filter(log => {
      if (filters.contentType === 'all') return true;
      const logContentType = log.contentType || log.mediaType;
      return logContentType === filters.contentType;
    });

    // Sıralama uygula
    const sorted = [...contentFiltered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating_desc':
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        case 'alpha_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    // TV Series gruplama mantığı
    const seriesGroups = sorted
      .filter(log => {
        const logContentType = log.contentType || log.mediaType;
        return logContentType === 'tv' && log.seriesId;
      })
      .reduce((groups: { [seriesId: string]: MovieLog[] }, log) => {
        const seriesId = log.seriesId!;
        if (!groups[seriesId]) {
          groups[seriesId] = [];
        }
        groups[seriesId].push(log);
        return groups;
      }, {});

    // Movies (sadece filmler)  
    const moviesList = sorted.filter(log => {
      const logContentType = log.contentType || log.mediaType;
      return logContentType === 'movie';
    });

    return {
      filteredMovies: sorted,
      groupedSeries: seriesGroups,
      movies: moviesList
    };
  }, [movieLogs, activeTab, filters]);

  if (isLoading) {
    return (
      <IonPage className="bg-background">
        <IonContent fullscreen className="bg-background">
          <div className="flex items-center justify-center h-full">
            <div className="text-foreground">Yükleniyor...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  return (
    <IonPage className="bg-background">
      <IonContent fullscreen className="bg-background relative">
        <div className="bg-background min-h-screen flex flex-col items-center">
          <TopHeaderBar />
          {/* Tab Segment + Filter */}
          <div className="flex w-full justify-between items-center pt-6 pb-5 px-4">
            <div className="flex-1 flex justify-center">
              <TabSegment activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
                        <button 
              className="w-7 h-7 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-colors p-0 ml-3" 
              aria-label="Filter"
              onClick={() => setFilterModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" strokeWidth={2} className="w-[18px] h-[18px] stroke-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3.75h13.5m-12.375 0A1.125 1.125 0 0 0 2.25 4.875v1.687c0 .311.126.608.33.826l4.162 4.426c.21.224.33.525.33.826v2.36a1.125 1.125 0 0 0 1.125 1.125h2.25a1.125 1.125 0 0 0 1.125-1.125v-2.36c0-.301.12-.602.33-.826l4.162-4.426A1.125 1.125 0 0 0 15.75 6.562V4.875a1.125 1.125 0 0 0-1.125-1.125H2.25z" />
              </svg>
            </button>
          </div>
          {/* Content Rendering - Hybrid View */}
          <div className="pb-28 w-full px-4">
            <div className="space-y-6">
              {/* TV Series Section */}
              {Object.entries(groupedSeries).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Diziler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupedSeries).map(([seriesId, episodes]) => {
                      const firstEpisode = episodes[0];
                      if (!firstEpisode) return null;
                      
                      return (
                        <SeriesGroupCard
                          key={seriesId}
                          seriesInfo={{
                            id: seriesId,
                            title: firstEpisode.seriesTitle || firstEpisode.title,
                            poster: firstEpisode.seriesPoster || undefined
                          }}
                          episodes={episodes}
                        />
                      );
                    }).filter(Boolean)}
                  </div>
                </div>
              )}

              {/* Movies Section */}
              {movies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Filmler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movies.map((movie: MovieLog) => (
                      <MovieCard 
                        key={movie.id} 
                        title={movie.title}
                        date={movie.date}
                        rating={movie.rating}
                        review={movie.review}
                        poster={movie.poster}
                        onClick={() => openModal('movie', movie.tmdbId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {Object.entries(groupedSeries).length === 0 && movies.length === 0 && (
                <div className="text-center text-muted-foreground mt-12">
                  <p className="text-body">
                    {activeTab === 'watched' 
                      ? 'Henüz izlediğin içerik yok' 
                      : 'İzleme listende içerik yok'
                    }
                  </p>
                  <p className="text-sm mt-2">
                    + butonuna tıklayarak film/dizi ekle
                  </p>
                </div>
              )}
            </div>
          </div>
          <FabAddButton onAddMovieLog={handleAddMovieLog} />
          <BottomNavBar />
        </div>
      </IonContent>
      
      {/* Filtre Modalı */}
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onDidDismiss={() => setFilterModalOpen(false)}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </IonPage>
  );
};

export default Home;