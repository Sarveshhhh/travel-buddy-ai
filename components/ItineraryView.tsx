import React, { useState, useEffect } from 'react';
import { ItineraryData, Attraction, ItineraryDay } from '../types';
import { generateItinerary, fetchTopAttractions } from '../services/geminiService';
import { Clock, CheckCircle, Map, Loader2, Footprints, MapPin, Navigation, Star, Hourglass, Trash2, CalendarDays, Download, ChevronDown, ChevronUp, Sparkles, PlusCircle, Gem, FileJson, FileText } from 'lucide-react';
import HoverImageTrigger from './HoverImageTrigger';
import { jsPDF } from 'jspdf';

interface ItineraryViewProps {
  landmarkName: string;
  city: string;
  country: string;
}

const INTERESTS_LIST = ["History", "Food", "Shopping", "Culture", "Nature", "Art", "Relaxation"];

const ItineraryView: React.FC<ItineraryViewProps> = ({ landmarkName, city, country }) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [numDays, setNumDays] = useState(1);
  const [mustVisit, setMustVisit] = useState("");
  const [includeHiddenGems, setIncludeHiddenGems] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["History", "Culture"]);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  
  const [attractions, setAttractions] = useState<Attraction[] | null>(null);
  const [loadingAttractions, setLoadingAttractions] = useState(false);

  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  useEffect(() => {
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
      const result = await generateItinerary(landmarkName, city, startTime, endTime, numDays, selectedInterests, mustVisit, includeHiddenGems);
      setItinerary(result);
      setExpandedDays(result.days.map(d => d.dayNumber));
    } catch (e) {
      console.error(e);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoadingItinerary(false);
    }
  };

  const toggleDay = (dayNum: number) => {
    setExpandedDays(prev => 
        prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleDeleteStep = (dayIdx: number, stepIdxToRemove: number) => {
      if (!itinerary) return;
      const newDays = [...itinerary.days];
      newDays[dayIdx].steps = newDays[dayIdx].steps.filter((_, idx) => idx !== stepIdxToRemove);
      setItinerary({ ...itinerary, days: newDays });
  };

  const handleDownloadMarkdown = () => {
    if (!itinerary) return;
    
    let content = `# ${itinerary.title}\n`;
    content += `Location: ${city}, ${country}\n`;
    content += `Duration: ${itinerary.totalDays} Days\n\n`;
    
    itinerary.days.forEach(day => {
      content += `## Day ${day.dayNumber}: ${day.dayTitle}\n`;
      day.steps.forEach(step => {
        content += `- [${step.startTime} - ${step.endTime}] ${step.stepTitle} at ${step.placeName}\n`;
        if (step.isHiddenGem) content += `  [HIDDEN GEM] ✨\n`;
        content += `  Why visit: ${step.whyVisit}\n`;
        if (step.tip) content += `  Pro-Tip: ${step.tip}\n`;
      });
      content += `\n`;
    });
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${landmarkName.replace(/\s+/g, '_')}_Itinerary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!itinerary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(49, 46, 129); // indigo-900
    doc.text(itinerary.title, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${city}, ${country} | ${itinerary.totalDays} Days Journey`, 20, y);
    y += 10;

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, y, pageWidth - 20, y);
    y += 15;

    // Content Iteration
    itinerary.days.forEach((day, dayIdx) => {
      // Check for page break
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Day Header
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.roundedRect(20, y, pageWidth - 40, 12, 2, 2, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`DAY ${day.dayNumber}: ${day.dayTitle.toUpperCase()}`, 25, y + 8);
      y += 20;

      day.steps.forEach((step, stepIdx) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text(`${step.startTime} - ${step.endTime}`, 20, y);
        
        if (step.isHiddenGem) {
            doc.setFontSize(8);
            doc.setTextColor(16, 185, 129); // emerald-500
            doc.text("[ HIDDEN GEM ]", 60, y);
        }

        y += 6;
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(step.stepTitle, 20, y);
        
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(`Location: ${step.placeName}`, 20, y);
        
        y += 6;
        const whyVisitLines = doc.splitTextToSize(step.whyVisit, pageWidth - 45);
        doc.text(whyVisitLines, 20, y);
        y += (whyVisitLines.length * 5) + 3;

        if (step.tip) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(37, 99, 235); // blue-600
          const tipLines = doc.splitTextToSize(`Insider Tip: ${step.tip}`, pageWidth - 50);
          doc.text(tipLines, 25, y);
          y += (tipLines.length * 4) + 6;
        }

        y += 5;
        // Step divider line
        if (stepIdx < day.steps.length - 1) {
            doc.setDrawColor(241, 245, 249);
            doc.line(20, y, pageWidth - 20, y);
            y += 10;
        }
      });
      y += 10;
    });

    doc.save(`${landmarkName.replace(/\s+/g, '_')}_Itinerary.pdf`);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Top Attractions Catalog */}
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
                                 <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> {attraction.openingHours}</div>
                                 <div className="flex items-center gap-1"><Hourglass className="w-3.5 h-3.5 text-purple-500" /> Avg: {attraction.suggestedDuration}</div>
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
            {itinerary ? "Refine Your Plan" : "Plan Your Multi-Day Journey"}
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 p-4 rounded-xl">
                <label className="block text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Duration
                </label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range" min="1" max="7" 
                        value={numDays} 
                        onChange={(e) => setNumDays(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                    <span className="text-lg font-extrabold text-indigo-900 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                        {numDays}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 uppercase">Days</span>
                </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl">
                <label className="block text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Daily Hours
                </label>
                <div className="flex gap-2">
                   <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 bg-white text-xs font-bold" />
                   <span className="self-center text-gray-400 font-bold">-</span>
                   <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 bg-white text-xs font-bold" />
                </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl md:col-span-1">
                <label className="block text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider">Top Interests</label>
                <div className="flex flex-wrap gap-1.5">
                {INTERESTS_LIST.map(interest => (
                    <button key={interest} onClick={() => toggleInterest(interest)} className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${selectedInterests.includes(interest) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'}`}>
                    {interest}
                    </button>
                ))}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-xl">
                <label className="block text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider flex items-center gap-1">
                    <PlusCircle className="w-3 h-3" /> Must-Visit Spots
                </label>
                <input 
                    type="text" 
                    placeholder="e.g., Malabar Hill, Hanging Gardens..."
                    value={mustVisit}
                    onChange={(e) => setMustVisit(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-transparent bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium"
                />
            </div>
            
            <div className="bg-white/60 p-4 rounded-xl flex flex-col justify-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={includeHiddenGems}
                            onChange={() => setIncludeHiddenGems(!includeHiddenGems)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-tight">
                            <Gem className="w-3.5 h-3.5 text-emerald-500" />
                            Explore Hidden Gems
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">Include less explored, authentic local areas</span>
                    </div>
                </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loadingItinerary}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2 transform active:scale-95"
          >
            {loadingItinerary ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loadingItinerary ? 'Architecting Your Experience...' : itinerary ? `Regenerate ${numDays}-Day Plan` : `Generate ${numDays}-Day Itinerary`}
          </button>
        </div>
      </div>

      {/* 3. Generated Multi-Day Itinerary */}
      {itinerary && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{itinerary.title}</h2>
                <div className="flex items-center gap-3 text-indigo-600 mt-2">
                    <div className="flex items-center gap-1 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full"><CalendarDays className="w-4 h-4" /> {itinerary.totalDays} Days</div>
                    <div className="flex items-center gap-1 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full"><MapPin className="w-4 h-4" /> {city}</div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                    <Download className="w-5 h-5" /> PDF
                </button>
                <button 
                    onClick={handleDownloadMarkdown}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                    <FileText className="w-5 h-5" /> Markdown
                </button>
            </div>
          </div>

          <div className="space-y-4">
            {itinerary.days.map((day, dayIdx) => (
              <div key={dayIdx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <button 
                   onClick={() => toggleDay(day.dayNumber)}
                   className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center font-bold shadow-lg shadow-indigo-100">
                         <span className="text-[10px] leading-none opacity-80 uppercase">Day</span>
                         <span className="text-lg leading-none">{day.dayNumber}</span>
                      </div>
                      <div>
                         <h4 className="text-xl font-bold text-gray-900">{day.dayTitle}</h4>
                         <p className="text-sm text-gray-500">{day.steps.length} Activities Planned</p>
                      </div>
                   </div>
                   {expandedDays.includes(day.dayNumber) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                {expandedDays.includes(day.dayNumber) && (
                   <div className="px-6 pb-8 pt-2">
                      <div className="relative border-l-2 border-dashed border-indigo-100 ml-6 space-y-8">
                         {day.steps.map((step, stepIdx) => {
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${step.placeName} ${city}`)}`;
                            return (
                               <div key={stepIdx} className="relative pl-8 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${stepIdx * 50}ms` }}>
                                  <span className={`absolute -left-[9px] top-6 rounded-full w-5 h-5 shadow-md border-4 border-white ${step.isHiddenGem ? 'bg-emerald-500' : 'bg-indigo-600'}`}></span>
                                  <div className={`p-5 rounded-3xl border transition-all group relative ${step.isHiddenGem ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200'}`}>
                                     <button onClick={() => handleDeleteStep(dayIdx, stepIdx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                     
                                     <div className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${step.isHiddenGem ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                <Clock className="w-3 h-3" /> {step.startTime} - {step.endTime}
                                            </div>
                                            {step.isHiddenGem && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    <Gem className="w-3 h-3" /> Hidden Gem
                                                </span>
                                            )}
                                        </div>
                                        <h5 className={`font-bold text-lg transition-colors ${step.isHiddenGem ? 'text-emerald-900 group-hover:text-emerald-700' : 'text-gray-900 group-hover:text-indigo-700'}`}>
                                            <HoverImageTrigger keyword={`${step.placeName} ${city}`}>{step.stepTitle}</HoverImageTrigger>
                                        </h5>
                                     </div>
                                     <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wide">
                                            <MapPin className={`w-3.5 h-3.5 ${step.isHiddenGem ? 'text-emerald-400' : 'text-indigo-400'}`} /> {step.placeName}
                                        </div>
                                        <a href={mapsUrl} target="_blank" rel="noreferrer" className={`p-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-all ${step.isHiddenGem ? 'text-emerald-600 hover:bg-emerald-50' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                                            <Navigation className="w-4 h-4" />
                                        </a>
                                     </div>
                                     <p className="text-gray-600 text-sm leading-relaxed mb-4">{step.whyVisit}</p>
                                     {step.tip && (
                                        <div className={`flex gap-3 items-start p-4 rounded-2xl text-xs border ${step.isHiddenGem ? 'bg-emerald-100/50 text-emerald-900 border-emerald-100/50' : 'bg-blue-50/50 text-blue-900 border-blue-100/50'}`}>
                                           <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${step.isHiddenGem ? 'text-emerald-500' : 'text-blue-500'}`} />
                                           <div>
                                               <span className={`font-extrabold block uppercase tracking-tighter mb-0.5 ${step.isHiddenGem ? 'text-emerald-600' : 'text-blue-600'}`}>Insider Tip</span>
                                               {step.tip}
                                           </div>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;