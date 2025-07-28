import React, { useState } from 'react';
import fabAdd from '../assets/fab-add.svg';
import AddButtonModal from './AddButtonModal';
import CastSelectionModal from './CastSelectionModal';
import CastChatModal from './CastChatModal';
import { chatWithCast } from '../services/gemini';
import { MovieLog } from '../services/localStorage';

interface FabAddButtonProps {
  onAddMovieLog?: (log: Omit<MovieLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const FabAddButton: React.FC<FabAddButtonProps> = ({ onAddMovieLog }) => {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cast/chat state
  const [showCastSelection, setShowCastSelection] = useState(false);
  const [showCastChat, setShowCastChat] = useState(false);
  const [selectedCastMember, setSelectedCastMember] = useState<any>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);

  // AddButtonModal'dan seçilen movie bilgisini al
  const handleMovieSelect = (movie: any, id: number) => {
    setSelectedMovie(movie);
    setTmdbId(id);
  };

  const handleSave = (movie?: any, id?: number) => {
    setOpen(false);
    if (movie && id) {
      setSelectedMovie(movie);
      setTmdbId(id);
    }
    // 0.5sn sonra toast'u göster
    const toastDelay = setTimeout(() => {
      setShowToast(true);
      // 5sn sonra toast'u kapat
      const timeout = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      setToastTimeout(timeout);
    }, 500);
    setToastTimeout(toastDelay);
  };

  const handleChatWithCast = () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      setToastTimeout(null);
    }
    setShowToast(false);
    setShowCastSelection(true);
  };

  const handleCastSelect = (castMember: any) => {
    setSelectedCastMember(castMember);
    setShowCastChat(true);
  };

  const handleCloseCastSelection = () => {
    setShowCastSelection(false);
  };

  const handleCloseCastChat = () => {
    setShowCastChat(false);
    setSelectedCastMember(null);
  };

  return (
    <>
      <button
        className="fixed bottom-[110px] right-[20px] w-[56px] h-[56px] rounded-full bg-[#FE7743] flex items-center justify-center shadow-[0_8px_24px_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.2)] z-50"
        style={{ boxShadow: '0px 8px 24px 0px rgba(0,0,0,0.15), 0px 2px 4px 0px rgba(0,0,0,0.2)' }}
        aria-label="Add"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center justify-center w-[24px] h-[24px] bg-white rounded" style={{ background: '#fff' }}>
          <img src={fabAdd} alt="Add" className="w-[24px] h-[24px]" style={{ filter: 'invert(98%) sepia(1%) saturate(0%) hue-rotate(180deg) brightness(110%)' }} />
        </span>
      </button>
      <AddButtonModal 
        open={open} 
        onClose={() => setOpen(false)} 
        onSave={(log?: any) => {
          if (log && log.selectedMovie && log.tmdbId) {
            handleSave(log.selectedMovie, log.tmdbId);
          } else {
            handleSave();
          }
        }}
        onAddMovieLog={onAddMovieLog}
        onMovieSelect={handleMovieSelect}
      />
      {/* Success Toast */}
      {showToast && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl">
            <h1 className="text-black text-2xl font-bold mb-4">Success!</h1>
            <p className="text-black mb-4">Your movie has been added successfully.</p>
            <button 
              className="w-full h-[40px] rounded-[12px] bg-[#FE7743] text-white text-[14px] font-poppins font-semibold shadow-lg hover:bg-[#e66a3a] transition-colors duration-200"
              onClick={handleChatWithCast}
            >
              Chat with Cast
            </button>
          </div>
        </div>
      )}
      {/* Cast Selection Modal */}
      <CastSelectionModal
        open={showCastSelection}
        onClose={handleCloseCastSelection}
        movieId={tmdbId || 0}
        movieTitle={selectedMovie?.title || ''}
        onCastSelect={handleCastSelect}
      />
      {/* Cast Chat Modal */}
      {selectedCastMember && (
        <CastChatModal
          open={showCastChat}
          onClose={handleCloseCastChat}
          castMember={selectedCastMember}
          movieTitle={selectedMovie?.title || ''}
          onSendMessage={async (message: string) => {
            if (!selectedCastMember || !selectedMovie) return '';
            return await chatWithCast(message, selectedCastMember, selectedMovie.title);
          }}
        />
      )}
    </>
  );
};
export default FabAddButton; 