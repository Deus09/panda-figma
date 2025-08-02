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
      {/* Header */}
      <TopHeaderBar title={t('navigation.social')} />
      
      {/* Main Content */}
      <IonContent className="bg-background">
        <div className="flex flex-col h-full">
          {/* Tab Segment */}
          <div className="flex justify-center pt-6 pb-4">
            <SocialTabSegment activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 px-4 pb-24">
            {activeTab === 'news' ? (
              <div className="text-center py-12">
                <h3 className="text-h3 font-semibold text-foreground mb-2">{t('tabs.news')}</h3>
                <p className="text-muted-foreground">{t('empty_states.coming_soon')}</p>
              </div>
            ) : (
              <ReviewsTabSegment />
            )}
          </div>
        </div>
      </IonContent>
      
      {/* Bottom Navigation */}
      <BottomNavBar />
    </IonPage>
  );
};

export default Social; 