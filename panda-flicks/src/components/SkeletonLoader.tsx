import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'poster' | 'text' | 'circle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  count = 1 
}) => {
  const baseClasses = `bg-gray-700 animate-pulse rounded ${className}`;
  
  const renderSkeleton = () => {
    switch (type) {
      case 'poster':
        return (
          <div className={`${baseClasses} w-[90px] h-[135px] rounded-[10px]`}>
            <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-700 rounded-[10px]"></div>
          </div>
        );
      
      case 'card':
        return (
          <div className={`${baseClasses} w-[357px] h-[158px] rounded-[16px] p-4`}>
            <div className="flex gap-5">
              <div className="w-[72px] h-[108px] bg-gray-600 rounded-[12px]"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                <div className="space-y-1 mt-2">
                  <div className="h-3 bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-600 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-600 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'circle':
        return (
          <div className={`${baseClasses} rounded-full ${width} ${height}`}></div>
        );
      
      case 'text':
      default:
        return (
          <div className={`${baseClasses} ${width} ${height}`}></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="mb-3">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
