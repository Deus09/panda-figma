// localStorage verilerini kontrol et
const logs = JSON.parse(localStorage.getItem('cinenar-movie-logs') || '[]');
console.log('Total logs:', logs.length);
console.log('TV logs:');
logs.filter(log => log.mediaType === 'tv').forEach(log => {
  console.log({
    title: log.title,
    tmdbId: log.tmdbId,
    seriesId: log.seriesId,
    episodeId: log.episodeId,
    seasonNumber: log.seasonNumber,
    episodeNumber: log.episodeNumber
  });
});
