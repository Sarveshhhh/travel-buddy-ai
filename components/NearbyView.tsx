import React from 'react';
import { NearbyPlace } from '../types';
import { MapPin, Clock, Navigation, ExternalLink, ArrowRight } from 'lucide-react';
import HoverImageTrigger from './HoverImageTrigger';

interface NearbyViewProps {
  places: NearbyPlace[] | null;
  loading: boolean;
  city: string;
}

const NearbyView: React.FC<NearbyViewProps> = ({ places, loading, city }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!places || places.length === 0) return <div className="text-gray-500 text-center py-10">No nearby places found.</div>;

  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('food')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (c.includes('park') || c.includes('nature')) return 'bg-green-100 text-green-700 border-green-200';
    if (c.includes('museum') || c.includes('history')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (c.includes('shop')) return 'bg-pink-100 text-pink-700 border-pink-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {places.map((place, idx) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.placeName} ${city}`)}`;

        return (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-gray-900 text-xl leading-tight">
                <HoverImageTrigger keyword={`${place.placeName} ${city} landmark`}>
                    {place.placeName}
                </HoverImageTrigger>
              </h4>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${getCategoryColor(place.category)}`}>
                {place.category}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">{place.shortDescription}</p>
            
            <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
              {/* Info Row */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{place.distanceKm} km</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">~{place.approxTimeMinutes} min</span>
                </div>
              </div>

              {/* Timing & Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{place.openingHours}</span>
                 </div>

                 <a 
                   href={mapsUrl}
                   target="_blank"
                   rel="noreferrer"
                   className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto"
                 >
                   <MapPin className="w-4 h-4" />
                   Directions
                 </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NearbyView;
