import React, { useState, useEffect } from 'react';
import { IonContent, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent, IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { 
  getMovieReviews, 
  getPopularMoviesWithReviews, 
  getSeriesReviews,
  getPopularSeriesWithReviews,
  TMDBReview, 
  TMDBMovieResult, 
  searchAll, 
  TMDBSearchResult 
} from '../services/tmdb';

interface ReviewsTabSegmentProps {
  className?: string;
}

interface FilterState {
  searchQuery: string;
  mediaType: 'all' | 'movie' | 'tv';
}

const ReviewsTabSegment: React.FC<ReviewsTabSegmentProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [allReviews, setAllReviews] = useState<TMDBReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<TMDBReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    mediaType: 'all'
  });
  const [suggestions, setSuggestions] = useState<TMDBSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<TMDBSearchResult | null>(null);
  const [showFullReviewModal, setShowFullReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<TMDBReview | null>(null);

  // Popular filmleri ve dizileri yükle ve yorumlarını çek
  useEffect(() => {
    loadInitialReviews();
  }, []);

  // Filtreleme uygula
  useEffect(() => {
    applyFilters();
  }, [allReviews, filter]);

  const loadInitialReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const [popularMovies, popularSeries] = await Promise.all([
        getPopularMoviesWithReviews(),
        getPopularSeriesWithReviews()
      ]);
      
      const allReviewsData: TMDBReview[] = [];
      
      // İlk 10 popüler filmin yorumlarını çek (2 sayfa)
      for (let i = 0; i < Math.min(10, popularMovies.length); i++) {
        try {
          // İlk sayfa
          const response1 = await getMovieReviews(popularMovies[i].id, 1);
          console.log(`Movie "${popularMovies[i].title}" page 1 has ${response1.results.length} reviews`);
          
          // İkinci sayfa (eğer varsa)
          let response2 = null;
          if (response1.total_pages > 1) {
            response2 = await getMovieReviews(popularMovies[i].id, 2);
            console.log(`Movie "${popularMovies[i].title}" page 2 has ${response2.results.length} reviews`);
          }
          
          // Her yoruma film bilgisini ekle
          const allMovieReviews = [
            ...response1.results,
            ...(response2 ? response2.results : [])
          ];
          
          const reviewsWithMovieInfo = allMovieReviews.map(review => ({
            ...review,
            movieInfo: {
              id: popularMovies[i].id,
              title: popularMovies[i].title,
              poster_path: popularMovies[i].poster_path,
              mediaType: 'movie' as const
            }
          }));
          allReviewsData.push(...reviewsWithMovieInfo);
        } catch (err) {
          console.error(`Error loading reviews for ${popularMovies[i].title}:`, err);
        }
      }

      // İlk 10 popüler dizinin yorumlarını çek (2 sayfa)
      for (let i = 0; i < Math.min(10, popularSeries.length); i++) {
        try {
          // İlk sayfa
          const response1 = await getSeriesReviews(popularSeries[i].id, 1);
          console.log(`Series "${popularSeries[i].title}" page 1 has ${response1.results.length} reviews`);
          
          // İkinci sayfa (eğer varsa)
          let response2 = null;
          if (response1.total_pages > 1) {
            response2 = await getSeriesReviews(popularSeries[i].id, 2);
            console.log(`Series "${popularSeries[i].title}" page 2 has ${response2.results.length} reviews`);
          }
          
          // Her yoruma dizi bilgisini ekle
          const allSeriesReviews = [
            ...response1.results,
            ...(response2 ? response2.results : [])
          ];
          
          const reviewsWithSeriesInfo = allSeriesReviews.map(review => ({
            ...review,
            movieInfo: {
              id: popularSeries[i].id,
              title: popularSeries[i].title,
              poster_path: popularSeries[i].poster_path,
              mediaType: 'tv' as const
            }
          }));
          allReviewsData.push(...reviewsWithSeriesInfo);
        } catch (err) {
          console.error(`Error loading reviews for ${popularSeries[i].title}:`, err);
        }
      }
      
      // Yorumları tarihe göre sırala (en yeni önce)
      const sortedReviews = allReviewsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      console.log(`Total reviews loaded: ${sortedReviews.length}`);
      console.log('Reviews by type:', {
        movies: sortedReviews.filter(r => r.movieInfo?.mediaType === 'movie').length,
        tv: sortedReviews.filter(r => r.movieInfo?.mediaType === 'tv').length
      });
      
      setAllReviews(sortedReviews);
      setFilteredReviews(sortedReviews);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading initial reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allReviews];

    // Arama filtresi
    if (filter.searchQuery.trim()) {
      filtered = filtered.filter(review => 
        review.movieInfo?.title?.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
        review.author.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(filter.searchQuery.toLowerCase())
      );
    }

    // Media type filtresi
    if (filter.mediaType !== 'all') {
      filtered = filtered.filter(review => 
        review.movieInfo?.mediaType === filter.mediaType
      );
    }

    setFilteredReviews(filtered);
  };

  const handleSearch = async (query: string) => {
    if (query.length >= 3) {
      setSearchLoading(true);
      try {
        const response = await searchAll(query);
        const combined = [...response.movies, ...response.series];
        setSuggestions(combined);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleContentSelect = async (content: TMDBSearchResult) => {
    setSelectedContent(content);
    setFilter(prev => ({ ...prev, searchQuery: content.title || content.name || '' }));
    setSuggestions([]);
    
    // Seçilen içeriğin yorumlarını çek
    try {
      let response;
      if (content.media_type === 'movie') {
        response = await getMovieReviews(content.id, 1);
      } else if (content.media_type === 'tv') {
        response = await getSeriesReviews(content.id, 1);
      } else {
        return; // Person için yorum yok
      }

      const reviewsWithContentInfo = response.results.map(review => ({
        ...review,
        movieInfo: {
          id: content.id,
          title: content.title || content.name || '',
          poster_path: content.poster_path,
          mediaType: content.media_type === 'movie' ? 'movie' : 'tv'
        }
      }));
      
      // Yeni yorumları mevcut listeye ekle ve sırala
      const updatedReviews = [...allReviews, ...reviewsWithContentInfo].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setAllReviews(updatedReviews);
    } catch (err) {
      console.error('Error loading reviews for selected content:', err);
    }
  };

  const handleLoadMore = async (event: CustomEvent<void>) => {
    // Burada daha fazla yorum yüklenebilir
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const clearFilters = () => {
    setFilter({
      searchQuery: '',
      mediaType: 'all'
    });
    setSelectedContent(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <IonSpinner name="crescent" />
        <span className="ml-2 text-muted-foreground">{t('social.loading_reviews')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          {t('social.try_again')}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('social.all_reviews')}</h3>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          {t('social.filter')}
        </button>
      </div>

      {/* Active Filters Display */}
      {(filter.searchQuery || filter.mediaType !== 'all') && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-muted-foreground">{t('social.active_filters')}</span>
          {filter.searchQuery && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              Search: {filter.searchQuery}
            </span>
          )}
          {filter.mediaType !== 'all' && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              Type: {filter.mediaType === 'movie' ? t('social.movies') : t('social.tv_shows')}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
          >
            {t('social.clear')}
          </button>
        </div>
      )}

      {/* Reviews Section */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {filter.searchQuery || filter.mediaType !== 'all' 
              ? t('social.no_reviews_match') 
              : t('social.no_reviews')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl p-4 shadow-lg border border-border">
              {/* Movie/Series Info */}
              {review.movieInfo && (
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-border">
                  {review.movieInfo.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${review.movieInfo.poster_path}`}
                      alt={review.movieInfo.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-muted-foreground text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-card-foreground text-base leading-tight mb-1">{review.movieInfo.title}</h4>
                    <p className="text-xs text-muted-foreground capitalize font-medium">{review.movieInfo.mediaType}</p>
                  </div>
                </div>
              )}

              {/* Review Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {review.author_details.avatar_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`}
                        alt={review.author}
                        className="w-12 h-12 rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-muted-foreground font-bold text-lg">
                          {review.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-card-foreground text-base">{review.author}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  {review.author_details.rating && (
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span className="text-sm font-bold text-card-foreground">{review.author_details.rating}/10</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-card-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                  {truncateText(review.content)}
                </div>
                
                {review.content.length > 200 && (
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setShowFullReviewModal(true);
                    }}
                    className="inline-flex items-center gap-2 mt-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                  >
                    <span>{t('social.read_full_review')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* Infinite Scroll */}
          <IonInfiniteScroll onIonInfinite={handleLoadMore}>
            <IonInfiniteScrollContent
              loadingSpinner="crescent"
              loadingText={t('social.loading_reviews')}
            />
          </IonInfiniteScroll>
        </div>
      )}

      {/* Inline Bottom Filter Modal */}
      <IonModal 
        isOpen={showFilterModal} 
        onDidDismiss={() => setShowFilterModal(false)}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.4, 0.5, 0.7]}
        className="filter-modal"
      >
        {/* Ana Modal Container - Dark Theme */}
        <div className="bg-[#1a1a1a] text-gray-100 h-full rounded-t-[20px] relative">
          {/* Pull Indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              {t('social.clear_filters')}
            </button>
            <h2 className="text-lg font-semibold text-gray-100">
              {t('social.filter_reviews')}
            </h2>
            <button 
              onClick={() => setShowFilterModal(false)}
              className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-4 py-4 space-y-5">
            {/* Search Input */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                {t('social.search_content')}
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={filter.searchQuery}
                  onChange={(e) => {
                    setFilter(prev => ({ ...prev, searchQuery: e.target.value }));
                    handleSearch(e.target.value);
                  }}
                  placeholder={t('social.search_placeholder')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <IonSpinner name="crescent" />
                  </div>
                )}
              </div>
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-2 border border-gray-600 rounded-lg max-h-48 overflow-y-auto bg-gray-800">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleContentSelect(item)}
                    >
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w45${item.poster_path}` : 'https://placehold.co/40x60?text=No+Image'}
                        alt={item.title || item.name}
                        className="w-10 h-15 object-cover rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-100">{item.title || item.name}</span>
                        <span className="text-xs text-gray-400 block capitalize">{item.media_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media Type Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                {t('social.content_type')}
              </h3>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: t('social.all') },
                  { value: 'movie', label: t('social.movies') },
                  { value: 'tv', label: t('social.tv_shows') }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilter(prev => ({ ...prev, mediaType: type.value as any }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter.mediaType === type.value
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 pb-4">
            <button 
              onClick={() => setShowFilterModal(false)}
              className="w-full py-3 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
            >
              {t('social.apply_filters')}
            </button>
          </div>
        </div>
      </IonModal>

      {/* Full Review Modal */}
      <IonModal 
        isOpen={showFullReviewModal} 
        onDidDismiss={() => setShowFullReviewModal(false)}
        initialBreakpoint={0.7}
        breakpoints={[0, 0.5, 0.7, 0.9]}
        className="full-review-modal"
      >
        {/* Ana Modal Container - Dark Theme */}
        <div className="bg-[#1a1a1a] text-gray-100 h-full rounded-t-[20px] relative">
          {/* Pull Indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {selectedReview?.movieInfo?.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w45${selectedReview.movieInfo.poster_path}`}
                  alt={selectedReview.movieInfo.title}
                  className="w-12 h-18 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-100">{selectedReview?.movieInfo?.title}</h2>
                <p className="text-xs text-gray-400 capitalize">{selectedReview?.movieInfo?.mediaType}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowFullReviewModal(false)}
              className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-4 py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {selectedReview && (
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedReview.author_details.avatar_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${selectedReview.author_details.avatar_path}`}
                        alt={selectedReview.author}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {selectedReview.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-100 text-lg">{selectedReview.author}</h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(selectedReview.created_at)}
                      </p>
                    </div>
                  </div>
                  {selectedReview.author_details.rating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500 text-xl">★</span>
                      <span className="text-lg font-medium text-gray-100">{selectedReview.author_details.rating}/10</span>
                    </div>
                  )}
                </div>

                {/* Full Review Content */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {selectedReview.content}
                  </div>
                </div>

                {/* Original Review Link */}
                <div className="text-center pt-4 border-t border-gray-700">
                                     <a
                     href={selectedReview.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 text-sm"
                   >
                     <span>{t('social.view_original_review')}</span>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                     </svg>
                   </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default ReviewsTabSegment; 