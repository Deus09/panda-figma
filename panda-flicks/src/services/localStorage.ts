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
  tmdbId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  darkMode: boolean;
  language: string;
  defaultView: 'watched' | 'watchlist';
}

const STORAGE_KEYS = {
  MOVIE_LOGS: 'panda-flicks-movie-logs',
  USER_PREFERENCES: 'panda-flicks-user-preferences',
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
      return logs ? JSON.parse(logs) : [];
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
