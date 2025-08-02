import React, { useState, useEffect } from 'react';
import { 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { close, star, calendar, chatbubbles, play } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { LocalStorageService, MovieLog } from '../services/localStorage';
import { getSeriesDetails, getSeasonDetails, TMDBSeriesDetails, SeasonDetails, getMovieCast, TMDBCastMember } from '../services/tmdb';
import SeasonAccordion from './SeasonAccordion';
import CastChatModal from './CastChatModal';
import CastSelectionModal from './CastSelectionModal';
import AnimatedChatIcon from './AnimatedChatIcon';

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType: 'movie' | 'tv' | null;
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({ 
  isOpen, 
  onClose, 
  itemId, 
  itemType 
}) => {
  const { t } = useTranslation();
  
  // State for different content types
  const [logDetails, setLogDetails] = useState<MovieLog | null>(null);
  const [seriesApiData, setSeriesApiData] = useState<TMDBSeriesDetails & { seasons: SeasonDetails[] } | null>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<MovieLog[]>([]);
  const [seriesStats, setSeriesStats] = useState<{
    totalEpisodes: number;
    watchedCount: number;
    progressPercentage: number;
    avgRating: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cast Chat Modal States
  const [castChatOpen, setCastChatOpen] = useState(false);
  const [castSelectionOpen, setCastSelectionOpen] = useState(false);
  const [selectedCastMember, setSelectedCastMember] = useState<TMDBCastMember | null>(null);
  const [movieCast, setMovieCast] = useState<TMDBCastMember[]>([]);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !itemId || !itemType) return;
      
      setIsLoading(true);
      try {
        if (itemType === 'movie') {
          // 🎬 MOVIE DATA FETCHING
          const allLogs = LocalStorageService.getMovieLogs();
          const movieLog = allLogs.find(log => log.id === itemId);
          setLogDetails(movieLog || null);
          
          // Get movie cast for chat functionality
          try {
            // Use tmdbId from the movie log instead of itemId
            if (movieLog && movieLog.tmdbId) {
              const cast = await getMovieCast(movieLog.tmdbId);
              setMovieCast(cast);
            } else {
              console.warn('No TMDB ID found for movie:', movieLog?.title);
              setMovieCast([]);
            }
          } catch (error) {
            console.error('Error fetching movie cast:', error);
            setMovieCast([]);
          }
          
        } else if (itemType === 'tv') {
          // 📺 TV SERIES DATA FETCHING - Step 1: Get watched episodes from localStorage
          const allLogs = LocalStorageService.getMovieLogs();
          const episodes = allLogs.filter(log => 
            log.seriesId === itemId && 
            (log.contentType === 'tv' || log.mediaType === 'tv')
          );
          setWatchedEpisodes(episodes);
          
          // 📺 TV SERIES DATA FETCHING - Step 2: Get all season/episode info from API
          if (episodes.length > 0) {
            const seriesId = parseInt(itemId);
            const seriesDetails = await getSeriesDetails(seriesId);
            
            const seasonsWithEpisodes = await Promise.all(
              (seriesDetails.seasons || []).map(async season => {
                const seasonDetails = await getSeasonDetails(seriesId, season.season_number);
                return {
                  ...seasonDetails,
                  episode_count: season.episode_count,
                };
              })
            );

            setSeriesApiData({ ...seriesDetails, seasons: seasonsWithEpisodes });
            
            // 📊 STATISTICS CALCULATION for TV Series
            const allEpisodes = seasonsWithEpisodes.flatMap(season => season.episodes || []);
            // API'den gelen bölümlerle eşleşen yerel kayıtları filtrele
            const existingWatchedEpisodes = episodes.filter(ep =>
              allEpisodes.some(apiEp => apiEp.id === ep.tmdbId)
            );
            const watchedCount = existingWatchedEpisodes.length;
            const totalCount = allEpisodes.length;
            const rawPercent = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;
            const progressPercentage = Math.min(rawPercent, 100);
            
            // Calculate average rating
            const ratingsWithValues = episodes
              .map(ep => parseFloat(ep.rating))
              .filter(rating => !isNaN(rating) && rating > 0);
            const avgRating = ratingsWithValues.length > 0 
              ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length 
              : 0;
            
            setSeriesStats({
              totalEpisodes: totalCount,
              watchedCount,
              progressPercentage,
              avgRating
            });
          }
        }
      } catch (error) {
        console.error('Error fetching modal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, itemId, itemType]);

  // Reset data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLogDetails(null);
      setSeriesApiData(null);
      setWatchedEpisodes([]);
      setSeriesStats(null);
    }
  }, [isOpen]);

  // Episode toggle handler for series
  const handleEpisodeToggle = (episodeId: number, isWatched: boolean) => {
    // Implementation for episode toggle (similar to SeriesDetailPage)
    console.log(`Episode ${episodeId} toggled: ${isWatched}`);
    // TODO: Add real toggle logic here
  };

  // Cast Chat Functions
  const handleCastChatClick = () => {
    if (movieCast.length > 0) {
      // Open cast selection modal first
      setCastSelectionOpen(true);
    }
  };

  const handleCastSelectionClose = () => {
    setCastSelectionOpen(false);
  };

  const handleCastSelect = (castMember: TMDBCastMember) => {
    setSelectedCastMember(castMember);
    setCastSelectionOpen(false);
    setCastChatOpen(true);
  };

  const handleCastChatClose = () => {
    setCastChatOpen(false);
    setSelectedCastMember(null);
  };

  // Dynamic chat button text generator
  const getDynamicChatButtonText = (castMember: TMDBCastMember, movieTitle: string): string => {
    const actorName = castMember.name || 'Oyuncu';
    const characterName = castMember.character || 'Karakter';
    
    // Get movie genre and year from logDetails if available
    const movieGenre = logDetails?.genres?.[0] || '';
    const movieYear = logDetails?.date ? new Date(logDetails.date).getFullYear() : null;
    
          // Special cases for famous movies (using character names only)
      const specialCases: { [key: string]: { [key: string]: string } } = {
        'Titanic': {
          'Jack Dawson': 'Jack ile Konuş! 💙',
          'Rose DeWitt Bukater': 'Rose ile Konuş! 💎',
          'Caledon Hockley': 'Cal ile Konuş! 🚢'
        },
        'The Dark Knight': {
          'Bruce Wayne': 'Batman ile Konuş! 🦇',
          'Joker': 'Joker ile Konuş! 😈',
          'Harvey Dent': 'Harvey ile Konuş! ⚖️'
        },
        'Forrest Gump': {
          'Forrest Gump': 'Forrest ile Konuş! 🍫',
          'Jenny Curran': 'Jenny ile Konuş! 🌸'
        },
        'The Matrix': {
          'Neo': 'Neo ile Konuş! 🔴',
          'Morpheus': 'Morpheus ile Konuş! 🕶️',
          'Trinity': 'Trinity ile Konuş! ⚡'
        },
        'Pulp Fiction': {
          'Vincent Vega': 'Vincent ile Konuş! 🍔',
          'Jules Winnfield': 'Jules ile Konuş! 💼',
          'Mia Wallace': 'Mia ile Konuş! 💃'
        },
        'The Lord of the Rings: The Fellowship of the Ring': {
          'Frodo Baggins': 'Frodo ile Konuş! 💍',
          'Gandalf': 'Gandalf ile Konuş! 🧙‍♂️',
          'Aragorn': 'Aragorn ile Konuş! ⚔️',
          'Legolas': 'Legolas ile Konuş! 🏹',
          'Gimli': 'Gimli ile Konuş! 🪓'
        },
        'Star Wars: Episode IV - A New Hope': {
          'Luke Skywalker': 'Luke ile Konuş! ⚡',
          'Princess Leia': 'Leia ile Konuş! 👑',
          'Han Solo': 'Han ile Konuş! 🚀',
          'Darth Vader': 'Vader ile Konuş! 🖤'
        },
        'The Godfather': {
          'Don Vito Corleone': 'Don Corleone ile Konuş! 🎭',
          'Michael Corleone': 'Michael ile Konuş! 👔',
          'Sonny Corleone': 'Sonny ile Konuş! 💥'
        },
        'Fight Club': {
          'Tyler Durden': 'Tyler ile Konuş! 👊',
          'The Narrator': 'Narrator ile Konuş! 🧠'
        },
        'Inception': {
          'Cobb': 'Cobb ile Konuş! 🌪️',
          'Ariadne': 'Ariadne ile Konuş! 🏗️',
          'Arthur': 'Arthur ile Konuş! 🎯'
        }
      };
    
    // Check if this movie has special cases (case insensitive)
    const normalizedTitle = movieTitle.toLowerCase().trim();
    const matchingMovie = Object.keys(specialCases).find(key => 
      key.toLowerCase().includes(normalizedTitle) || 
      normalizedTitle.includes(key.toLowerCase())
    );
    
    if (matchingMovie && specialCases[matchingMovie][characterName]) {
      return specialCases[matchingMovie][characterName];
    }
    
    // Check if character name is different from actor name
    if (characterName && characterName !== actorName) {
      return `${characterName} ile Sohbet Et! 🎬`;
    }
    
    // Use first name for more personal touch
    const firstName = actorName.split(' ')[0];
    if (firstName && firstName !== actorName) {
      // Special emojis for famous actors
      const actorEmojis: { [key: string]: string } = {
        'Leonardo': '💙', // DiCaprio
        'Tom': '🎭', // Hanks, Cruise
        'Brad': '🔥', // Pitt
        'Johnny': '🏴‍☠️', // Depp
        'Robert': '🦇', // Downey Jr
        'Chris': '🛡️', // Evans, Hemsworth
        'Scarlett': '🖤', // Johansson
        'Emma': '👑', // Watson, Stone
        'Jennifer': '💎', // Lawrence, Aniston
        'Meryl': '👑', // Streep
        'Morgan': '🎭', // Freeman
        'Al': '🎬', // Pacino
        'Jack': '🎭', // Nicholson
        'Denzel': '🔥', // Washington
        'Will': '🎭', // Smith
        'Angelina': '🔥', // Jolie
        'Sandra': '💎', // Bullock
        'Julia': '💃', // Roberts
      };
      
      // Genre-based emojis
      const genreEmojis: { [key: string]: string } = {
        'Action': '💥',
        'Adventure': '🗺️',
        'Comedy': '😂',
        'Drama': '🎭',
        'Horror': '👻',
        'Romance': '💕',
        'Sci-Fi': '🚀',
        'Thriller': '😱',
        'Fantasy': '🧙‍♂️',
        'Animation': '🎨',
        'Crime': '🕵️',
        'Mystery': '🔍',
        'War': '⚔️',
        'Western': '🤠',
        'Musical': '🎵',
        'Documentary': '📹',
        'Family': '👨‍👩‍👧‍👦',
        'History': '📚',
        'Biography': '👤',
        'Sport': '⚽'
      };
      
      // Genre-based emoji combinations
      const genreEmojiCombos: { [key: string]: string } = {
        'Action': '💥⚡',
        'Adventure': '🗺️🏔️',
        'Comedy': '😂🎭',
        'Drama': '🎭💔',
        'Horror': '👻😱',
        'Romance': '💕💝',
        'Sci-Fi': '🚀👽',
        'Thriller': '😱🔪',
        'Fantasy': '🧙‍♂️🐉',
        'Animation': '🎨✨',
        'Crime': '🕵️🔍',
        'Mystery': '🔍❓',
        'War': '⚔️🛡️',
        'Western': '🤠🐎',
        'Musical': '🎵🎤',
        'Documentary': '📹📺',
        'Family': '👨‍👩‍👧‍👦💝',
        'History': '📚🏛️',
        'Biography': '👤📖',
        'Sport': '⚽🏆'
      };
      
      const actorEmoji = actorEmojis[firstName] || '🎭';
      const genreEmoji = genreEmojis[movieGenre] || '🎭';
      const genreEmojiCombo = genreEmojiCombos[movieGenre] || '🎭';
      const finalEmoji = actorEmoji !== '🎭' ? actorEmoji : genreEmojiCombo;
      
      // Special messages for famous actors
      const specialMessages: { [key: string]: string } = {
        'Leonardo': `${firstName} ile Konuş! 💙`,
        'Tom': `${firstName} ile Konuş! 🎭`,
        'Brad': `${firstName} ile Konuş! 🔥`,
        'Johnny': `${firstName} ile Konuş! 🏴‍☠️`,
        'Robert': `${firstName} ile Konuş! 🦇`,
        'Scarlett': `${firstName} ile Konuş! 🖤`,
        'Emma': `${firstName} ile Konuş! 👑`,
        'Jennifer': `${firstName} ile Konuş! 💎`,
        'Meryl': `${firstName} ile Konuş! 👑`,
        'Morgan': `${firstName} ile Konuş! 🎭`,
        'Al': `${firstName} ile Konuş! 🎬`,
        'Jack': `${firstName} ile Konuş! 🎭`,
        'Denzel': `${firstName} ile Konuş! 🔥`,
        'Will': `${firstName} ile Konuş! 🎭`,
        'Angelina': `${firstName} ile Konuş! 🔥`,
        'Sandra': `${firstName} ile Konuş! 💎`,
        'Julia': `${firstName} ile Konuş! 💃`
      };
      
      // Special character names for famous actors (using first name only)
      const specialCharacterNames: { [key: string]: string } = {
        'Leonardo': 'Leo',
        'Tom': 'Tommy',
        'Brad': 'Braddy',
        'Johnny': 'Johnny',
        'Robert': 'Rob',
        'Scarlett': 'Scar',
        'Emma': 'Emmy',
        'Jennifer': 'Jen',
        'Meryl': 'Meryl',
        'Morgan': 'Morgan',
        'Al': 'Al',
        'Jack': 'Jacky',
        'Denzel': 'Denzel',
        'Will': 'Will',
        'Angelina': 'Angie',
        'Sandra': 'Sandy',
        'Julia': 'Jules'
      };
      
      // Genre-based message formats (using character name only)
      const genreMessageFormats: { [key: string]: string } = {
        'Action': `${characterName} ile Aksiyon Konuş! ${finalEmoji}`,
        'Adventure': `${characterName} ile Macera Konuş! ${finalEmoji}`,
        'Comedy': `${characterName} ile Komedi Konuş! ${finalEmoji}`,
        'Drama': `${characterName} ile Drama Konuş! ${finalEmoji}`,
        'Horror': `${characterName} ile Korku Konuş! ${finalEmoji}`,
        'Romance': `${characterName} ile Aşk Konuş! ${finalEmoji}`,
        'Sci-Fi': `${characterName} ile Bilim Kurgu Konuş! ${finalEmoji}`,
        'Thriller': `${characterName} ile Gerilim Konuş! ${finalEmoji}`,
        'Fantasy': `${characterName} ile Fantastik Konuş! ${finalEmoji}`,
        'Animation': `${characterName} ile Animasyon Konuş! ${finalEmoji}`,
        'Crime': `${characterName} ile Suç Konuş! ${finalEmoji}`,
        'Mystery': `${characterName} ile Gizem Konuş! ${finalEmoji}`,
        'War': `${characterName} ile Savaş Konuş! ${finalEmoji}`,
        'Western': `${characterName} ile Vahşi Batı Konuş! ${finalEmoji}`,
        'Musical': `${characterName} ile Müzik Konuş! ${finalEmoji}`,
        'Documentary': `${characterName} ile Belgesel Konuş! ${finalEmoji}`,
        'Family': `${characterName} ile Aile Konuş! ${finalEmoji}`,
        'History': `${characterName} ile Tarih Konuş! ${finalEmoji}`,
        'Biography': `${characterName} ile Biyografi Konuş! ${finalEmoji}`,
        'Sport': `${characterName} ile Spor Konuş! ${finalEmoji}`
      };
      
      // Genre-based creative message formats (using character name only)
      const genreCreativeFormats: { [key: string]: string } = {
        'Action': `${characterName} ile Patlamalar Konuş! ${finalEmoji}`,
        'Adventure': `${characterName} ile Keşif Konuş! ${finalEmoji}`,
        'Comedy': `${characterName} ile Kahkaha Konuş! ${finalEmoji}`,
        'Drama': `${characterName} ile Duygu Konuş! ${finalEmoji}`,
        'Horror': `${characterName} ile Korku Konuş! ${finalEmoji}`,
        'Romance': `${characterName} ile Aşk Konuş! ${finalEmoji}`,
        'Sci-Fi': `${characterName} ile Gelecek Konuş! ${finalEmoji}`,
        'Thriller': `${characterName} ile Gerilim Konuş! ${finalEmoji}`,
        'Fantasy': `${characterName} ile Büyü Konuş! ${finalEmoji}`,
        'Animation': `${characterName} ile Hayal Konuş! ${finalEmoji}`,
        'Crime': `${characterName} ile Gizem Konuş! ${finalEmoji}`,
        'Mystery': `${characterName} ile Sır Konuş! ${finalEmoji}`,
        'War': `${characterName} ile Kahramanlık Konuş! ${finalEmoji}`,
        'Western': `${characterName} ile Vahşi Batı Konuş! ${finalEmoji}`,
        'Musical': `${characterName} ile Melodi Konuş! ${finalEmoji}`,
        'Documentary': `${characterName} ile Gerçek Konuş! ${finalEmoji}`,
        'Family': `${characterName} ile Sevgi Konuş! ${finalEmoji}`,
        'History': `${characterName} ile Geçmiş Konuş! ${finalEmoji}`,
        'Biography': `${characterName} ile Hayat Konuş! ${finalEmoji}`,
        'Sport': `${characterName} ile Zafer Konuş! ${finalEmoji}`
      };
      
      const specialMessage = specialMessages[firstName];
      if (specialMessage) {
        return specialMessage;
      }
      
      // Use special character name if available (first name only)
      const specialCharName = specialCharacterNames[firstName];
      if (specialCharName) {
        return `${specialCharName} ile Konuş! ${finalEmoji}`;
      }
      
      const genreMessage = genreMessageFormats[movieGenre];
      const genreCreativeMessage = genreCreativeFormats[movieGenre];
      
      // Randomly choose between normal and creative genre messages
      if (genreMessage && genreCreativeMessage) {
        return Math.random() > 0.5 ? genreCreativeMessage : genreMessage;
      } else if (genreMessage) {
        return genreMessage;
      } else if (genreCreativeMessage) {
        return genreCreativeMessage;
      }
      
      // Year-based messages for classic films (using character name only)
      if (movieYear) {
        if (movieYear < 1980) {
          return `${characterName} ile Klasik Konuş! 🎬`;
        } else if (movieYear < 2000) {
          return `${characterName} ile Retro Konuş! 📼`;
        } else if (movieYear < 2010) {
          return `${characterName} ile 2000'ler Konuş! 📱`;
        } else if (movieYear < 2020) {
          return `${characterName} ile 2010'lar Konuş! 📱`;
        } else {
          return `${characterName} ile Güncel Konuş! 🆕`;
        }
      }
      
      // Time-based messages (morning, afternoon, evening, night)
      const currentHour = new Date().getHours();
      const currentMonth = new Date().getMonth();
      let timeMessage = '';
      
      // Season-based emojis
      let seasonEmoji = '🌤️';
      if (currentMonth >= 2 && currentMonth <= 4) {
        seasonEmoji = '🌸'; // Spring
      } else if (currentMonth >= 5 && currentMonth <= 7) {
        seasonEmoji = '☀️'; // Summer
      } else if (currentMonth >= 8 && currentMonth <= 10) {
        seasonEmoji = '🍂'; // Autumn
      } else {
        seasonEmoji = '❄️'; // Winter
      }
      
      if (currentHour >= 6 && currentHour < 12) {
        timeMessage = `${characterName} ile Sabah Konuş! ${seasonEmoji}`;
      } else if (currentHour >= 12 && currentHour < 17) {
        timeMessage = `${characterName} ile Öğlen Konuş! ${seasonEmoji}`;
      } else if (currentHour >= 17 && currentHour < 21) {
        timeMessage = `${characterName} ile Akşam Konuş! ${seasonEmoji}`;
      } else {
        timeMessage = `${characterName} ile Gece Konuş! ${seasonEmoji}`;
      }
      
      // Use time-based message as fallback
      return timeMessage;
      
      // Final fallback with genre emoji (using character name only)
      return `${characterName} ile Konuş! ${finalEmoji}`;
    }
    
    // Default case
    return t('ai.chat_with_actor_excited', { actorName: actorName });
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!selectedCastMember || !logDetails) {
      return "Sorry, I'm not available right now.";
    }

    // Simulate AI response based on cast member and movie
    const responses = [
      `As ${selectedCastMember.character} in "${logDetails.title}", I can tell you that ${message.toLowerCase().includes('character') ? 'my character was one of the most challenging roles I\'ve ever played.' : 'this movie was a fantastic experience to work on.'}`,
      `Playing ${selectedCastMember.character} was incredible. ${message.toLowerCase().includes('scene') ? 'There were so many memorable scenes, especially the ones with the other cast members.' : 'The director really helped me understand the character\'s motivations.'}`,
      `Thank you for asking about "${logDetails.title}"! ${message.toLowerCase().includes('movie') ? 'It was one of the most rewarding projects I\'ve been part of.' : 'Working with such a talented cast and crew was amazing.'}`,
      `As ${selectedCastMember.character}, I can say that ${message.toLowerCase().includes('story') ? 'the story really resonated with audiences around the world.' : 'the chemistry between the cast members was natural and authentic.'}`,
      `Being part of "${logDetails.title}" was special. ${message.toLowerCase().includes('experience') ? 'The whole experience from pre-production to release was unforgettable.' : 'I learned so much about my craft through this role.'}`
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (isLoading) {
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('common.loading')}</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="bg-background">
          <div className="flex items-center justify-center h-full">
            <div className="text-foreground">{t('common.loading')}</div>
          </div>
        </IonContent>
      </IonModal>
    );
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonContent className="bg-background">
        {/* MOVIE VIEW */}
        {itemType === 'movie' && logDetails && (
          <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Header with close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
              <div></div>
              <IonButton fill="clear" color="light" onClick={onClose}>
                <IonIcon icon={close} size="large" />
              </IonButton>
            </div>
            
            {/* Movie Hero Section */}
            <div className="relative">
              <img 
                src={logDetails.poster} 
                alt={logDetails.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{logDetails.title}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="flex items-center gap-1">
                    <IonIcon icon={calendar} />
                    {logDetails.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <IonIcon icon={star} />
                    {logDetails.rating}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Movie Details */}
            <div className="p-6 space-y-6">
              {logDetails.review && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">{t('common.my_review')}</h3>
                  <p className="text-white/80 leading-relaxed">{logDetails.review}</p>
                </div>
              )}
              
              {/* Chat with Cast Button */}
              <div className="mt-6 relative group">
                <IonButton
                  expand="block"
                  size="large"
                  className={`relative overflow-hidden font-semibold rounded-2xl shadow-xl transition-all duration-500 border-0 backdrop-blur-sm px-0 py-0 ${
                    !logDetails?.tmdbId || movieCast.length === 0
                      ? 'bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#ff9800] via-[#ffb300] to-[#ffd740] hover:from-[#ffa726] hover:to-[#ffe082] text-white hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1'
                  }`}
                  onClick={handleCastChatClick}
                  disabled={!logDetails?.tmdbId || movieCast.length === 0}
                  style={{ minHeight: 56 }}
                >
                  {/* Animated background gradient */}
                  {(!logDetails?.tmdbId || movieCast.length === 0) ? null : (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff9800]/20 via-[#ffd740]/20 to-[#ffb300]/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  {/* Animated chat icon with dots */}
                  <span className="pl-5 pr-2 flex items-center">
                    <AnimatedChatIcon className={`${!logDetails?.tmdbId || movieCast.length === 0 ? 'opacity-40' : 'opacity-100'}`} />
                  </span>
                  {/* Button text with proper capitalization and emoji styling */}
                  <span className="relative z-10 text-base font-semibold tracking-wide flex-1 text-center flex items-center justify-center gap-2 select-none">
                    <span className="truncate">
                      {!logDetails?.tmdbId
                        ? t('ai.chat_with_cast_no_tmdb')
                        : movieCast.length === 0
                          ? t('ai.chat_with_cast_loading')
                          : movieCast.length > 0
                            ? getDynamicChatButtonText(movieCast[0], logDetails?.title || '')
                            : t('ai.chat_with_cast')
                      }
                    </span>
                    {/* Emoji with special styling */}
                    {movieCast.length > 0 && logDetails?.tmdbId && (
                      <span className="text-xl animate-pulse ml-1">✨</span>
                    )}
                  </span>
                  {/* Shine effect on hover - only when enabled */}
                  {(!logDetails?.tmdbId || movieCast.length === 0) ? null : (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                </IonButton>
                {/* Subtle glow effect - only when enabled */}
                {(!logDetails?.tmdbId || movieCast.length === 0) ? null : (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff9800]/20 via-[#ffd740]/20 to-[#ffb300]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TV SERIES VIEW */}
        {itemType === 'tv' && seriesApiData && seriesStats && (
          <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Header with close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
              <div></div>
              <IonButton fill="clear" color="light" onClick={onClose}>
                <IonIcon icon={close} size="large" />
              </IonButton>
            </div>
            
            {/* Series Hero Section */}
            <div className="relative">
              <img 
                src={seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : '/placeholder-poster.jpg'} 
                alt={seriesApiData.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{seriesApiData.name}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <span>{seriesApiData.number_of_seasons} sezon</span>
                  <span>{seriesStats.totalEpisodes} bölüm</span>
                </div>
              </div>
            </div>
            
            {/* Progress Dashboard */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* İzlenen Bölüm */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300">{seriesStats.watchedCount}</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">İzlenen Bölüm</div>
                </div>
                
                {/* İlerleme */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-orange-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-400/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-orange-400/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">{Math.round(seriesStats.progressPercentage)}%</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">İlerleme</div>
                </div>
                
                {/* Toplam Bölüm */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{seriesStats.totalEpisodes}</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">Toplam Bölüm</div>
                </div>
                
                {/* Ortalama Puan */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{seriesStats.avgRating.toFixed(1)}</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">Ortalama Puan</div>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-orange-400 to-yellow-400 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${seriesStats.progressPercentage}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                      {/* Moving light effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-bounce"></div>
                    </div>
                  </div>
                  
                  {/* Progress indicator dot */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-1000 ease-out border-2 border-primary/30"
                    style={{ left: `${seriesStats.progressPercentage}%` }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress text */}
                <div className="text-center mt-3">
                  <span className="text-white/60 text-xs">{seriesStats.watchedCount} / {seriesStats.totalEpisodes} bölüm izlendi</span>
                </div>
              </div>
              
              {/* Seasons Accordion */}
              <div className="space-y-4">
                {seriesApiData.seasons.map(season => {
                  const watchedEpisodeIds = new Set(
                    watchedEpisodes.map(ep => String(ep.tmdbId))
                  );
                  
                  return (
                    <SeasonAccordion
                      key={season.id}
                      seasonNumber={season.season_number}
                      episodes={season.episodes || []}
                      watchedEpisodeIds={watchedEpisodeIds}
                      watchedEpisodes={watchedEpisodes}
                      onEpisodeToggle={handleEpisodeToggle}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </IonContent>
      
      {/* Cast Selection Modal */}
      {logDetails?.tmdbId && movieCast.length > 0 && (
        <CastSelectionModal
          open={castSelectionOpen}
          onClose={handleCastSelectionClose}
          movieId={logDetails.tmdbId}
          movieTitle={logDetails.title}
          onCastSelect={handleCastSelect}
        />
      )}

      {/* Cast Chat Modal */}
      {selectedCastMember && logDetails && (
        <CastChatModal
          open={castChatOpen}
          onClose={handleCastChatClose}
          castMember={selectedCastMember}
          movieTitle={logDetails.title}
          onSendMessage={handleSendMessage}
        />
      )}
    </IonModal>
  );
};

export default DetailViewModal;
