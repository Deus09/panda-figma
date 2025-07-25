import { IonContent, IonPage } from '@ionic/react';
import BottomNavBar from '../components/BottomNavBar';
import React from 'react';

const posterData = Array.from({ length: 12 });

const Explore: React.FC = () => {
  return (
    <IonPage className="bg-[#121212]">
      <IonContent fullscreen className="bg-[#121212] relative px-2">
        {/* Search Bar Title + SearchBar */}
        <div className="w-full flex flex-col items-center pt-4 pb-2">
          <div className="w-full max-w-[302px] flex flex-col items-center">
            <span className="block text-white font-bold text-[22px] leading-[33px] mb-2">Panda Explorer</span>
            <div className="flex flex-row items-center bg-[#F3F2EF] rounded-[20px] px-4 py-2 gap-2 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
              </svg>
              <input className="bg-transparent flex-1 outline-none text-black text-[16px] placeholder:text-[#A3ABB2] font-medium" placeholder="Fight Club" />
            </div>
          </div>
        </div>
        {/* Segment */}
        <div className="flex justify-center pt-2 pb-2">
          <div className="flex bg-[#222] rounded-[10px] overflow-hidden border border-white">
            <button className="px-6 h-[40px] text-white font-bold text-[16px] bg-[#222] rounded-l-[10px] border-r border-white">Flicks</button>
            <button className="px-6 h-[40px] text-[#FE7743] font-bold text-[16px] bg-[#222] rounded-r-[10px]">Series</button>
          </div>
        </div>
        {/* Poster Grid */}
        <div className="flex flex-col items-center mt-0">
          <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[302px] mx-auto">
            {posterData.map((_, idx) => (
              <div key={idx} className="w-[90px] h-[135px] rounded-[10px] bg-[#fff] border border-[#E5E5E5] flex items-center justify-center text-xs text-gray-400">
                Poster
              </div>
            ))}
          </div>
        </div>
        <BottomNavBar className="rounded-t-[24px]" />
      </IonContent>
    </IonPage>
  );
};

export default Explore; 