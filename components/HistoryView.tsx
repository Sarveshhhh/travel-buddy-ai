import React, { useState } from 'react';
import { HistoryData } from '../types';
import { 
  BookOpen, 
  Lightbulb, 
  ChevronRight, 
  History, 
  Clock, 
  Sparkles, 
  Globe, 
  Zap, 
  ArrowRight, 
  ChevronDown, 
  Search,
  Layers,
  Milestone,
  Compass
} from 'lucide-react';

interface HistoryViewProps {
  data: HistoryData | null;
  loading: boolean;
  onExplore: (topic: string, context: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ data, loading, onExplore }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-48 bg-white border border-gray-100 rounded-[2.5rem]"></div>
        <div className="space-y-10">
           {[1,2,3].map(i => (
             <div key={i} className="flex gap-8">
                <div className="w-1 bg-gray-100 rounded-full h-40"></div>
                <div className="flex-1 h-32 bg-white border border-gray-100 rounded-[2rem]"></div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <History className="w-10 h-10 text-gray-200" />
      </div>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chronological Records Unavailable</p>
    </div>
  );

  const funFactThemes = [
    { bg: 'bg-amber-50/50', border: 'border-amber-100/50', icon: Lightbulb, color: 'text-amber-500', shadow: 'hover:shadow-amber-200/20' },
    { bg: 'bg-indigo-50/50', border: 'border-indigo-100/50', icon: Milestone, color: 'text-indigo-500', shadow: 'hover:shadow-indigo-200/20' },
    { bg: 'bg-emerald-50/50', border: 'border-emerald-100/50', icon: Sparkles, color: 'text-emerald-500', shadow: 'hover:shadow-emerald-200/20' },
    { bg: 'bg-rose-50/50', border: 'border-rose-100/50', icon: Zap, color: 'text-rose-500', shadow: 'hover:shadow-rose-200/20' },
    { bg: 'bg-sky-50/50', border: 'border-sky-100/50', icon: Globe, color: 'text-sky-500', shadow: 'hover:shadow-sky-200/20' },
    { bg: 'bg-violet-50/50', border: 'border-violet-100/50', icon: Compass, color: 'text-violet-500', shadow: 'hover:shadow-violet-200/20' },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      
      {/* Narrative Archive Summary */}
      <section className="relative group">
        <div className="relative bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-blue-50 pointer-events-none transition-all duration-1000 group-hover:scale-110">
            <BookOpen className="w-40 h-40 opacity-10" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
              <History className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Curated Narrative</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-2xl">
              Unfolding the <span className="text-blue-600">History</span>
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg md:text-xl font-medium max-w-4xl tracking-tight">
              {data.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Vertical Interactive Timeline */}
      <section className="space-y-8">
        <div className="flex items-center gap-6 mb-12">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] whitespace-nowrap">Key Milestones</h4>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <div className="relative ml-6 md:ml-12">
          <div className="absolute left-[-1px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500 via-indigo-400 to-transparent opacity-20"></div>

          <div className="space-y-6">
            {data.historyPoints.map((point, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div key={index} className="relative pl-10 md:pl-16 group">
                  <div 
                    className={`absolute left-[-6px] top-8 w-3 h-3 bg-white border-2 rounded-full shadow-sm z-20 transition-all duration-500
                      ${isExpanded ? 'border-blue-600 scale-150' : 'border-gray-200 group-hover:border-blue-400'}`}
                  />
                  
                  <div 
                    className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden 
                      ${isExpanded 
                        ? 'border-blue-200 shadow-xl shadow-blue-900/5 -translate-y-1' 
                        : 'border-gray-50 hover:border-blue-100 hover:shadow-md cursor-pointer'
                      }`}
                    onClick={() => !isExpanded && toggleExpand(index)}
                  >
                    <div className="p-8 md:p-10">
                      <div className="flex justify-between items-center gap-6">
                        <div className="space-y-2 flex-1">
                          <div className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${isExpanded ? 'text-blue-600' : 'text-gray-400'}`}>
                             Node {index + 1}
                          </div>
                          <h5 className={`font-bold tracking-tight transition-all duration-500 
                            ${isExpanded ? 'text-2xl md:text-3xl text-gray-900' : 'text-lg md:text-xl text-gray-500 group-hover:text-blue-600'}`}>
                            {point.title}
                          </h5>
                        </div>
                        
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0
                            ${isExpanded ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-400'}`}
                          onClick={(e) => { e.stopPropagation(); toggleExpand(index); }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>

                      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden space-y-6">
                          <p className="text-gray-600 leading-relaxed text-base md:text-lg font-medium border-l-4 border-blue-500/10 pl-6">
                            {point.content}
                          </p>
                          <button 
                              onClick={(e) => { e.stopPropagation(); onExplore(point.title, "history"); }}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                          >
                            <Search className="w-4 h-4" />
                            Deep Dive
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Discovery Cards Grid (Fun Facts) */}
      <section className="space-y-10 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Did You Know?
            </h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Discovery fragments & urban legends</p>
          </div>
          <div className="text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-full border border-blue-100">
            {data.funFacts.length} Hidden Layers
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.funFacts.map((fact, index) => {
                const theme = funFactThemes[index % funFactThemes.length];
                const Icon = theme.icon;
                return (
                    <div 
                        key={index} 
                        className={`flex flex-col p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 group cursor-default h-full relative overflow-hidden ${theme.bg} ${theme.border} ${theme.shadow} hover:-translate-y-2`}
                    >
                        {/* Decorative background element */}
                        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full transition-all duration-1000 opacity-5 group-hover:opacity-10 ${theme.color} bg-current`}></div>
                        
                        <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500`}>
                            <Icon className={`w-7 h-7 ${theme.color}`} />
                        </div>
                        
                        <p className="text-gray-900 text-lg font-bold leading-relaxed mb-8 flex-1 group-hover:text-gray-800 transition-colors tracking-tight">
                            {fact}
                        </p>
                        
                        <button 
                            onClick={() => onExplore(fact, "local discovery")}
                            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-all group/link mt-auto w-fit"
                        >
                            <span className="relative">
                              Explore Fragment
                              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-blue-600 transition-all duration-500 group-hover/link:w-full rounded-full"></span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-500 group-hover/link:translate-x-2 group-hover/link:bg-blue-600 group-hover/link:text-white">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                );
            })}
        </div>
      </section>

      {/* Narrative Footer CTA */}
      <div className="bg-gray-900 rounded-[3rem] p-10 text-center space-y-6 relative overflow-hidden group mt-12">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
            <Layers className="w-7 h-7 text-blue-500" />
        </div>
        <div className="space-y-2 relative z-10">
            <h4 className="text-white text-xl font-bold tracking-tight">Immersive Architecture</h4>
            <p className="text-gray-400 max-w-md mx-auto font-medium text-sm leading-relaxed opacity-80">Explore the layers above to bridge cultural nuances with modern day city life.</p>
        </div>
      </div>

    </div>
  );
};

export default HistoryView;