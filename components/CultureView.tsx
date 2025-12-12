import React from 'react';
import { CultureData } from '../types';
import { Utensils, Globe, Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import HoverImageTrigger from './HoverImageTrigger';

interface CultureViewProps {
  data: CultureData | null;
  loading: boolean;
  onExplore: (topic: string, context: string) => void;
}

const CultureView: React.FC<CultureViewProps> = ({ data, loading, onExplore }) => {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-xl"></div>
        <div className="h-48 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!data) return <div className="text-gray-500">No culture data available.</div>;

  return (
    <div className="space-y-8">
      {/* Cuisine Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-orange-50 p-5 border-b border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-xl text-orange-900">Authentic Cuisine</h3>
            </div>
        </div>
        <div className="divide-y divide-gray-50">
            {data.culinaryHighlights.map((dish, idx) => (
                <div key={idx} className="p-5 hover:bg-orange-50/30 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">
                                    <HoverImageTrigger keyword={`${dish.name} dish`}>
                                        {dish.name}
                                    </HoverImageTrigger>
                                </h4>
                                <button 
                                    onClick={() => onExplore(dish.name, "food")}
                                    className="p-1 rounded-full text-orange-400 hover:bg-orange-100 transition-colors"
                                    title="Deep Dive"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-1">{dish.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Traditions & Etiquette Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-5 text-indigo-700">
                <Globe className="w-5 h-5" />
                <h3 className="font-bold text-lg">Local Traditions</h3>
             </div>
             <ul className="space-y-4 flex-1">
                {data.localTraditions.map((trad, idx) => (
                    <li key={idx} className="group">
                         <button 
                            onClick={() => onExplore(trad, "culture")}
                            className="text-left flex gap-3 text-gray-700 hover:text-indigo-700 transition-colors w-full"
                         >
                            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 group-hover:text-indigo-600" />
                            <span className="font-medium group-hover:underline decoration-indigo-200 decoration-2 underline-offset-4">{trad}</span>
                        </button>
                    </li>
                ))}
             </ul>
          </div>

          {/* Etiquette */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-5 text-emerald-700">
                <Heart className="w-5 h-5" />
                <h3 className="font-bold text-lg">Etiquette Tips</h3>
             </div>
             <ul className="space-y-4 flex-1">
                {data.culturalEtiquette.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-emerald-500 font-bold text-lg leading-none">•</span>
                        <span className="font-medium">{tip}</span>
                    </li>
                ))}
             </ul>
          </div>
      </div>
    </div>
  );
};

export default CultureView;
