import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import TopHeaderBar from '../components/TopHeaderBar';
import BottomNavBar from '../components/BottomNavBar';
import SocialTabSegment from '../components/SocialTabSegment';
import ReviewsTabSegment from '../components/ReviewsTabSegment';

type SocialTabType = 'news' | 'reviews';

const Social: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SocialTabType>('news');

  const handleTabChange = (tab: SocialTabType) => {
    setActiveTab(tab);
  };

  return (
    <IonPage className="bg-background">
      <IonContent fullscreen className="bg-background relative" scrollEvents={true}>
        <div className="bg-background min-h-screen flex flex-col items-center">
          <TopHeaderBar title={t('navigation.social')} />
          
          {/* Tab Segment */}
          <div className="flex justify-center pt-6 pb-4 w-full">
            <SocialTabSegment activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 px-4 pb-24 w-full">
            {activeTab === 'news' ? (
              <div className="text-center py-12">
                <h3 className="text-h3 font-semibold text-foreground mb-2">{t('tabs.news')}</h3>
                <p className="text-muted-foreground">{t('empty_states.coming_soon')}</p>
              </div>
            ) : (
              <ReviewsTabSegment />
            )}
          </div>
          <BottomNavBar />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Social; 