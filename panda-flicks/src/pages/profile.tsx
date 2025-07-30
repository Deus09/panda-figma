import React, { useState, useEffect, useRef } from 'react';
import TopHeaderBar from '../components/TopHeaderBar';
import BottomNavBar from '../components/BottomNavBar';
import SettingsModal from '../components/SettingsModal';
import MovieCard from '../components/MovieCard';
import MoviePosterCard from '../components/MoviePosterCard';
import LocalStorageService, { UserProfile } from '../services/localStorage';
import styles from './profile.module.css';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    username: '',
    fullName: '',
    bio: '',
    favoriteGenres: [] as string[]
  });

  // Avatar galerisi - Film karakterleri ve sinema ikonları
  const avatarGallery = [
    { id: 'scarface', url: 'https://i.imgur.com/VqNKQyJ.png', name: 'Tony Montana' },
    { id: 'godfather', url: 'https://i.imgur.com/8xKQyZL.png', name: 'Vito Corleone' },
    { id: 'pulpfiction', url: 'https://i.imgur.com/KGHFJxL.png', name: 'Vincent Vega' },
    { id: 'matrix', url: 'https://i.imgur.com/7R9ZJxL.png', name: 'Neo' },
    { id: 'joker', url: 'https://i.imgur.com/QxL8K9J.png', name: 'Joker' },
    { id: 'batman', url: 'https://i.imgur.com/9xKL7ZJ.png', name: 'Batman' },
    { id: 'cinema', url: 'https://i.imgur.com/MxL9K8J.png', name: 'Cinema Icon' },
    { id: 'popcorn', url: 'https://i.imgur.com/LxM8K7J.png', name: 'Popcorn' }
  ];

  const popularGenres = [
    'Aksiyon', 'Dram', 'Komedi', 'Korku', 'Bilim Kurgu', 'Romantik',
    'Gerilim', 'Fantastik', 'Macera', 'Suç', 'Belgesel', 'Animasyon'
  ];

  useEffect(() => {
    loadProfile();
    // Profil istatistiklerini güncelle
    LocalStorageService.updateProfileStats();
  }, []);

  const loadProfile = () => {
    const userProfile = LocalStorageService.getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      setEditData({
        username: userProfile.username,
        fullName: userProfile.fullName || '',
        bio: userProfile.bio || '',
        favoriteGenres: userProfile.favoriteGenres
      });
      // Profil istatistiklerini güncelle
      LocalStorageService.updateProfileStats();
      // Güncellenmiş profili tekrar yükle
      const updatedProfile = LocalStorageService.getUserProfile();
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } else {
      // İlk kullanım için varsayılan profil oluştur
      createDefaultProfile();
    }
  };

  const createDefaultProfile = () => {
    const defaultProfile = LocalStorageService.createUserProfile({
      username: 'CinemaLover',
      fullName: '',
      bio: '',
      joinDate: new Date().toISOString(),
      favoriteMovies: [],
      favoriteGenres: []
    });
    setProfile(defaultProfile);
    setEditData({
      username: defaultProfile.username,
      fullName: defaultProfile.fullName || '',
      bio: defaultProfile.bio || '',
      favoriteGenres: defaultProfile.favoriteGenres
    });
  };

  const generateInitialsAvatar = (name: string): string => {
    const initials = name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = initials.charCodeAt(0) % colors.length;
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="${colors[colorIndex]}"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
      </svg>
    `)}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarGallerySelect = (avatarUrl: string) => {
    setAvatarPreview(avatarUrl);
  };

  const handleSave = () => {
    if (!profile) return;

    const updates = {
      ...editData,
      avatar: avatarPreview || profile.avatar
    };

    const updatedProfile = LocalStorageService.updateUserProfile(updates);
    if (updatedProfile) {
      setProfile(updatedProfile);
      setIsEditing(false);
      setAvatarPreview(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    if (profile) {
      setEditData({
        username: profile.username,
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        favoriteGenres: profile.favoriteGenres
      });
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getRecentMovies = () => {
    // LocalStorage'dan son izlenen filmleri al
    const watchedMovies = LocalStorageService.getMovieLogsByType('watched');
    // Tarih sırasına göre sırala (en yeni önce) ve ilk 5'ini al
    return watchedMovies
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  const getCurrentAvatar = () => {
    if (avatarPreview) return avatarPreview;
    if (profile?.avatar) return profile.avatar;
    const displayName = profile?.fullName || profile?.username || 'User';
    return generateInitialsAvatar(displayName);
  };

  const handleGenreToggle = (genre: string) => {
    setEditData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  // Rozet ilerleme fonksiyonları
  const getProgressForBadge = (badge: any) => {
    if (!profile) return 0;

    const logs = LocalStorageService.getMovieLogs();
    const watchedLogs = logs.filter(log => log.type === 'watched');

    switch (badge.id) {
      case 'first-movie':
        return profile.watchedMovieCount;
      
      case 'comedy-expert':
        return watchedLogs.filter(log => 
          log.mediaType === 'movie' && 
          log.genres && 
          log.genres.some(genre => 
            genre.toLowerCase().includes('komedi') || 
            genre.toLowerCase().includes('comedy')
          )
        ).length;
      
      case 'drama-expert':
        return watchedLogs.filter(log => 
          log.mediaType === 'movie' && 
          log.genres && 
          log.genres.some(genre => 
            genre.toLowerCase().includes('drama') || 
            genre.toLowerCase().includes('dram')
          )
        ).length;
      
      case 'action-expert':
        return watchedLogs.filter(log => 
          log.mediaType === 'movie' && 
          log.genres && 
          log.genres.some(genre => 
            genre.toLowerCase().includes('aksiyon') || 
            genre.toLowerCase().includes('action')
          )
        ).length;
      
      case 'series-killer':
        // Tamamlanan dizi sayısı
        const seriesGroups = new Map<string, { totalSeasons: number; watchedSeasons: Set<number> }>();
        watchedLogs
          .filter(log => log.mediaType === 'tv' && log.seriesId && log.seasonNumber)
          .forEach(log => {
            const seriesId = log.seriesId!;
            const seasonNumber = log.seasonNumber!;
            
            if (!seriesGroups.has(seriesId)) {
              seriesGroups.set(seriesId, {
                totalSeasons: log.seasonCount || 1,
                watchedSeasons: new Set()
              });
            }
            
            const series = seriesGroups.get(seriesId)!;
            series.watchedSeasons.add(seasonNumber);
          });
        
        return Array.from(seriesGroups.entries())
          .filter(([_, series]) => series.watchedSeasons.size >= series.totalSeasons)
          .length;
      
      case 'nostalgia-traveler':
        return watchedLogs.filter(log => 
          log.mediaType === 'movie' && 
          log.releaseYear && 
          log.releaseYear < 1990
        ).length;
      
      case 'marathon-runner':
        // Bir günde 3+ film izleme günü var mı?
        const dailyCounts = new Map<string, number>();
        watchedLogs
          .filter(log => log.mediaType === 'movie')
          .forEach(log => {
            const date = log.date.split('T')[0];
            dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
          });
        return Array.from(dailyCounts.values()).some(count => count >= 3) ? 1 : 0;
      
      case 'century-watcher':
        return profile.watchedMovieCount;
      
      case 'binge-watcher':
        return profile.totalEpisodesWatched;
      
      case 'time-traveler':
        return profile.totalWatchTimeMinutes;
      
      case 'critic-master':
        return watchedLogs.filter(log => 
          log.review && log.review.trim().length > 0
        ).length;
      
      case 'collector':
        return logs.filter(log => log.type === 'watchlist').length;
      
      default:
        return 0;
    }
  };

  const getNextBadgeTarget = () => {
    if (!profile) return null;
    return profile.badges.find(badge => !badge.isEarned);
  };

  const getUserLevel = () => {
    if (!profile) return 'Çaylak';
    
    const earnedCount = profile.earnedBadgeCount;
    if (earnedCount >= 8) return 'Sinema Efsanesi';
    if (earnedCount >= 6) return 'Film Uzmanı';
    if (earnedCount >= 4) return 'Sinema Meraklısı';
    if (earnedCount >= 2) return 'Film Sever';
    return 'Çaylak';
  };

  const getLevelStyle = () => {
    if (!profile) return 'bg-gray-600';
    
    const earnedCount = profile.earnedBadgeCount;
    if (earnedCount >= 8) return 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black';
    if (earnedCount >= 6) return 'bg-gradient-to-r from-[#FE7743] to-[#E56A3C] text-white';
    if (earnedCount >= 4) return 'bg-gradient-to-r from-[#4ECDC4] to-[#44B7C8] text-white';
    if (earnedCount >= 2) return 'bg-gradient-to-r from-[#96CEB4] to-[#74B9FF] text-white';
    return 'bg-gray-600 text-white';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'bg-gradient-to-r from-[#FE7743] to-[#E56A3C]';
      case 'genre': return 'bg-gradient-to-r from-[#4ECDC4] to-[#44B7C8]';
      case 'time': return 'bg-gradient-to-r from-[#FFEAA7] to-[#FDCB6E]';
      case 'streak': return 'bg-gradient-to-r from-[#96CEB4] to-[#74B9FF]';
      case 'special': return 'bg-gradient-to-r from-[#DDA0DD] to-[#A29BFE]';
      default: return 'bg-gray-500';
    }
  };

  // Konfeti animasyonu
  const createConfetti = () => {
    const colors = ['#FE7743', '#E56A3C', '#4ECDC4', '#FFEAA7', '#96CEB4', '#DDA0DD'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'fixed w-2 h-2 pointer-events-none z-50';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      confetti.style.borderRadius = '50%';
      
      // Animasyon CSS'i
      confetti.style.animation = `confetti-fall ${confetti.style.animationDuration} linear ${confetti.style.animationDelay}`;
      
      document.body.appendChild(confetti);
      
      // Temizleme
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
  };

  const handleBadgeClick = (badge: any) => {
    if (badge.isEarned) {
      createConfetti();
      // Haptic feedback (mobil cihazlar için)
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white">
      <TopHeaderBar 
        title="Panda Profile" 
        showBackButton={false}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <div className="flex-1 px-4 py-6 pb-32 overflow-y-auto">
        {/* Profil Başlığı (Hero Section) */}
        <div className="bg-[#222] rounded-[20px] p-6 mb-6 shadow-lg relative overflow-hidden">
          {/* Arka Plan - En Yüksek Puanlı Film Afişi (Opsiyonel) */}
          <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-[#FE7743]/10 to-[#E56A3C]/10"></div>
          
          <div className="relative z-10 flex items-start space-x-4">
            {/* Avatar - Sol Hizalı */}
            <div className="relative flex-shrink-0">
              <img
                src={getCurrentAvatar()}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-[#FE7743]"
              />
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FE7743] rounded-full flex items-center justify-center text-white hover:bg-[#E56A3C] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Kullanıcı Bilgileri - Sağ Hizalı */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-[#333] text-white text-xl font-bold rounded-lg px-3 py-1 border border-gray-600 focus:border-[#FE7743] focus:outline-none flex-1"
                    placeholder="Kullanıcı Adı"
                  />
                ) : (
                  <>
                    <h1 className="text-xl font-bold text-white font-poppins">
                      @{profile.username}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-6 h-6 bg-[#FE7743]/20 hover:bg-[#FE7743]/40 rounded-full flex items-center justify-center text-[#FE7743] transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Hakkında */}
              <div className="mb-3">
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-[#333] text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-[#FE7743] focus:outline-none resize-none text-sm"
                    rows={2}
                    placeholder="Kendinizi tanıtın..."
                  />
                ) : (
                  <p className="text-gray-300 text-sm leading-relaxed font-poppins">
                    {profile.bio || "Henüz bir biyografi eklenmemiş."}
                  </p>
                )}
              </div>

              {/* Favori Türler */}
              <div className="mb-3">
                {isEditing ? (
                  <div className="flex flex-wrap gap-1">
                    {popularGenres.slice(0, 6).map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          editData.favoriteGenres.includes(genre)
                            ? 'bg-[#FE7743] text-white'
                            : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {profile.favoriteGenres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-1 bg-[#FE7743] text-white rounded-full text-xs font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                    {profile.favoriteGenres.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-white rounded-full text-xs font-medium">
                        +{profile.favoriteGenres.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Aramıza Katılma Tarihi */}
              <p className="text-gray-400 text-xs font-poppins">
                Aramıza Katılma Tarihi: {formatJoinDate(profile.joinDate)}
              </p>
            </div>
          </div>

          {/* Avatar Galerisi - Düzenleme Modunda */}
          {isEditing && (
            <div className="mt-6 pt-4 border-t border-[#333]">
              <p className="text-[#FE7743] text-sm mb-3">Avatar Galerisi</p>
              <div className="grid grid-cols-4 gap-3">
                {avatarGallery.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarGallerySelect(avatar.url)}
                    className="w-12 h-12 rounded-full border-2 border-gray-600 hover:border-[#FE7743] transition-colors overflow-hidden"
                  >
                    <img
                      src={`https://placehold.co/48x48/333/FE7743?text=${avatar.name.charAt(0)}`}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Düzenleme Butonları */}
          {isEditing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#4CAF50] hover:bg-[#45A049] text-white py-2 rounded-lg font-medium transition-colors font-poppins text-sm"
              >
                Kaydet
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-[#666] hover:bg-[#555] text-white py-2 rounded-lg font-medium transition-colors font-poppins text-sm"
              >
                İptal
              </button>
            </div>
          )}
        </div>

        {/* İstatistiksel Gösterge Paneli (Dashboard) */}
        <div className="bg-[#222] rounded-[20px] p-6 mb-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-[#FE7743] rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-white font-poppins">İstatistiksel Gösterge Paneli</h2>
          </div>

          {/* Ana Göstergeler - İyileştirilmiş Kartlar */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* İzlenen Filmler */}
            <div className={`${styles.statisticCard} bg-gradient-to-br from-[#333] to-[#444] rounded-xl p-4 border border-[#FE7743]/10 hover:border-[#FE7743]/30 transition-all duration-300 relative overflow-hidden`}>
              {/* Mikro-grafik arka plan efekti */}
              <div className={`${styles.microChart} absolute inset-0 opacity-5`}>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,30 Q20,20 40,25 T80,15 L100,20 L100,40 L0,40 Z" fill="url(#filmGradient)" />
                  <defs>
                    <linearGradient id="filmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FE7743" />
                      <stop offset="100%" stopColor="#E56A3C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#FE7743]/20 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FE7743">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-poppins">Bu Ay</p>
                    <p className="text-xs text-[#4CAF50] font-poppins">+2</p>
                  </div>
                </div>
                <p className={`${styles.numberCounter} text-3xl font-bold text-white font-poppins mb-1 leading-none`}>{profile.watchedMovieCount}</p>
                <p className="text-sm text-gray-300 font-poppins">İzlenen Filmler</p>
              </div>
            </div>

            {/* İzlenen Diziler */}
            <div className={`${styles.statisticCard} bg-gradient-to-br from-[#333] to-[#444] rounded-xl p-4 border border-[#4ECDC4]/10 hover:border-[#4ECDC4]/30 transition-all duration-300 relative overflow-hidden`}>
              <div className={`${styles.microChart} absolute inset-0 opacity-5`}>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,25 Q25,15 50,20 T100,25 L100,40 L0,40 Z" fill="url(#tvGradient)" />
                  <defs>
                    <linearGradient id="tvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ECDC4" />
                      <stop offset="100%" stopColor="#45B7D1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#4ECDC4">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8v8l7-4z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-poppins">Bu Ay</p>
                    <p className="text-xs text-[#4CAF50] font-poppins">+1</p>
                  </div>
                </div>
                <p className={`${styles.numberCounter} text-3xl font-bold text-white font-poppins mb-1 leading-none`}>{profile.watchedTvCount}</p>
                <p className="text-sm text-gray-300 font-poppins">İzlenen Diziler</p>
              </div>
            </div>

            {/* Toplam Bölümler */}
            <div className={`${styles.statisticCard} bg-gradient-to-br from-[#333] to-[#444] rounded-xl p-4 border border-[#96CEB4]/10 hover:border-[#96CEB4]/30 transition-all duration-300 relative overflow-hidden`}>
              <div className={`${styles.microChart} absolute inset-0 opacity-5`}>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,35 Q30,10 60,30 T100,15 L100,40 L0,40 Z" fill="url(#episodeGradient)" />
                  <defs>
                    <linearGradient id="episodeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#96CEB4" />
                      <stop offset="100%" stopColor="#FFEAA7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#96CEB4]/20 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#96CEB4">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-poppins">Ortalama</p>
                    <p className="text-xs text-white font-poppins">{Math.round(profile.totalEpisodesWatched / Math.max(1, profile.watchedTvCount))}/dizi</p>
                  </div>
                </div>
                <p className={`${styles.numberCounter} text-3xl font-bold text-white font-poppins mb-1 leading-none`}>{profile.totalEpisodesWatched}</p>
                <p className="text-sm text-gray-300 font-poppins">Toplam Bölüm</p>
              </div>
            </div>

            {/* Harcanan Süre - İyileştirilmiş */}
            <div className={`${styles.statisticCard} bg-gradient-to-br from-[#333] to-[#444] rounded-xl p-4 border border-[#FFEAA7]/10 hover:border-[#FFEAA7]/30 transition-all duration-300 relative overflow-hidden`}>
              <div className={`${styles.microChart} absolute inset-0 opacity-5`}>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,20 Q40,5 80,25 L100,30 L100,40 L0,40 Z" fill="url(#timeGradient)" />
                  <defs>
                    <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFEAA7" />
                      <stop offset="100%" stopColor="#FDCB6E" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#FFEAA7]/20 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFEAA7">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-poppins">Günlük</p>
                    <p className="text-xs text-white font-poppins">
                      {Math.round(profile.totalWatchTimeMinutes / Math.max(1, Math.floor((Date.now() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24))))}dk
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-white font-poppins mb-1 leading-tight">
                  {LocalStorageService.formatWatchTime(profile.totalWatchTimeMinutes)}
                </p>
                <p className="text-sm text-gray-300 font-poppins">Toplam Süre</p>
              </div>
            </div>
          </div>

          {/* Hızlı Bakış - Görselleştirilmiş */}
          <div className={`${styles.quickOverviewCard} bg-gradient-to-r from-[#333]/80 to-[#444]/80 rounded-2xl p-6 backdrop-blur-sm border border-[#FE7743]/10`}>
            <h3 className="text-lg font-semibold text-[#FE7743] mb-6 font-poppins flex items-center">
              <svg width="20" height="20" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Hızlı Bakış
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ortalama Puan - Dairesel Progress */}
              <div className={`${styles.hoverScale} flex items-center space-x-4`}>
                <div className="relative w-16 h-16">
                  <svg className={`${styles.progressRing} w-16 h-16 transform -rotate-90`} viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="#333"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="#FE7743"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${85 * 0.88} 88`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">8.5</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-poppins">Ortalama Puan</p>
                  <p className="text-white font-semibold font-poppins">Mükemmel</p>
                </div>
              </div>

              {/* En Çok İzlenen Tür - Chip */}
              <div className={`${styles.hoverScale} flex items-center space-x-4`}>
                <div className="w-16 h-16 bg-gradient-to-br from-[#4ECDC4] to-[#45B7D1] rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-poppins">Favori Tür</p>
                  <span className={`${styles.chipComponent} inline-block bg-[#4ECDC4] text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {profile.favoriteGenres[0] || 'Henüz Yok'}
                  </span>
                </div>
              </div>

              {/* Bu Ay İzlenen - Trend Göstergesi */}
              <div className={`${styles.hoverScale} flex items-center space-x-4`}>
                <div className="w-16 h-16 bg-gradient-to-br from-[#96CEB4] to-[#FFEAA7] rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-poppins">Bu Ay İzlenen</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold font-poppins">12 Film</span>
                    <span className={`${styles.trendIndicator} text-[#4CAF50] text-xs font-medium bg-[#4CAF50]/20 px-2 py-1 rounded-full`}>
                      +2 ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* Sinema Zaman Tüneli */}
              <div className={`${styles.hoverScale} flex items-center space-x-4`}>
                <div className="w-16 h-16 bg-gradient-to-br from-[#DDA0DD] to-[#9B59B6] rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm font-poppins mb-2">Zaman Tüneli</p>
                  <div className="flex space-x-1">
                    <div className={`${styles.timelineProgress} flex-1 bg-[#333] rounded-full h-2`}>
                      <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FE7743] h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>90'lar</span>
                    <span>2000'ler</span>
                    <span>2020'ler</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler Modülü */}
        <div className="bg-[#222] rounded-[20px] p-6 mb-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-[#FE7743] rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-white font-poppins">Son Aktiviteler</h2>
          </div>

          {/* Yatayda Kaydırılabilir Poster Şeridi */}
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4 min-w-max">
              {/* Son izlenen filmler için sadece posterler */}
              {getRecentMovies().map((movie, index) => (
                <MoviePosterCard
                  key={`recent-${index}`}
                  title={movie.title}
                  poster={movie.poster}
                />
              ))}
              
              {/* Eğer hiç film yoksa */}
              {getRecentMovies().length === 0 && (
                <div className="flex-shrink-0 w-24 h-36 bg-[#333] rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-600">
                  <svg width="32" height="32" className="text-gray-500 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                  </svg>
                  <p className="text-gray-400 text-xs text-center font-poppins">
                    Henüz film yok
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alt Bilgi */}
          <div className="flex items-center mt-4 pt-4 border-t border-[#333]">
            <p className="text-gray-400 text-sm font-poppins">
              Son {getRecentMovies().length} aktivite
            </p>
          </div>
        </div>

        {/* Rozetler ve Başarılar */}
        <div className="bg-[#222] rounded-[20px] p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#FE7743] rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-white font-poppins">Rozetler ve Başarılar</h2>
            </div>
            <div className="bg-[#FE7743] text-white px-3 py-1 rounded-full text-sm font-medium font-poppins">
              {profile.earnedBadgeCount}/{profile.badges.length}
            </div>
          </div>

          {/* Rozet Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className={`
                  relative p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                  ${badge.isEarned 
                    ? `bg-gradient-to-br from-[#FE7743]/25 to-[#E56A3C]/15 border-[#FE7743] shadow-xl shadow-[#FE7743]/30 
                       hover:shadow-2xl hover:shadow-[#FE7743]/40 hover:border-[#FE7743]` 
                    : `bg-[#1A1A1A] border-gray-700 opacity-70 hover:opacity-90 hover:border-gray-600
                       bg-gradient-to-br from-[#222] to-[#333]`
                  }
                `}
                onClick={() => handleBadgeClick(badge)}
              >
                {/* Kazanılmış rozet için ışıltı efekti */}
                {badge.isEarned && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FE7743]/10 to-transparent 
                                  animate-pulse rounded-2xl"></div>
                )}

                {/* Kazanılmış işareti */}
                {badge.isEarned && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#FE7743] to-[#E56A3C] 
                                  rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
                
                {/* Kategori çizgisi */}
                <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${getCategoryColor(badge.category)}`}></div>
                
                <div className="text-center relative z-10">
                  {/* İkon */}
                  <div className={`text-4xl mb-3 transition-all duration-300 ${
                    badge.isEarned 
                      ? 'filter-none transform scale-110' 
                      : 'filter grayscale opacity-50'
                  }`}>
                    {badge.icon}
                  </div>
                  
                  {/* Başlık */}
                  <h4 className={`text-sm font-bold mb-2 font-poppins leading-tight ${
                    badge.isEarned ? 'text-white' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h4>
                  
                  {/* Açıklama */}
                  <p className={`text-xs leading-snug font-poppins mb-3 ${
                    badge.isEarned ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {badge.description}
                  </p>
                  
                  {/* Kazanılma tarihi */}
                  {badge.isEarned && badge.earnedAt && (
                    <div className="mt-3 px-2 py-1 bg-[#FE7743]/20 rounded-full">
                      <p className="text-xs text-[#FE7743] font-medium font-poppins">
                        {new Date(badge.earnedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  )}
                  
                  {/* İlerleme çubuğu (kazanılmamış rozetler için) */}
                  {!badge.isEarned && (
                    <div className="mt-3">
                      <div className={`w-full bg-gray-700 rounded-full h-2.5 overflow-hidden ${
                        getProgressForBadge(badge) / badge.requirement > 0.8 ? 'ring-2 ring-[#FE7743]/50' : ''
                      }`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            getProgressForBadge(badge) / badge.requirement > 0.8 
                              ? 'bg-gradient-to-r from-[#FE7743] to-[#E56A3C] shadow-lg progressBarGlow' 
                              : getProgressForBadge(badge) / badge.requirement > 0.5
                              ? 'bg-gradient-to-r from-[#FE7743]/80 to-[#E56A3C]/80'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (getProgressForBadge(badge) / badge.requirement) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500 font-poppins">
                          {getProgressForBadge(badge)}/{badge.requirement}
                        </p>
                        <p className={`text-xs font-poppins ${
                          getProgressForBadge(badge) / badge.requirement > 0.8 
                            ? 'text-[#FE7743] font-semibold' 
                            : 'text-gray-400'
                        }`}>
                          %{Math.round((getProgressForBadge(badge) / badge.requirement) * 100)}
                        </p>
                      </div>
                      {getProgressForBadge(badge) / badge.requirement > 0.8 && (
                        <p className="text-xs text-[#FE7743] font-medium font-poppins mt-1 animate-pulse">
                          Hedefe çok yakın! 🔥
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Kilit ikonu */}
                  {!badge.isEarned && getProgressForBadge(badge) === 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="gray">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Başarı Özeti */}
          <div className="mt-8 bg-gradient-to-r from-[#333]/50 to-[#444]/50 rounded-xl p-6 border border-[#FE7743]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#FE7743] font-poppins flex items-center">
                <svg width="20" height="20" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Başarı Özeti
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-bold font-poppins ${getLevelStyle()}`}>
                {getUserLevel()}
              </div>
            </div>
            
            {/* İlerleme çemberi */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#333"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#FE7743"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - profile.earnedBadgeCount / profile.badges.length)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white font-poppins">
                    %{Math.round((profile.earnedBadgeCount / profile.badges.length) * 100)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#222] rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#FE7743] font-poppins">{profile.earnedBadgeCount}</div>
                <div className="text-gray-300 font-poppins">Kazanılan</div>
              </div>
              <div className="bg-[#222] rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-400 font-poppins">
                  {profile.badges.length - profile.earnedBadgeCount}
                </div>
                <div className="text-gray-300 font-poppins">Kalan</div>
              </div>
              <div className="bg-[#222] rounded-lg p-3 text-center col-span-2">
                <div className="text-gray-300 text-sm font-poppins mb-1">Sonraki Hedef</div>
                <div className="text-white font-medium font-poppins">
                  {getNextBadgeTarget()?.name || '🎉 Tüm rozetler kazanıldı!'}
                </div>
                {getNextBadgeTarget() && (
                  <div className="text-xs text-gray-400 mt-1 font-poppins">
                    {getProgressForBadge(getNextBadgeTarget())}/{getNextBadgeTarget()?.requirement}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
      
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default Profile;
