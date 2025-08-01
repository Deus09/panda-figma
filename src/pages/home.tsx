import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import TopHeaderBar from '../components/TopHeaderBar';
import MovieCard from '../components/MovieCard';
import SeriesGroupCard from '../components/SeriesGroupCard';
import BottomNavBar from '../components/BottomNavBar';
import FabAddButton from '../components/FabAddButton';
import FilterModal from '../components/FilterModal';
import DetailViewModal from '../components/DetailViewModal';  // 🎯 YENİ IMPORT
import fabAdd from '../assets/fab-add.svg';
import React, { useState, useEffect, useMemo } from 'react';
import TabSegment from '../components/TabSegment';
import LocalStorageService, { MovieLog } from '../services/localStorage';
import { useModal } from '../context/ModalContext';
import { useHistory } from 'react-router-dom';

// FilterOptions type'ını tanımla
export type FilterOptions = {
  contentType: 'all' | 'movie' | 'tv';
  sortBy: 'date_desc' | 'rating_desc' | 'alpha_asc';
};

// movies array ve mock MovieCard renderlarını kaldır

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'watched' | 'watchlist'>('watched');
  const [movieLogs, setMovieLogs] = useState<MovieLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🎯 YENİ: DetailViewModal state'leri
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    itemId: string;
    itemType: 'movie' | 'tv';
  } | null>(null);
  
  // Filtre modalı state'leri
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    contentType: 'all',  // 'all', 'movie', 'tv'
    sortBy: 'date_desc'  // 'date_desc', 'rating_desc', 'alpha_asc'
  });

  // 🎯 YENİ: Poster Kütüphanesi için Veri İşleme
  const posterLibraryData = useMemo(() => {
    // Aktif tab'a göre filtreleme
    const filteredLogs = movieLogs.filter(log => log.type === activeTab);
    
    // 📊 VERI GRUPLAMA - Diziler
    const seriesGroups = filteredLogs
      .filter(log => log.contentType === 'tv')
      .reduce((acc, log) => {
        const seriesId = log.seriesId || log.tmdbId?.toString() || 'unknown';
        if (!acc[seriesId]) {
          acc[seriesId] = {
            type: 'series' as const,
            id: seriesId,
            title: log.seriesTitle || log.title,
            poster: log.seriesPoster || log.poster,
            episodes: []
          };
        }
        acc[seriesId].episodes.push(log);
        return acc;
      }, {} as Record<string, {
        type: 'series';
        id: string;
        title: string;
        poster: string;
        episodes: MovieLog[];
      }>);
    
    // 🎬 VERI GRUPLAMA - Filmler
    const movies = filteredLogs
      .filter(log => log.contentType === 'movie')
      .map(log => ({
        type: 'movie' as const,
        id: log.id,
        title: log.title,
        poster: log.poster,
        movieData: log
      }));
    
    // 🎯 BİRLEŞİK POSTER KÜTÜPHANESİ
    const combinedLibrary = [
      ...Object.values(seriesGroups),
      ...movies
    ];
    
    // Filtre uygulama
    let filtered = combinedLibrary;
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(item => 
        filters.contentType === 'movie' ? item.type === 'movie' : item.type === 'series'
      );
    }
    
    // Sıralama
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'alpha_asc':
          return a.title.localeCompare(b.title);
        case 'rating_desc':
          // TODO: Rating sıralaması eklenebilir
          return 0;
        case 'date_desc':
        default:
          return 0; // Şimdilik tarih sıralaması yok
      }
    });
    
    return filtered;
  }, [movieLogs, activeTab, filters]);

  // 🎯 YENİ: Poster Tıklama Handler'ı
  const handlePosterClick = (item: typeof posterLibraryData[0]) => {
    if (item.type === 'movie') {
      setSelectedItem({
        itemId: item.id,
        itemType: 'movie'
      });
    } else {
      setSelectedItem({
        itemId: item.id,
        itemType: 'tv'
      });
    }
    setIsDetailModalOpen(true);
  };

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
          <div className="relative w-full pt-6 pb-5 px-4">
            {/* TabSegment centered absolutely */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <TabSegment activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            {/* Filter button positioned on the right */}
            <div className="flex justify-end">
              <button 
                className="w-7 h-7 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-colors p-0" 
                aria-label="Filter"
                onClick={() => setFilterModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" strokeWidth={2} className="w-[18px] h-[18px] stroke-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3.75h13.5m-12.375 0A1.125 1.125 0 0 0 2.25 4.875v1.687c0 .311.126.608.33.826l4.162 4.426c.21.224.33.525.33.826v2.36a1.125 1.125 0 0 0 1.125 1.125h2.25a1.125 1.125 0 0 0 1.125-1.125v-2.36c0-.301.12-.602.33-.826l4.162-4.426A1.125 1.125 0 0 0 15.75 6.562V4.875a1.125 1.125 0 0 0-1.125-1.125H2.25z" />
                </svg>
              </button>
            </div>
          </div>
          {/* 🎯 YENİ POSTER KÜTÜPHANESİ LAYOUT */}
          <div className="pb-28 w-full px-4">
            {posterLibraryData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {activeTab === 'watched' ? t('empty_states.no_watched_content') : t('empty_states.empty_watchlist')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {posterLibraryData.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}-${index}`}
                    className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => handlePosterClick(item)}
                  >
                    {/* Poster Image */}
                    <img
                      src={item.poster || '/placeholder-poster.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-poster.jpg';
                      }}
                    />
                    
                    {/* Overlay for series episode count */}
                    {item.type === 'series' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-xs font-medium">
                          {item.episodes.length} bölüm
                        </p>
                      </div>
                    )}
                    
                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 w-full">
                        <h3 className="text-white text-sm font-medium line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      
      {/* 🎯 YENİ: DetailViewModal */}
      <DetailViewModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        itemId={selectedItem?.itemId || null}
        itemType={selectedItem?.itemType || null}
      />
    </IonPage>
  );
};

export default Home;