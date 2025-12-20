import React, { useState, useEffect } from 'react';
import { AppState, LandmarkData, HistoryData, NearbyPlace, CultureData, EventData, LogisticsData, DeepDiveData, ViewTab } from './types';
import { analyzeLandmarkImage, searchLandmarkByName, getSearchSuggestions, fetchHistory, fetchNearbyPlaces, fetchCulture, fetchEvents, fetchLogistics, exploreTopic } from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import HistoryView from './components/HistoryView';
import NearbyView from './components/NearbyView';
import ItineraryView from './components/ItineraryView';
import CultureView from './components/CultureView';
import EventsView from './components/EventsView';
import LogisticsView from './components/LogisticsView';
import OverviewView from './components/OverviewView';
import DeepDiveModal from './components/DeepDiveModal';
import { MapPin, Compass, Camera, ArrowLeft, Info, Book, Coffee, Map as MapIcon, Calendar, Car, Search, Sparkles, Loader2, AlertTriangle, ZapOff } from 'lucide-react';

const App = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [landmarkData, setLandmarkData] = useState<LandmarkData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[] | null>(null);
  const [cultureData, setCultureData] = useState<CultureData | null>(null);
  const [eventsData, setEventsData] = useState<EventData | null>(null);
  const [logisticsData, setLogisticsData] = useState<LogisticsData | null>(null);
  
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingCulture, setLoadingCulture] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingLogistics, setLoadingLogistics] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [showLowConfidenceWarning, setShowLowConfidenceWarning] = useState(false);

  // Deep Dive Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState("");
  const [deepDiveData, setDeepDiveData] = useState<DeepDiveData | null>(null);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  // Search Suggestions Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const results = await getSearchSuggestions(searchQuery);
        setSuggestions(results);
      } catch (e) {
        console.error("Suggestions error", e);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (state === AppState.HOME) {
        fetchSuggestions();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, state]);

  const handleError = (error: any) => {
    console.error(error);
    const msg = error?.message || "An unexpected error occurred.";
    const quota = msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit") || error?.status === 429;
    
    setIsQuotaError(quota);
    setErrorMsg(quota 
      ? "Our servers are currently at capacity. We've tried to reconnect multiple times, but the limit is still active. Please wait a few moments before trying again." 
      : msg
    );
    setState(AppState.ERROR);
  };

  const handleImageUpload = async (base64: string) => {
    setState(AppState.ANALYZING);
    setErrorMsg(null);
    setIsQuotaError(false);
    setShowLowConfidenceWarning(false);
    try {
      const data = await analyzeLandmarkImage(base64);
      processLandmarkData(data);
    } catch (error) {
      handleError(error);
    }
  };

  const executeSearch = async (query: string) => {
    setState(AppState.ANALYZING);
    setShowSuggestions(false);
    setErrorMsg(null);
    setIsQuotaError(false);
    setShowLowConfidenceWarning(false);
    try {
      const data = await searchLandmarkByName(query);
      processLandmarkData(data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    executeSearch(searchQuery);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    executeSearch(suggestion);
  };

  const processLandmarkData = (data: LandmarkData) => {
    // Blocking error for extremely low confidence
    if (data.confidenceScore < 40) {
      setErrorMsg("We couldn't confidently identify this location from the photo. Please try a clearer shot or search for it by name.");
      setState(AppState.ERROR);
      return;
    }

    // Warning for relatively low confidence (40-50%)
    if (data.confidenceScore < 50) {
      setShowLowConfidenceWarning(true);
    }

    setLandmarkData(data);
    setState(AppState.DASHBOARD);
    loadAdditionalData(data.landmarkName, data.city, data.country);
  };

  const loadAdditionalData = (name: string, city: string, country: string) => {
    setLoadingHistory(true);
    fetchHistory(name, city, country)
      .then(setHistoryData)
      .catch(handleError)
      .finally(() => setLoadingHistory(false));

    setLoadingNearby(true);
    fetchNearbyPlaces(name, city, country)
      .then(setNearbyPlaces)
      .catch(handleError)
      .finally(() => setLoadingNearby(false));
      
    setLoadingCulture(true);
    fetchCulture(city, country)
      .then(setCultureData)
      .catch(handleError)
      .finally(() => setLoadingCulture(false));

    setLoadingEvents(true);
    fetchEvents(city, country)
      .then(setEventsData)
      .catch(handleError)
      .finally(() => setLoadingEvents(false));

    setLoadingLogistics(true);
    fetchLogistics(city, country)
      .then(setLogisticsData)
      .catch(handleError)
      .finally(() => setLoadingLogistics(false));
  };

  const handleExplore = async (topic: string, context: string) => {
    setModalTopic(topic);
    setModalOpen(true);
    setDeepDiveData(null);
    setLoadingDeepDive(true);

    try {
        const currentCity = landmarkData?.city || "";
        const data = await exploreTopic(topic, context, currentCity);
        setDeepDiveData(data);
    } catch (e) {
        console.error("Deep dive error", e);
    } finally {
        setLoadingDeepDive(false);
    }
  };

  const resetApp = () => {
    setState(AppState.HOME);
    setLandmarkData(null);
    setHistoryData(null);
    setNearbyPlaces(null);
    setCultureData(null);
    setEventsData(null);
    setLogisticsData(null);
    setActiveTab('overview');
    setErrorMsg(null);
    setIsQuotaError(false);
    setShowLowConfidenceWarning(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView data={landmarkData} />;
      case 'history':
        return <HistoryView data={historyData} loading={loadingHistory} onExplore={handleExplore} />;
      case 'nearby':
        return <NearbyView places={nearbyPlaces} loading={loadingNearby} city={landmarkData?.city || ''} />;
      case 'culture':
        return <CultureView data={cultureData} loading={loadingCulture} onExplore={handleExplore} />;
      case 'events':
        return <EventsView data={eventsData} loading={loadingEvents} />;
      case 'logistics':
        return <LogisticsView data={logisticsData} loading={loadingLogistics} city={landmarkData?.city || ''} />;
      case 'itinerary':
        return <ItineraryView landmarkName={landmarkData!.landmarkName} city={landmarkData!.city} country={landmarkData!.country} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-20">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Travel Buddy AI
            </h1>
          </div>
          {state === AppState.DASHBOARD && (
             <button onClick={resetApp} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
               <Camera className="w-4 h-4" /> New Journey
             </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        
        {state === AppState.HOME && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-blue-100">
                <Sparkles className="w-3 h-3" /> AI-Powered Travel Guide
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Discover the world <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  one detail at a time.
                </span>
              </h2>
              <p className="text-lg text-gray-500 max-w-lg mx-auto">
                Snap a photo or type a landmark name to unlock history, local food, events, and a custom itinerary.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-8">
               <div className="relative group">
                 <form onSubmit={handleSearchSubmit} className="relative z-20">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search for a landmark (e.g., Eiffel Tower, Taj Mahal)..."
                      value={searchQuery}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-5 pl-14 pr-32 bg-white border-2 border-gray-100 rounded-3xl shadow-xl shadow-blue-900/5 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-lg font-medium"
                    />
                    <div className="absolute right-3 top-2.5 bottom-2.5 flex items-center gap-2">
                      {loadingSuggestions && <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />}
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                      >
                        Explore
                      </button>
                    </div>
                 </form>

                 {showSuggestions && suggestions.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="py-2">
                           {suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-6 py-4 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none group"
                              >
                                <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-blue-100 text-gray-400 group-hover:text-blue-600 transition-colors">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-gray-700 group-hover:text-blue-700">{suggestion}</span>
                              </button>
                           ))}
                        </div>
                      </div>
                    </>
                 )}
               </div>

               <div className="flex items-center gap-4 text-gray-400">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">or upload photo</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
               </div>

               <ImageUpload onImageSelected={handleImageUpload} />
            </div>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Compass className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 animate-pulse">Gathering Intel...</h3>
            <p className="text-gray-500">Retrieving history, culture, and local insights.</p>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
            <div className={`p-8 rounded-full ${isQuotaError ? 'bg-amber-50 shadow-inner' : 'bg-red-50'}`}>
              {isQuotaError ? (
                <ZapOff className="w-16 h-16 text-amber-500 animate-pulse" />
              ) : (
                <Info className="w-16 h-16 text-red-500" />
              )}
            </div>
            <div className="text-center space-y-4 max-w-lg">
               <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                 {isQuotaError ? "System Calibrating" : "Discovery Paused"}
               </h3>
               <p className={`${isQuotaError ? 'text-amber-700' : 'text-red-600'} font-medium text-lg leading-relaxed`}>
                 {errorMsg}
               </p>
               {isQuotaError && (
                 <p className="text-sm text-gray-400 font-medium">This typically happens due to high demand. Reconnecting in a few minutes often solves it.</p>
               )}
            </div>
            <button 
              onClick={resetApp}
              className={`px-8 py-3 ${isQuotaError ? 'bg-amber-600' : 'bg-gray-900'} text-white rounded-2xl hover:opacity-90 transition-all flex items-center gap-3 shadow-xl active:scale-95 font-bold uppercase tracking-widest text-sm`}
            >
              <ArrowLeft className="w-5 h-5" /> {isQuotaError ? "Try Reconnecting" : "Go Back"}
            </button>
          </div>
        )}

        {state === AppState.DASHBOARD && landmarkData && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Low Confidence Warning Banner */}
            {showLowConfidenceWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-4">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                   <h4 className="font-bold text-amber-900 text-sm">Low Confidence Identification ({Math.round(landmarkData.confidenceScore)}%)</h4>
                   <p className="text-amber-800/80 text-xs mt-1 font-medium leading-relaxed">
                     Our AI isn't 100% certain about this location. Some details below might be historical approximations or based on similar-looking landmarks.
                   </p>
                </div>
              </div>
            )}

            {/* Hero Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8 items-stretch">
              <div className="relative w-full md:w-1/3 min-h-[250px] md:aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-gray-100 group">
                <img 
                  src={landmarkData.imageBase64} 
                  alt={landmarkData.landmarkName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full border border-white/20 font-bold">
                  {Math.round(landmarkData.confidenceScore)}% Confidence
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-4 py-2">
                <div>
                   <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                      <MapPin className="w-4 h-4" />
                      {landmarkData.city}, {landmarkData.country}
                   </div>
                   <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                     {landmarkData.landmarkName}
                   </h2>
                </div>
                
                <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
                  {landmarkData.description}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                   {landmarkData.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-100">
                        #{tag}
                      </span>
                   ))}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar sticky top-20 z-40 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-2">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'history', label: 'History', icon: Book },
                { id: 'nearby', label: 'Nearby', icon: MapPin },
                { id: 'culture', label: 'Culture & Food', icon: Coffee },
                { id: 'events', label: 'Live Events', icon: Calendar },
                { id: 'logistics', label: 'Stays & Travel', icon: Car },
                { id: 'itinerary', label: 'Plan Itinerary', icon: MapIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ViewTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
              {renderContent()}
            </div>

          </div>
        )}
      </main>

      {/* Interactive Modal */}
      <DeepDiveModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        data={deepDiveData}
        loading={loadingDeepDive}
        topic={modalTopic}
      />

    </div>
  );
};

export default App;
