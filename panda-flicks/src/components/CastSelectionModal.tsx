import React, { useState, useEffect } from 'react';
import { TMDBCastMember, getMovieCast } from '../services/tmdb';

interface CastSelectionModalProps {
  open: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
  onCastSelect: (cast: TMDBCastMember) => void;
}

const CastSelectionModal: React.FC<CastSelectionModalProps> = ({
  open,
  onClose,
  movieId,
  movieTitle,
  onCastSelect
}) => {
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && movieId) {
      fetchCast();
    }
  }, [open, movieId]);

  const fetchCast = async () => {
    setLoading(true);
    setError(null);
    try {
      const castData = await getMovieCast(movieId);
      setCast(castData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cast members';
      setError(errorMessage);
      console.error('Error fetching cast:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCastSelect = (castMember: TMDBCastMember) => {
    onCastSelect(castMember);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-[#222] rounded-[16px] shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] p-6 w-[90vw] max-w-[350px] max-h-[80vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-poppins text-[18px] font-semibold">Chat with Cast</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white hover:text-[#FE7743] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Movie Title */}
        <p className="text-[#EFEEEA] font-poppins text-[14px] mb-4 text-center">{movieTitle}</p>

        {/* Cast List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE7743]"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8 font-poppins">{error}</div>
          ) : cast.length === 0 ? (
            <div className="text-[#EFEEEA] text-center py-8 font-poppins">No cast members found</div>
          ) : (
            <div className="space-y-3">
              {cast.map((castMember) => (
                <button
                  key={castMember.id}
                  onClick={() => handleCastSelect(castMember)}
                  className="w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#333] hover:bg-[#444] transition-colors duration-200"
                >
                  {/* Cast Member Photo */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#555] flex-shrink-0">
                    {castMember.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${castMember.profile_path}`}
                        alt={castMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        {castMember.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Cast Member Info */}
                  <div className="flex-1 text-left">
                    <p className="text-white font-poppins text-[14px] font-semibold">{castMember.name}</p>
                    <p className="text-[#EFEEEA] font-poppins text-[12px]">as {castMember.character}</p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE7743" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CastSelectionModal; 