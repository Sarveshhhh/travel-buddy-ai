import React, { useState, useEffect } from 'react';
import { ItineraryData, Attraction } from '../types';
import { generateItinerary, fetchTopAttractions } from '../services/geminiService';
import { Clock, CheckCircle, Map, Loader2, Footprints, MapPin, Navigation, Star, Hourglass, Trash2 } from 'lucide-react';
import HoverImageTrigger from './HoverImageTrigger';

interface ItineraryViewProps {
  landmarkName: string;
  city: string;
  country: string;
}

const INTERESTS_LIST = ["History", "Food", "Shopping", "Culture", "Nature", "Art", "Relaxation"];

const ItineraryView: React.FC<ItineraryViewProps> = ({ landmarkName, city, country }) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["History", "Culture"]);
  
  const [attractions, setAttractions] = useState<Attraction[] | null>(null);
  const [loadingAttractions, setLoadingAttractions] = useState(false);

  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  useEffect(() => {
    // Fetch top attractions when component mounts
    setLoadingAttractions(true);
    fetchTopAttractions(city, country)
      .then(setAttractions)
      .catch(console.error)
      .finally(() => setLoadingAttractions(false));
  }, [city, country]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    setLoadingItinerary(true);
    try {
      const result = await generateItinerary(landmarkName, city, startTime, endTime, selectedInterests);
      setItinerary(result);
    } catch (e) {
      console.error(e);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoadingItinerary(false);
    }
  };

  const handleDeleteStep = (indexToRemove: number) => {
      if (!itinerary) return;
      setItinerary({
          ...itinerary,
          steps: itinerary.steps.filter((_, idx) => idx !== indexToRemove)
      });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Top Attractions Catalog (Always Visible First) */}
      {!itinerary && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center gap-2 mb-2">
                 <Map className="w-6 h-6 text-blue-600" />
                 <h3 className="text-xl font-bold text-gray-900">Popular Attractions in {city}</h3>
             </div>
             
             {loadingAttractions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attractions?.map((attraction, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-gray-800 text-lg">
                                    <HoverImageTrigger keyword={`${attraction.name} ${city}`}>
                                        {attraction.name}
                                    </HoverImageTrigger>
                                 </h4>
                                 <span className="flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full">
                                     <Star className="w-3 h-3 fill-yellow-600" /> {attraction.rating}
                                 </span>
                             </div>
                             <p className="text-gray-600 text-sm mb-4 line-clamp-2">{attraction.description}</p>
                             
                             <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-500 border-t border-gray-50 pt-3">
                                 <div className="flex items-center gap-1">
                                     <Clock className="w-3.5 h-3.5 text-blue-500" />
                                     {attraction.openingHours}
                                 </div>
                                 <div className="flex items-center gap-1">
                                     <Hourglass className="w-3.5 h-3.5 text-purple-500" />
                                     Avg: {attraction.suggestedDuration}
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
             )}
          </div>
      )}

      {/* 2. Planning Controls */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
            <Footprints className="w-6 h-6" /> 
            {itinerary ? "Update Your Schedule" : "Create a Smart Schedule"}
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 p-4 rounded-xl">
                <label className="block text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">Time Available</label>
                <div className="flex gap-4">
                   <div className="flex-1">
                       <span className="text-xs text-gray-500 font-medium mb-1 block">Start Time</span>
                       <input 
                         type="time" 
                         value={startTime} 
                         onChange={(e) => setStartTime(e.target.value)}
                         className="w-full p-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                   </div>
                   <div className="flex-1">
                       <span className="text-xs text-gray-500 font-medium mb-1 block">End Time</span>
                       <input 
                         type="time" 
                         value={endTime} 
                         onChange={(e) => setEndTime(e.target.value)}
                         className="w-full p-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                   </div>
                </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl">
                <label className="block text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">Interests</label>
                <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map(interest => (
                    <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedInterests.includes(interest)
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                    }`}
                    >
                    {interest}
                    </button>
                ))}
                </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loadingItinerary}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-95"
          >
            {loadingItinerary ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
            {loadingItinerary ? 'Calculating Best Route...' : 'Generate Timed Itinerary'}
          </button>
        </div>
      </div>

      {/* 3. Generated Schedule Result */}
      {itinerary && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-end border-b border-gray-200 pb-4 mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{itinerary.title}</h2>
                <div className="flex items-center gap-2 text-indigo-600 mt-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-sm">Total: {itinerary.totalDuration}</span>
                </div>
            </div>
          </div>

          <div className="relative border-l-2 border-dashed border-indigo-200 ml-4 space-y-8 py-4">
            {itinerary.steps.map((step, idx) => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${step.placeName} ${city}`)}`;
              
              return (
              <div key={idx} className="relative pl-8">
                <span className="absolute -left-[9px] top-6 bg-indigo-600 border-4 border-white rounded-full w-5 h-5 shadow-sm"></span>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors group relative">
                  
                  {/* Remove Button for Customization */}
                  <button 
                     onClick={() => handleDeleteStep(idx)}
                     className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1"
                     title="Remove from itinerary"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2 pr-8">
                     <div>
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.startTime} - {step.endTime}
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-700 transition-colors">
                            <HoverImageTrigger keyword={`${step.placeName} ${city}`}>
                                {step.stepTitle}
                            </HoverImageTrigger>
                        </h4>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-gray-400" /> {step.placeName}
                     </div>
                     <a 
                       href={mapsUrl}
                       target="_blank"
                       rel="noreferrer"
                       className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                       title="Get Directions"
                     >
                        <Navigation className="w-4 h-4" />
                     </a>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{step.whyVisit}</p>
                  
                  {step.tip && (
                    <div className="flex gap-3 items-start bg-amber-50 p-3 rounded-xl text-sm text-amber-800 border border-amber-100">
                      <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
                      <div>
                          <span className="font-bold block text-xs uppercase tracking-wide text-amber-600 mb-1">Pro Tip</span>
                          {step.tip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;