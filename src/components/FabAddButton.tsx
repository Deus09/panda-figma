import React, { useState } from 'react';
import AddButtonModal from './AddButtonModal';
import CastSelectionModal from './CastSelectionModal';
import CastChatModal from './CastChatModal';
import ToastNotification from './ToastNotification';
import { chatWithCast } from '../services/gemini';
import { MovieLog } from '../services/localStorage';

interface FabAddButtonProps {
  onAddMovieLog?: (log: Omit<MovieLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const FabAddButton: React.FC<FabAddButtonProps> = ({ onAddMovieLog }) => {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    // Toast mesajını göster
    setShowToast(true);
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
        className="fixed bottom-[120px] right-[20px] w-[56px] h-[56px] rounded-full bg-[#FE7743] flex items-center justify-center shadow-[0_8px_24px_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.2)] z-50 hover:bg-[#e66a3a] transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={() => setOpen(true)}
        aria-label="Add"
      >
        {/* Plus Icon */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-white"
        >
          <path 
            d="M12 5v14m-7-7h14" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
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
      {/* Toast Notification */}
      <ToastNotification
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        messageKey="toast.movie_added"
        messageParams={selectedMovie ? { title: selectedMovie.title } : { title: 'Film' }}
        type="success"
        duration={3000}
      />
      {/* Cast Selection Modal */}
      {tmdbId && tmdbId > 0 && (
        <CastSelectionModal
          open={showCastSelection}
          onClose={handleCloseCastSelection}
          movieId={tmdbId}
          movieTitle={selectedMovie?.title || ''}
          onCastSelect={handleCastSelect}
        />
      )}
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