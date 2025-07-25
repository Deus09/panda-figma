import { IonContent, IonPage } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import MovieCard from '../components/MovieCard';
import BottomNavBar from '../components/BottomNavBar';
import FabAddButton from '../components/FabAddButton';
import fabAdd from '../assets/fab-add.svg';
import React, { useState } from 'react';
import TabSegment from '../components/TabSegment';

// movies array ve mock MovieCard renderlarını kaldır

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watched' | 'watchlist'>('watched');
  const [movieLogs, setMovieLogs] = useState<Array<{
    title: string;
    date: string;
    rating: string;
    review: string;
    poster: string;
    type: 'watched' | 'watchlist';
  }>>([]);
  return (
    <IonPage className="bg-[#121212]">
      <IonContent fullscreen className="bg-[#121212] relative">
        <div className="bg-[#121212] min-h-screen flex flex-col items-center">
          <TopHeaderBar />
          {/* Tab Segment + Filter */}
          <div className="flex w-full justify-center pt-[24px] pb-[20px]">
            <div className="flex flex-row items-center gap-[12px]">
              <TabSegment activeTab={activeTab} onTabChange={setActiveTab} />
              <button className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center transition-colors p-0 shadow-none border-none" aria-label="Filter">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" strokeWidth={2} stroke="#FE7743" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3.75h13.5m-12.375 0A1.125 1.125 0 0 0 2.25 4.875v1.687c0 .311.126.608.33.826l4.162 4.426c.21.224.33.525.33.826v2.36a1.125 1.125 0 0 0 1.125 1.125h2.25a1.125 1.125 0 0 0 1.125-1.125v-2.36c0-.301.12-.602.33-.826l4.162-4.426A1.125 1.125 0 0 0 15.75 6.562V4.875a1.125 1.125 0 0 0-1.125-1.125H2.25z" />
                </svg>
              </button>
            </div>
          </div>
          {/* Movie List */}
          <div className="flex flex-col gap-[12px] items-center pb-[110px] w-full">
            {movieLogs.filter(log => log.type === activeTab).map((movie, idx) => (
              <MovieCard key={idx} {...movie} />
            ))}
          </div>
          <FabAddButton onAddMovieLog={log => setMovieLogs(prev => [...prev, log])} />
          <BottomNavBar />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home; 