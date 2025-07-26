import { IonContent, IonPage } from '@ionic/react';
import BottomNavBar from '../components/BottomNavBar';
import React from 'react';
import TabSegment from '../components/TabSegment';

const posterData = Array.from({ length: 12 });

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'flicks' | 'series'>('flicks');
  return (
    <IonPage className="bg-[#0C1117]">
      <IonContent fullscreen className="bg-[#0C1117] relative px-0">
        {/* Search Bar Title + SearchBar */}
        <div className="w-full flex flex-col items-center pt-4 pb-2">
          <div className="w-full max-w-[332px] flex flex-col items-center">
            <span className="block text-white font-bold text-[22px] leading-[33px] mb-2 font-poppins text-left w-full">Panda Explorer</span>
            <div className="flex flex-row items-center bg-[#EFEEEA] rounded-[12px] px-[15px] py-[4px] gap-[8px] w-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000" className="w-[14px] h-[14px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
              </svg>
              <input className="bg-transparent flex-1 outline-none text-black text-[14px] placeholder:text-[#A3ABB2] font-normal font-poppins" placeholder="Fight Club" />
            </div>
          </div>
        </div>
        {/* Segment */}
        <div className="flex justify-center pt-2 pb-2">
          <TabSegment activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        {/* Poster Grid */}
        <div className="flex flex-col items-center mt-0">
          <div className="grid grid-cols-3 gap-x-[18px] gap-y-[18px] max-w-[302px] mx-auto">
            {posterData.map((_, idx) => (
              <div key={idx} className="w-[90px] h-[135px] rounded-[10px] bg-[#fff] border border-white flex items-center justify-center text-xs text-gray-400">
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