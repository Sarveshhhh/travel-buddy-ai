import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface HoverImageTriggerProps {
  keyword: string;
  children: React.ReactNode;
  className?: string;
}

const HoverImageTrigger: React.FC<HoverImageTriggerProps> = ({ keyword, children, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Using Pollinations.ai for dynamic image generation based on keyword
  // Adding "scenery" or "food" context helps getting better results, but raw keyword is usually best for general purpose
  const imgSrc = `https://image.pollinations.ai/prompt/photorealistic ${encodeURIComponent(keyword)}?width=400&height=300&nologo=true&seed=${Math.floor(Math.random() * 100)}`;

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      <span className="cursor-help decoration-dashed underline decoration-indigo-300 underline-offset-4 decoration-2 hover:text-indigo-600 hover:decoration-indigo-600 transition-all">
        {children}
      </span>
      
      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden relative flex items-center justify-center">
            {!imgLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Generating View...</span>
                </div>
            )}
            <img 
              src={imgSrc} 
              alt={keyword}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
          <p className="text-xs text-center text-gray-500 mt-2 font-medium capitalize truncate px-2">{keyword}</p>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-100"></div>
        </div>
      )}
    </div>
  );
};

export default HoverImageTrigger;
