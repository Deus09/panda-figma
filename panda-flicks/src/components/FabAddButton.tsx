import React, { useState } from 'react';
import fabAdd from '../assets/fab-add.svg';
import AddButtonModal from './AddButtonModal';

interface FabAddButtonProps {
  onAddMovieLog?: (log: any) => void;
}

const FabAddButton: React.FC<FabAddButtonProps> = ({ onAddMovieLog }) => {
  const [open, setOpen] = useState(false);
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
      <AddButtonModal open={open} onClose={() => setOpen(false)} onSave={() => setOpen(false)} onAddMovieLog={onAddMovieLog} />
    </>
  );
};
export default FabAddButton; 