import { IonContent, IonPage } from '@ionic/react';
import BottomNavBar from '../components/BottomNavBar';
import React, { useState } from 'react';

const flicks = [
  { title: 'New Released', qty: 20, img: '', color: 'bg-[#C4C4C4]' },
  { title: 'Marvel Adventure', qty: 10, img: '', color: 'bg-[#A3ABB2]' },
  { title: 'New Released', qty: 20, img: '', color: 'bg-[#C4C4C4]' },
];
const series = [
  { title: 'Series One', qty: 8, img: '', color: 'bg-[#A3ABB2]' },
  { title: 'Series Two', qty: 12, img: '', color: 'bg-[#C4C4C4]' },
  { title: 'Series Three', qty: 5, img: '', color: 'bg-[#A3ABB2]' },
];

const Lists: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flicks' | 'series'>('flicks');
  const lists = activeTab === 'flicks' ? flicks : series;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col items-center mt-0 bg-[#121212] min-h-screen">
          {/* Header */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <span className="block text-white font-bold text-[22px] leading-[33px] mb-1">Panda Lists</span>
            <span className="block text-[#EFEEEA] text-[12px] mb-2">Discover Panda’s Special Lists For You</span>
          </div>
          {/* Segment */}
          <div className="flex justify-center pt-2 pb-4">
            <div className="flex w-[200px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
              <button
                className={`flex-1 h-full flex items-center justify-center font-semibold text-[16px] leading-[24px] transition-all duration-500 border-r border-white rounded-l-[10px] ${activeTab === 'flicks' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
                onClick={() => setActiveTab('flicks')}
              >
                Flicks
              </button>
              <button
                className={`flex-1 h-full flex items-center justify-center font-semibold text-[16px] leading-[24px] transition-all duration-500 rounded-r-[10px] ${activeTab === 'series' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
                style={{ fontFamily: 'Poppins, sans-serif', borderLeft: 'none' }}
                onClick={() => setActiveTab('series')}
              >
                Series
              </button>
            </div>
          </div>
          {/* List Cards Grid */}
          <div className="flex flex-col items-center mt-0 w-full">
            <div className="flex flex-col gap-y-[22px] max-w-[306px] mx-auto w-full relative min-h-[350px]">
              <div
                key={activeTab}
                className="absolute inset-0 transition-all duration-700 ease-in-out"
                style={{
                  opacity: 1,
                  zIndex: 1,
                  pointerEvents: 'auto',
                  transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {lists.map((item, idx) => (
                  <div key={idx} className="w-[302px] h-[113px] rounded-[12px] shadow-[0_10px_4px_0_rgba(0,0,0,0.15)] overflow-hidden flex flex-col mb-[22px] last:mb-0">
                    <div className={`w-full h-[100px] ${item.color} border-t border-l border-r border-white rounded-t-[12px]`}></div>
                    <div className="flex flex-row items-center gap-2 bg-[#222] border-b border-l border-r border-white rounded-b-[12px] px-4 py-2 -mt-2">
                      <span className="text-white text-[12px] font-normal flex-1">{item.title}</span>
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#222] text-[12px] font-normal">{item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <BottomNavBar className="rounded-t-[24px]" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Lists; 