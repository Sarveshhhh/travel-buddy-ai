import React, { useState } from 'react';
import { AppState, LandmarkData, HistoryData, NearbyPlace, CultureData, EventData, LogisticsData, DeepDiveData, ViewTab } from './types';
import { analyzeLandmarkImage, fetchHistory, fetchNearbyPlaces, fetchCulture, fetchEvents, fetchLogistics, exploreTopic } from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import HistoryView from './components/HistoryView';
import NearbyView from './components/NearbyView';
import ItineraryView from './components/ItineraryView';
import CultureView from './components/CultureView';
import EventsView from './components/EventsView';
import LogisticsView from './components/LogisticsView';
import OverviewView from './components/OverviewView';
import DeepDiveModal from './components/DeepDiveModal';
import { MapPin, Compass, Camera, ArrowLeft, Info, Book, Coffee, Map as MapIcon, Calendar, Car, Loader2 } from 'lucide-react';

const App = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  
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

  // Deep Dive Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState("");
  const [deepDiveData, setDeepDiveData] = useState<DeepDiveData | null>(null);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  const handleImageUpload = async (base64: string) => {
    setState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
      const data = await analyzeLandmarkImage(base64);
      
      if (data.confidenceScore < 50) {
        setErrorMsg("We couldn't confidently identify this landmark. Please try a clearer photo.");
        setState(AppState.ERROR);
        return;
      }

      setLandmarkData(data);
      setState(AppState.DASHBOARD);
      
      // Lazy load other data
      loadAdditionalData(data.landmarkName, data.city, data.country);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to analyze image. Please check your connection and try again.");
      setState(AppState.ERROR);
    }
  };

  const loadAdditionalData = (name: string, city: string, country: string) => {
    setLoadingHistory(true);
    fetchHistory(name, city, country)
      .then(setHistoryData)
      .catch(e => console.error("History error", e))
      .finally(() => setLoadingHistory(false));

    setLoadingNearby(true);
    fetchNearbyPlaces(name, city, country)
      .then(setNearbyPlaces)
      .catch(e => console.error("Nearby error", e))
      .finally(() => setLoadingNearby(false));
      
    setLoadingCulture(true);
    fetchCulture(city, country)
      .then(setCultureData)
      .catch(e => console.error("Culture error", e))
      .finally(() => setLoadingCulture(false));

    setLoadingEvents(true);
    fetchEvents(city, country)
      .then(setEventsData)
      .catch(e => console.error("Events error", e))
      .finally(() => setLoadingEvents(false));

    setLoadingLogistics(true);
    fetchLogistics(city, country)
      .then(setLogisticsData)
      .catch(e => console.error("Logistics error", e))
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
               <Camera className="w-4 h-4" /> New Photo
             </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        
        {state === AppState.HOME && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Discover the world <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  one photo at a time.
                </span>
              </h2>
              <p className="text-lg text-gray-500">
                Upload a photo of any landmark to instantly get history, live events, cultural insights, and a personalized itinerary.
              </p>
            </div>
            <ImageUpload onImageSelected={handleImageUpload} />
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Compass className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 animate-pulse">Analyzing your photo...</h3>
            <p className="text-gray-500">Identifying landmark and gathering intel.</p>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="p-6 bg-red-50 rounded-full">
              <Info className="w-12 h-12 text-red-500" />
            </div>
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-bold text-gray-800">Oops!</h3>
               <p className="text-red-600 max-w-md">{errorMsg}</p>
            </div>
            <button 
              onClick={resetApp}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {state === AppState.DASHBOARD && landmarkData && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Hero Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8 items-start">
              <div className="relative w-full md:w-1/3 aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-gray-100 group">
                <img 
                  src={landmarkData.imageBase64} 
                  alt={landmarkData.landmarkName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full border border-white/20">
                  {Math.round(landmarkData.confidenceScore)}% Match
                </div>
              </div>
              
              <div className="flex-1 space-y-4 py-2">
                <div>
                   <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
                      <MapPin className="w-4 h-4" />
                      {landmarkData.city}, {landmarkData.country}
                   </div>
                   <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                     {landmarkData.landmarkName}
                   </h2>
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-3 md:line-clamp-none leading-relaxed">
                  {landmarkData.description}
                </p>
                
                {/* Stats / Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Type</div>
                        <div className="font-medium text-gray-800 truncate">{landmarkData.tags[0] || 'Landmark'}</div>
                    </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105' 
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
