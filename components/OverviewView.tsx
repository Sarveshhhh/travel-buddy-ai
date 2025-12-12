import React from 'react';
import { LandmarkData } from '../types';
import { Info, MapPin, Sparkles, Tag } from 'lucide-react';

interface OverviewViewProps {
  data: LandmarkData | null;
}

const OverviewView: React.FC<OverviewViewProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Info className="w-6 h-6 text-blue-600" />
          Landmark Overview
        </h3>

        {/* Description Points */}
        <div className="space-y-4 mb-8">
            {data.descriptionPoints && data.descriptionPoints.length > 0 ? (
                data.descriptionPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                         <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                            <Sparkles className="w-4 h-4" />
                         </div>
                         <p className="text-gray-700 leading-relaxed text-lg pt-1 group-hover:text-gray-900 transition-colors">
                            {point}
                         </p>
                    </div>
                ))
            ) : (
                <p className="text-gray-600 leading-relaxed text-lg">{data.description}</p>
            )}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {data.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors cursor-default">
              <Tag className="w-3 h-3 text-gray-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Visual Context Hint */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
         <div>
            <h4 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {data.city}, {data.country}
            </h4>
            <p className="text-blue-100 text-sm mt-1 opacity-90">Explore more about this location in the tabs above.</p>
         </div>
         <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
             <img src={data.imageBase64} alt="Mini preview" className="w-full h-full object-cover" />
         </div>
      </div>
    </div>
  );
};

export default OverviewView;
