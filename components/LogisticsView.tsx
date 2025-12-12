import React from 'react';
import { LogisticsData } from '../types';
import { Car, Hotel, Star, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

interface LogisticsViewProps {
  data: LogisticsData | null;
  loading: boolean;
  city: string;
}

const LogisticsView: React.FC<LogisticsViewProps> = ({ data, loading, city }) => {
  if (loading) {
     return (
        <div className="space-y-6 animate-pulse">
           <div className="h-32 bg-gray-200 rounded-2xl"></div>
           <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
     );
  }

  if (!data) return <div className="text-gray-500 text-center py-10">No travel info available.</div>;

  const renderHotelSection = (title: string, hotels: any[], iconColor: string) => {
      if (!hotels || hotels.length === 0) return null;
      return (
        <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
               <Star className={`w-4 h-4 ${iconColor}`} fill="currentColor" /> {title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {hotels.map((hotel, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                       <div className="flex justify-between items-start">
                          <h5 className="font-bold text-gray-900">{hotel.name}</h5>
                          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{hotel.rating}</span>
                       </div>
                       <p className="text-xs text-gray-500 mt-2 line-clamp-2">{hotel.description}</p>
                       <a 
                         href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' hotel ' + city)}`}
                         target="_blank" 
                         rel="noreferrer"
                         className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
                       >
                         Check Rates <ExternalLink className="w-3 h-3" />
                       </a>
                   </div>
               ))}
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-8">
       {/* Transport Section */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
             <Car className="w-6 h-6 text-blue-600" /> Getting Around
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-3">🚖 Cabs & Ride Apps</h4>
                  <ul className="space-y-2">
                      {data.cabs.length > 0 ? data.cabs.map((cab, i) => (
                          <li key={i} className="flex items-center gap-2 text-blue-800 text-sm font-medium">
                              <ShieldCheck className="w-4 h-4 text-blue-500" /> {cab}
                          </li>
                      )) : <span className="text-sm text-gray-500">Check local listings.</span>}
                  </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">🚗 Car Rentals</h4>
                   <ul className="space-y-2">
                      {data.rentals.length > 0 ? data.rentals.map((rental, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {rental}
                          </li>
                      )) : <span className="text-sm text-gray-500">Check local listings.</span>}
                  </ul>
              </div>
          </div>
       </div>

       {/* Hotels Section */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
           <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
             <Hotel className="w-6 h-6 text-purple-600" /> Recommended Stays
          </h3>
          
          {renderHotelSection("Luxury Stays", data.hotels.luxury, "text-yellow-400")}
          {renderHotelSection("Comfort & Mid-Range", data.hotels.midRange, "text-gray-400")}
          {renderHotelSection("Budget Friendly", data.hotels.budget, "text-orange-400")}
       </div>
    </div>
  );
};

export default LogisticsView;
