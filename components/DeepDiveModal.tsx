import React from 'react';
import { DeepDiveData } from '../types';
import { X, Sparkles, MapPin, Info } from 'lucide-react';

interface DeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DeepDiveData | null;
  loading: boolean;
  topic: string;
}

const DeepDiveModal: React.FC<DeepDiveModalProps> = ({ isOpen, onClose, data, loading, topic }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-center">
            <div>
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" /> AI Deep Dive
                </div>
                <h3 className="text-2xl font-bold text-gray-900 line-clamp-1">{topic}</h3>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    <div className="h-32 bg-gray-200 rounded-xl mt-4"></div>
                </div>
            ) : data ? (
                <>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" /> Key Details
                        </h4>
                        <ul className="space-y-2">
                            {data.details.map((detail, idx) => (
                                <li key={idx} className="text-gray-600 text-sm leading-relaxed flex gap-2">
                                    <span className="text-blue-400 font-bold">•</span> {detail}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {data.stylingTips && data.stylingTips.length > 0 && (
                        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                            <h4 className="font-bold text-purple-900 mb-3 text-sm uppercase">✨ How to Style / Use</h4>
                            <ul className="space-y-2">
                                {data.stylingTips.map((tip, idx) => (
                                    <li key={idx} className="text-purple-800 text-sm">{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data.bestPlaces && data.bestPlaces.length > 0 && (
                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                            <h4 className="font-bold text-orange-900 mb-3 text-sm uppercase flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Where to find it
                            </h4>
                            <ul className="space-y-2">
                                {data.bestPlaces.map((place, idx) => (
                                    <li key={idx} className="text-orange-800 text-sm">{place}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                     {data.relatedInfo && data.relatedInfo.length > 0 && (
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase">More Context</h4>
                            <ul className="space-y-2">
                                {data.relatedInfo.map((info, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm">{info}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-gray-500 py-10">
                    Failed to load information.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DeepDiveModal;
