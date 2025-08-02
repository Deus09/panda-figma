export const mockMovies = [
  {
    id: 1,
    title: 'Breaking Bad',
    overview: 'A high school chemistry teacher turned methamphetamine manufacturer.',
    poster_path: '/test-poster-1.jpg',
    vote_average: 9.5,
    release_date: '2008-01-20',
    media_type: 'tv'
  },
  {
    id: 2,
    title: 'Game of Thrones',
    overview: 'Nine noble families fight for control over the lands of Westeros.',
    poster_path: '/test-poster-2.jpg',
    vote_average: 9.3,
    release_date: '2011-04-17',
    media_type: 'tv'
  }
];

export const mockCast = [
  {
    id: 1,
    name: 'Bryan Cranston',
    character: 'Walter White',
    profile_path: '/test-actor-1.jpg'
  },
  {
    id: 2,
    name: 'Aaron Paul',
    character: 'Jesse Pinkman',
    profile_path: '/test-actor-2.jpg'
  }
];

export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/test-avatar.jpg'
};

export const mockLocalStorageData = {
  'user-preferences': {
    language: 'tr',
    theme: 'dark',
    notifications: true
  },
  'watchlist': [
    { id: 1, title: 'Breaking Bad', addedAt: '2024-01-01T00:00:00Z' }
  ]
}; 