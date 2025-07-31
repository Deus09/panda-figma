// Local Storage Service for Panda Flicks
// Manages persistent storage of movie logs and user preferences

export interface MovieLog {
  id: string;
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
  type: 'watched' | 'watchlist';
  mediaType: 'movie' | 'tv';
  tmdbId?: number;
  // Dizi için ekstra alanlar
  seasonCount?: number;
  episodeCount?: number;
  seasonNumber?: number;   // Sezon numarası (bölüm kaydetme için)
  runtime?: number; // dakika cinsinden
  // Filtre sistemi için gerekli yeni alanlar
  contentType: 'movie' | 'tv';
  seriesId?: string;       // Dizi ID'si (Gruplama için kritik)
  seriesTitle?: string;    // Dizi Adı (Gruplanmış kart başlığı için)
  seriesPoster?: string;   // Dizinin Ana Poster Resmi (Gruplanmış kart görseli için)
  // Rozet sistemi için gerekli alanlar
  genres?: string[];       // Film/dizi türleri
  releaseYear?: number;    // Yayın yılı
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  darkMode: boolean;
  language: string;
  defaultView: 'watched' | 'watchlist';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'genre' | 'time' | 'streak' | 'special';
  requirement: number;
  earnedAt?: string;
  isEarned: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  favoriteMovies: string[];
  favoriteGenres: string[];
  // Temel sayımlar
  watchedCount: number;
  watchlistCount: number;
  // Detaylı istatistikler
  watchedMovieCount: number;
  watchedTvCount: number;
  totalEpisodesWatched: number;
  totalWatchTimeMinutes: number;
  // Rozetler
  badges: Badge[];
  earnedBadgeCount: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  MOVIE_LOGS: 'panda-flicks-movie-logs',
  USER_PREFERENCES: 'panda-flicks-user-preferences',
  USER_PROFILE: 'panda-flicks-user-profile',
  LAST_ACTIVE_TAB: 'panda-flicks-last-active-tab'
} as const;

export class LocalStorageService {
  // Utility method to generate unique IDs
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Movie Logs Operations
  static getMovieLogs(): MovieLog[] {
    try {
      const logs = localStorage.getItem(STORAGE_KEYS.MOVIE_LOGS);
      const parsedLogs = logs ? JSON.parse(logs) : [];
      
      // Mevcut verileri yeni formata migrate et
      return parsedLogs.map((log: any) => ({
        ...log,
        mediaType: log.mediaType || 'movie', // Varsayılan olarak movie
        contentType: log.contentType || log.mediaType || 'movie', // contentType öncelik ver
        runtime: log.runtime || (log.mediaType === 'tv' || log.contentType === 'tv' ? 45 : 120),
        seasonCount: log.seasonCount || undefined,
        episodeCount: log.episodeCount || undefined,
        // Dizi için eksik alanları doldur
        seriesId: log.seriesId || (log.contentType === 'tv' || log.mediaType === 'tv' ? log.tmdbId?.toString() : undefined),
        seriesTitle: log.seriesTitle || (log.contentType === 'tv' || log.mediaType === 'tv' ? log.title : undefined),
        seriesPoster: log.seriesPoster || undefined, // Bölüm poster'ini dizi poster'i olarak kullanma
      }));
    } catch (error) {
      console.error('Error reading movie logs from localStorage:', error);
      return [];
    }
  }

  static saveMovieLog(log: Omit<MovieLog, 'id' | 'createdAt' | 'updatedAt'>): MovieLog {
    try {
      const now = new Date().toISOString();
      const newLog: MovieLog = {
        ...log,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      };

      const existingLogs = this.getMovieLogs();
      const updatedLogs = [...existingLogs, newLog];
      localStorage.setItem(STORAGE_KEYS.MOVIE_LOGS, JSON.stringify(updatedLogs));
      
      return newLog;
    } catch (error) {
      console.error('Error saving movie log to localStorage:', error);
      throw new Error('Failed to save movie log');
    }
  }

  static updateMovieLog(id: string, updates: Partial<Omit<MovieLog, 'id' | 'createdAt'>>): MovieLog | null {
    try {
      const logs = this.getMovieLogs();
      const logIndex = logs.findIndex(log => log.id === id);
      
      if (logIndex === -1) {
        console.error(`Movie log with id ${id} not found`);
        return null;
      }

      const updatedLog: MovieLog = {
        ...logs[logIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      logs[logIndex] = updatedLog;
      localStorage.setItem(STORAGE_KEYS.MOVIE_LOGS, JSON.stringify(logs));
      
      return updatedLog;
    } catch (error) {
      console.error('Error updating movie log:', error);
      return null;
    }
  }

  static deleteMovieLog(id: string): boolean {
    try {
      const logs = this.getMovieLogs();
      const filteredLogs = logs.filter(log => log.id !== id);
      
      if (filteredLogs.length === logs.length) {
        console.error(`Movie log with id ${id} not found`);
        return false;
      }

      localStorage.setItem(STORAGE_KEYS.MOVIE_LOGS, JSON.stringify(filteredLogs));
      return true;
    } catch (error) {
      console.error('Error deleting movie log:', error);
      return false;
    }
  }

  // Yeni yardımcı fonksiyon: tmdbId ile kayıt type'ını güncelleme
  static updateLogTypeByTmdbId(tmdbId: number, newType: 'watched' | 'watchlist', mediaType: 'movie' | 'tv' = 'movie'): MovieLog | null {
    try {
      const logs = this.getMovieLogs();
      const logIndex = logs.findIndex(log => log.tmdbId === tmdbId && log.mediaType === mediaType);
      
      if (logIndex === -1) {
        // Kayıt yoksa null döndür - yeni kayıt oluşturma işlemi component'te yapılacak
        return null;
      }

      // Mevcut kaydı güncelle
      const updatedLog: MovieLog = {
        ...logs[logIndex],
        type: newType,
        updatedAt: new Date().toISOString()
      };

      logs[logIndex] = updatedLog;
      localStorage.setItem(STORAGE_KEYS.MOVIE_LOGS, JSON.stringify(logs));
      
      return updatedLog;
    } catch (error) {
      console.error('Error updating log type by tmdbId:', error);
      return null;
    }
  }

  // tmdbId ile kayıt durumunu kontrol etme
  static getLogStatusByTmdbId(tmdbId: number, mediaType: 'movie' | 'tv' = 'movie'): 'watched' | 'watchlist' | null {
    try {
      const logs = this.getMovieLogs();
      const log = logs.find(log => log.tmdbId === tmdbId && log.mediaType === mediaType);
      return log ? log.type : null;
    } catch (error) {
      console.error('Error getting log status by tmdbId:', error);
      return null;
    }
  }

  static getMovieLogsByType(type: 'watched' | 'watchlist'): MovieLog[] {
    const logs = this.getMovieLogs();
    return logs.filter(log => log.type === type);
  }

  // User Preferences Operations
  static getUserPreferences(): UserPreferences {
    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return prefs ? JSON.parse(prefs) : {
        favoriteGenres: [],
        darkMode: true,
        language: 'tr',
        defaultView: 'watched'
      };
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return {
        favoriteGenres: [],
        darkMode: true,
        language: 'tr',
        defaultView: 'watched'
      };
    }
  }

  static saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  // User Profile Operations
  static getUserProfile(): UserProfile | null {
    try {
      const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!profile) return null;
      
      const parsedProfile = JSON.parse(profile);
      
      // Mevcut profilleri yeni formata migrate et
      return {
        ...parsedProfile,
        watchedMovieCount: parsedProfile.watchedMovieCount || 0,
        watchedTvCount: parsedProfile.watchedTvCount || 0,
        totalEpisodesWatched: parsedProfile.totalEpisodesWatched || 0,
        totalWatchTimeMinutes: parsedProfile.totalWatchTimeMinutes || 0,
        badges: parsedProfile.badges || this.getBadgeTemplates(),
        earnedBadgeCount: parsedProfile.earnedBadgeCount || 0,
      };
    } catch (error) {
      console.error('Error reading user profile:', error);
      return null;
    }
  }

  static createUserProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'watchedCount' | 'watchlistCount' | 'watchedMovieCount' | 'watchedTvCount' | 'totalEpisodesWatched' | 'totalWatchTimeMinutes' | 'badges' | 'earnedBadgeCount'>): UserProfile {
    try {
      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        ...profileData,
        id: this.generateId(),
        watchedCount: 0,
        watchlistCount: 0,
        watchedMovieCount: 0,
        watchedTvCount: 0,
        totalEpisodesWatched: 0,
        totalWatchTimeMinutes: 0,
        badges: this.getBadgeTemplates(),
        earnedBadgeCount: 0,
        createdAt: now,
        updatedAt: now
      };

      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
      return newProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  static updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): UserProfile | null {
    try {
      const profile = this.getUserProfile();
      
      if (!profile) {
        console.error('User profile not found');
        return null;
      }

      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  static updateProfileStats(): void {
    try {
      const profile = this.getUserProfile();
      if (!profile) return;

      const logs = this.getMovieLogs();
      const watchedLogs = logs.filter(log => log.type === 'watched');
      const watchlistLogs = logs.filter(log => log.type === 'watchlist');
      
      // Temel sayımlar
      const watchedCount = watchedLogs.length;
      const watchlistCount = watchlistLogs.length;
      
      // Detaylı istatistikler
      const watchedMovieCount = watchedLogs.filter(log => log.mediaType === 'movie').length;
      const watchedTvCount = watchedLogs.filter(log => log.mediaType === 'tv').length;
      
      // Toplam bölüm sayısı (diziler için)
      const totalEpisodesWatched = watchedLogs
        .filter(log => log.mediaType === 'tv')
        .reduce((total, log) => total + (log.episodeCount || 0), 0);
      
      // Toplam izleme süresi (dakika cinsinden)
      // Film için ortalama 120 dakika, dizi bölümü için ortalama 45 dakika varsayalım
      const totalWatchTimeMinutes = watchedLogs.reduce((total, log) => {
        if (log.runtime) {
          return total + log.runtime;
        } else if (log.mediaType === 'movie') {
          return total + 120; // Ortalama film süresi
        } else if (log.mediaType === 'tv' && log.episodeCount) {
          return total + (log.episodeCount * 45); // Ortalama bölüm süresi
        }
        return total;
      }, 0);

      // Profil istatistiklerini güncelle
      this.updateUserProfile({
        watchedCount,
        watchlistCount,
        watchedMovieCount,
        watchedTvCount,
        totalEpisodesWatched,
        totalWatchTimeMinutes
      });

      // Rozetleri kontrol et ve ödüllendir
      this.checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating profile stats:', error);
    }
  }

  // Süre formatını düzenleyen yardımcı fonksiyon
  static formatWatchTime(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days} Gün ${hours} Saat ${minutes} Dakika`;
    } else if (hours > 0) {
      return `${hours} Saat ${minutes} Dakika`;
    } else {
      return `${minutes} Dakika`;
    }
  }

  // Rozet sistemi
  static getBadgeTemplates(): Badge[] {
    return [
      {
        id: 'first-movie',
        name: 'Çaylak Yönetmen',
        description: 'İlk filmini eklediğinde kazanılır',
        icon: '🎬',
        category: 'milestone',
        requirement: 1,
        isEarned: false
      },
      {
        id: 'comedy-expert',
        name: 'Komedi Uzmanı',
        description: '25 komedi filmi izlediğinde kazanılır',
        icon: '🎭',
        category: 'genre',
        requirement: 25,
        isEarned: false
      },
      {
        id: 'drama-expert',
        name: 'Drama Maestrosu',
        description: '25 drama filmi izlediğinde kazanılır',
        icon: '�',
        category: 'genre',
        requirement: 25,
        isEarned: false
      },
      {
        id: 'action-expert',
        name: 'Aksiyon Kahramanı',
        description: '25 aksiyon filmi izlediğinde kazanılır',
        icon: '⚡',
        category: 'genre',
        requirement: 25,
        isEarned: false
      },
      {
        id: 'series-killer',
        name: 'Dizi Avcısı',
        description: 'Bir dizinin tüm sezonlarını bitirdiğinde kazanılır',
        icon: '📺',
        category: 'special',
        requirement: 1,
        isEarned: false
      },
      {
        id: 'nostalgia-traveler',
        name: 'Nostalji Yolcusu',
        description: '1990 öncesi 10 film izlediğinde kazanılır',
        icon: '�️',
        category: 'time',
        requirement: 10,
        isEarned: false
      },
      {
        id: 'marathon-runner',
        name: 'Sinema Maratoncusu',
        description: 'Bir günde 3\'ten fazla film izlediğinde kazanılır',
        icon: '🏃‍♂️',
        category: 'streak',
        requirement: 3,
        isEarned: false
      },
      {
        id: 'century-watcher',
        name: 'Yüzyıl İzleyicisi',
        description: '100 film izlediğinde kazanılır',
        icon: '💯',
        category: 'milestone',
        requirement: 100,
        isEarned: false
      },
      {
        id: 'binge-watcher',
        name: 'Dizi Bağımlısı',
        description: '50 dizi bölümü izlediğinde kazanılır',
        icon: '📱',
        category: 'milestone',
        requirement: 50,
        isEarned: false
      },
      {
        id: 'time-traveler',
        name: 'Zaman Efendisi',
        description: 'Toplam 100 saat içerik izlediğinde kazanılır',
        icon: '⏰',
        category: 'time',
        requirement: 6000, // 100 saat = 6000 dakika
        isEarned: false
      },
      {
        id: 'critic-master',
        name: 'Eleştirmen Usta',
        description: '50 film için yorum yazıldığında kazanılır',
        icon: '✍️',
        category: 'special',
        requirement: 50,
        isEarned: false
      },
      {
        id: 'collector',
        name: 'Koleksiyoncu',
        description: 'İzleme listesinde 25 film biriktirildiğinde kazanılır',
        icon: '🗃️',
        category: 'milestone',
        requirement: 25,
        isEarned: false
      }
    ];
  }

  // Tamamlanan dizileri bulan yardımcı fonksiyon
  private static getCompletedSeries(watchedLogs: MovieLog[]): string[] {
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
    
    // Tüm sezonları izlenen dizileri döndür
    return Array.from(seriesGroups.entries())
      .filter(([_, series]) => series.watchedSeasons.size >= series.totalSeasons)
      .map(([seriesId, _]) => seriesId);
  }

  // Bir günde 3+ film izleme kontrolü
  private static hasMarathonDay(watchedLogs: MovieLog[]): boolean {
    const dailyCounts = new Map<string, number>();
    
    watchedLogs
      .filter(log => log.mediaType === 'movie')
      .forEach(log => {
        const date = log.date.split('T')[0]; // Sadece tarih kısmını al
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
      });
    
    // Herhangi bir günde 3+ film var mı?
    return Array.from(dailyCounts.values()).some(count => count >= 3);
  }

  static checkAndAwardBadges(): Badge[] {
    try {
      const profile = this.getUserProfile();
      if (!profile) return [];

      const logs = this.getMovieLogs();
      const watchedLogs = logs.filter(log => log.type === 'watched');
      const badgeTemplates = this.getBadgeTemplates();
      const newlyEarnedBadges: Badge[] = [];

      // Mevcut rozetleri al (eğer yoksa boş array)
      const currentBadges = profile.badges || [];

      badgeTemplates.forEach(template => {
        const existingBadge = currentBadges.find(badge => badge.id === template.id);
        
        if (!existingBadge || !existingBadge.isEarned) {
          let shouldEarn = false;

          switch (template.id) {
            case 'first-movie':
              shouldEarn = profile.watchedMovieCount >= 1;
              break;
            
            case 'comedy-expert':
              // Komedi filmlerini say
              const comedyCount = watchedLogs.filter(log => 
                log.mediaType === 'movie' && 
                log.genres && 
                log.genres.some(genre => 
                  genre.toLowerCase().includes('komedi') || 
                  genre.toLowerCase().includes('comedy')
                )
              ).length;
              shouldEarn = comedyCount >= 25;
              break;
            
            case 'drama-expert':
              // Drama filmlerini say
              const dramaCount = watchedLogs.filter(log => 
                log.mediaType === 'movie' && 
                log.genres && 
                log.genres.some(genre => 
                  genre.toLowerCase().includes('drama') || 
                  genre.toLowerCase().includes('dram')
                )
              ).length;
              shouldEarn = dramaCount >= 25;
              break;
            
            case 'action-expert':
              // Aksiyon filmlerini say
              const actionCount = watchedLogs.filter(log => 
                log.mediaType === 'movie' && 
                log.genres && 
                log.genres.some(genre => 
                  genre.toLowerCase().includes('aksiyon') || 
                  genre.toLowerCase().includes('action')
                )
              ).length;
              shouldEarn = actionCount >= 25;
              break;
            
            case 'series-killer':
              // Tamamlanan dizileri kontrol et
              const completedSeries = this.getCompletedSeries(watchedLogs);
              shouldEarn = completedSeries.length >= 1;
              break;
            
            case 'nostalgia-traveler':
              // 1990 öncesi filmleri say
              const oldMoviesCount = watchedLogs.filter(log => 
                log.mediaType === 'movie' && 
                log.releaseYear && 
                log.releaseYear < 1990
              ).length;
              shouldEarn = oldMoviesCount >= 10;
              break;
            
            case 'marathon-runner':
              // Bir günde 3+ film kontrolü
              const hasMarathonDay = this.hasMarathonDay(watchedLogs);
              shouldEarn = hasMarathonDay;
              break;
            
            case 'century-watcher':
              shouldEarn = profile.watchedMovieCount >= 100;
              break;
            
            case 'binge-watcher':
              shouldEarn = profile.totalEpisodesWatched >= 50;
              break;
            
            case 'time-traveler':
              shouldEarn = profile.totalWatchTimeMinutes >= 6000; // 100 saat
              break;
            
            case 'critic-master':
              // Yorum yazılan film sayısı
              const reviewedMoviesCount = watchedLogs.filter(log => 
                log.review && log.review.trim().length > 0
              ).length;
              shouldEarn = reviewedMoviesCount >= 50;
              break;
            
            case 'collector':
              // İzleme listesindeki film sayısı
              const watchlistCount = logs.filter(log => log.type === 'watchlist').length;
              shouldEarn = watchlistCount >= 25;
              break;
          }

          if (shouldEarn) {
            const earnedBadge: Badge = {
              ...template,
              isEarned: true,
              earnedAt: new Date().toISOString()
            };
            
            newlyEarnedBadges.push(earnedBadge);
          }
        }
      });

      // Profildeki rozetleri güncelle
      if (newlyEarnedBadges.length > 0) {
        const updatedBadges = [...currentBadges];
        
        newlyEarnedBadges.forEach(newBadge => {
          const existingIndex = updatedBadges.findIndex(badge => badge.id === newBadge.id);
          if (existingIndex >= 0) {
            updatedBadges[existingIndex] = newBadge;
          } else {
            updatedBadges.push(newBadge);
          }
        });

        // Henüz kazanılmamış rozetleri de ekle
        badgeTemplates.forEach(template => {
          if (!updatedBadges.find(badge => badge.id === template.id)) {
            updatedBadges.push(template);
          }
        });

        const earnedCount = updatedBadges.filter(badge => badge.isEarned).length;

        this.updateUserProfile({
          badges: updatedBadges,
          earnedBadgeCount: earnedCount
        });
      } else if (currentBadges.length === 0) {
        // İlk kez rozet sistemi kuruluyorsa tüm şablonları ekle
        this.updateUserProfile({
          badges: badgeTemplates,
          earnedBadgeCount: 0
        });
      }

      return newlyEarnedBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  // Active Tab Operations
  static getLastActiveTab(): 'watched' | 'watchlist' {
    try {
      const tab = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_TAB);
      return (tab as 'watched' | 'watchlist') || 'watched';
    } catch (error) {
      console.error('Error reading last active tab:', error);
      return 'watched';
    }
  }

  static saveLastActiveTab(tab: 'watched' | 'watchlist'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TAB, tab);
    } catch (error) {
      console.error('Error saving last active tab:', error);
    }
  }

  // Storage Management
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  static getStorageSize(): string {
    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return '0 KB';
    }
  }

  // Data Export/Import for backup
  static exportData(): string {
    try {
      const data = {
        movieLogs: this.getMovieLogs(),
        userPreferences: this.getUserPreferences(),
        userProfile: this.getUserProfile(),
        lastActiveTab: this.getLastActiveTab(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.movieLogs) {
        localStorage.setItem(STORAGE_KEYS.MOVIE_LOGS, JSON.stringify(data.movieLogs));
      }
      
      if (data.userPreferences) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.userPreferences));
      }

      if (data.userProfile) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.userProfile));
      }
      
      if (data.lastActiveTab) {
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TAB, data.lastActiveTab);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default LocalStorageService;
