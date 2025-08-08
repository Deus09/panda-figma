// Environment test file
console.log('Raw import.meta value:', import.meta);
console.log('Import.meta.env:', import.meta.env);
console.log('VITE_TMDB_API_KEY:', import.meta.env.VITE_TMDB_API_KEY);
console.log('Type of VITE_TMDB_API_KEY:', typeof import.meta.env.VITE_TMDB_API_KEY);
