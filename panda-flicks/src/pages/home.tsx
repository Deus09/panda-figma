import { IonContent, IonPage } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import MovieCard from '../components/MovieCard';
import BottomNavBar from '../components/BottomNavBar';
import FabAddButton from '../components/FabAddButton';
import fabAdd from '../assets/fab-add.svg';
import React, { useState, useEffect } from 'react';
import TabSegment from '../components/TabSegment';
import LocalStorageService, { MovieLog } from '../services/localStorage';

// movies array ve mock MovieCard renderlarını kaldır

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watched' | 'watchlist'>('watched');
  const [movieLogs, setMovieLogs] = useState<MovieLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Error adding movie log:', error);
    }
  };

  // Film log'unu güncelle
  const handleUpdateMovieLog = (id: string, updates: Partial<Omit<MovieLog, 'id' | 'createdAt'>>) => {
    try {
      const updatedLog = LocalStorageService.updateMovieLog(id, updates);
      if (updatedLog) {
        setMovieLogs(prev => prev.map(log => log.id === id ? updatedLog : log));
      }
    } catch (error) {
      console.error('Error updating movie log:', error);
    }
  };

  // Film log'unu sil
  const handleDeleteMovieLog = (id: string) => {
    try {
      const success = LocalStorageService.deleteMovieLog(id);
      if (success) {
        setMovieLogs(prev => prev.filter(log => log.id !== id));
      }
    } catch (error) {
      console.error('Error deleting movie log:', error);
    }
  };

  // Filtered movie logs
  const filteredMovies = movieLogs.filter((log: MovieLog) => log.type === activeTab);

  if (isLoading) {
    return (
      <IonPage className="bg-[#121212]">
        <IonContent fullscreen className="bg-[#121212]">
          <div className="flex items-center justify-center h-full">
            <div className="text-white">Yükleniyor...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  return (
    <IonPage className="bg-[#121212]">
      <IonContent fullscreen className="bg-[#121212] relative">
        <div className="bg-[#121212] min-h-screen flex flex-col items-center">
          <TopHeaderBar />
          {/* Tab Segment + Filter */}
          <div className="flex w-full justify-between items-center pt-[24px] pb-[20px] px-[16px]">
            <div className="flex-1 flex justify-center">
              <TabSegment activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            <button className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center transition-colors p-0 shadow-none border-none ml-[12px]" aria-label="Filter">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" strokeWidth={2} stroke="#FE7743" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3.75h13.5m-12.375 0A1.125 1.125 0 0 0 2.25 4.875v1.687c0 .311.126.608.33.826l4.162 4.426c.21.224.33.525.33.826v2.36a1.125 1.125 0 0 0 1.125 1.125h2.25a1.125 1.125 0 0 0 1.125-1.125v-2.36c0-.301.12-.602.33-.826l4.162-4.426A1.125 1.125 0 0 0 15.75 6.562V4.875a1.125 1.125 0 0 0-1.125-1.125H2.25z" />
              </svg>
            </button>
          </div>
          {/* Movie List */}
          <div className="flex flex-col gap-[12px] items-center pb-[110px] w-full">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie: MovieLog) => (
                <MovieCard 
                  key={movie.id} 
                  title={movie.title}
                  date={movie.date}
                  rating={movie.rating}
                  review={movie.review}
                  poster={movie.poster}
                  onUpdate={(updates) => handleUpdateMovieLog(movie.id, updates)}
                  onDelete={() => handleDeleteMovieLog(movie.id)}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-12">
                <p className="text-lg font-poppins">
                  {activeTab === 'watched' 
                    ? 'Henüz izlediğin film yok' 
                    : 'İzleme listende film yok'
                  }
                </p>
                <p className="text-sm mt-2 font-poppins">
                  + butonuna tıklayarak film ekle
                </p>
              </div>
            )}
          </div>
          <FabAddButton onAddMovieLog={handleAddMovieLog} />
          <BottomNavBar />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home; 