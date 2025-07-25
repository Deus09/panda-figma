import { IonContent, IonPage } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import MovieCard from '../components/MovieCard';
import BottomNavBar from '../components/BottomNavBar';
import FabAddButton from '../components/FabAddButton';
import fabAdd from '../assets/fab-add.svg';
import React, { useState } from 'react';

const movies = [
  {
    title: 'Lilo & Stitch',
    date: 'DD/MM/YYYY',
    rating: '4.5',
    review: 'Lorem ipsum, asdsdfdfsd fsdf fsfssdfd gdfgsfsd fsfsdfsdfs  kljkljlk sdsdflskj fdkdjflf',
    poster: '',
  },
  {
    title: 'Dangerous Animals',
    date: 'DD/MM/YYYY',
    rating: '4.5',
    review: 'Lorem ipsum, asdsdfdfsd fsdf fsfssdfd gdfgsfsd fsfsdfsdfs  kljkljlk sdsdflskj fdkdjflf',
    poster: '',
  },
  {
    title: 'Thunderbolts*',
    date: 'DD/MM/YYYY',
    rating: '4.5',
    review: 'Lorem ipsum, asdsdfdfsd fsdf fsfssdfd gdfgsfsd fsfsdfsdfs  kljkljlk sdsdflskj fdkdjflf',
    poster: '',
  },
  {
    title: 'How to Train Your Dragon',
    date: 'DD/MM/YYYY',
    rating: '4.5',
    review: 'Lorem ipsum, asdsdfdfsd fsdf fsfssdfd gdfgsfsd fsfsdfsdfs  kljkljlk sdsdflskj fdkdjflf',
    poster: '',
  },
  {
    title: 'The Midnight Bloom',
    date: 'DD/MM/YYYY',
    rating: '4.5',
    review: 'Lorem ipsum, asdsdfdfsd fsdf fsfssdfd gdfgsfsd fsfsdfsdfs  kljkljlk sdsdflskj fdkdjflf',
    poster: '',
  },
  {
    title: 'F1',
    date: 'DD/MM/YYYY',
    rating: '4.5',
    review: 'Lorem ipsum, asdsdfdfsd fsdf fsfssdfd gdfgsfsd fsfsdfsdfs  kljkljlk sdsdflskj fdkdjflf',
    poster: '',
  },
];

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watched' | 'watchlist'>('watched');
  return (
    <IonPage className="bg-[#121212]">
      <IonContent fullscreen className="bg-[#121212] relative">
        <div className="bg-[#121212] min-h-screen">
          <TopHeaderBar />
          {/* Tab Segment + Filter */}
          <div className="flex w-full justify-center pt-2 pb-4">
            <div className="flex flex-row items-center gap-3">
              <div className="flex w-[193px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
                <button
                  className={`w-[100px] h-full flex items-center justify-center font-semibold text-[16px] leading-[24px] border-r border-white rounded-l-[10px] transition-all duration-300 ${activeTab === 'watched' ? 'bg-[#222] text-[#FE7743]' : 'bg-[#222] text-white'}`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  onClick={() => setActiveTab('watched')}
                >
                  Watched
                </button>
                <button
                  className={`w-[100px] h-full flex items-center justify-center font-semibold text-[16px] leading-[24px] rounded-r-[10px] transition-all duration-300 ${activeTab === 'watchlist' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
                  style={{ fontFamily: 'Poppins, sans-serif', borderLeft: 'none' }}
                  onClick={() => setActiveTab('watchlist')}
                >
                  Watch List
                </button>
              </div>
              <button className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center transition-colors p-0 shadow-none border-none" aria-label="Filter">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FE7743" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18m-16.5 0a1.5 1.5 0 0 0-1.5 1.5v2.25c0 .414.168.81.44 1.1l5.56 5.9c.28.297.44.697.44 1.1V19.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3.15c0-.403.16-.803.44-1.1l5.56-5.9A1.5 1.5 0 0 0 21 8.25V6a1.5 1.5 0 0 0-1.5-1.5H3z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-1.5 pb-24">
            {movies.map((movie, idx) => (
              <MovieCard key={idx} {...movie} />
            ))}
          </div>
          <FabAddButton />
          <BottomNavBar />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home; 