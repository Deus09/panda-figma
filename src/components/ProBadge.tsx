import React from 'react';
import { IonIcon } from '@ionic/react';
import { star, lockClosed } from 'ionicons/icons';

interface ProBadgeProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'lock' | 'text';
  className?: string;
}

const ProBadge: React.FC<ProBadgeProps> = ({ 
  size = 'medium', 
  variant = 'badge',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-1 py-0.5 min-w-[20px] h-5';
      case 'large':
        return 'text-sm px-2 py-1.5 min-w-[32px] h-8';
      default: // medium
        return 'text-xs px-1.5 py-1 min-w-[24px] h-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-6 h-6';
      default: // medium
        return 'w-5 h-5';
    }
  };

  if (variant === 'lock') {
    return (
      <div className={`inline-flex items-center justify-center bg-black bg-opacity-60 rounded-full p-1 ${className}`}>
        <IonIcon 
          icon={lockClosed} 
          className={`text-white ${getIconSize()}`}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`inline-flex items-center text-[#FE7743] font-semibold ${className}`}>
        <IonIcon 
          icon={star} 
          className={getIconSize()}
        />
      </span>
    );
  }

  // Default: badge variant
  return (
    <div className={`
      inline-flex items-center justify-center 
      bg-gradient-to-r from-[#FE7743] to-[#FF6B35] 
      text-white font-bold rounded-full 
      shadow-lg shadow-[#FE7743]/30
      ${getSizeClasses()} 
      ${className}
    `}>
      <IonIcon 
        icon={star} 
        className={getIconSize()}
      />
    </div>
  );
};

export default ProBadge;
