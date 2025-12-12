import React from 'react';
import { HistoryData } from '../types';
import { BookOpen, Lightbulb, ChevronRight, Info } from 'lucide-react';

interface HistoryViewProps {
  data: HistoryData | null;
  loading: boolean;
  onExplore: (topic: string, context: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ data, loading, onExplore }) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-32 bg-gray-200 rounded w-full mt-6"></div>
      </div>
    );
  }

  if (!data) return <div className="text-gray-500">No history data available.</div>;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Overview
        </h3>
        <p className="text-gray-700 leading-relaxed font-medium">
          {data.summary}
        </p>
      </div>

      {/* Interactive Timeline/Key Points */}
      <div className="space-y-4">
         <h4 className="text-lg font-bold text-gray-800 ml-1">Key Historical Highlights</h4>
         {data.historyPoints.map((point, index) => (
           <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
             <div className="flex justify-between items-start gap-4">
               <div>
                 <h5 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                   {point.title}
                 </h5>
                 <p className="text-gray-600 leading-relaxed">
                   {point.content}
                 </p>
               </div>
               <button 
                  onClick={() => onExplore(point.title, "history")}
                  className="shrink-0 p-2 rounded-full bg-blue-50 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                  title="Learn more"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>
           </div>
         ))}
      </div>

      {/* Fun Facts */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
        <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Did You Know?
        </h3>
        <ul className="space-y-3">
          {data.funFacts.map((fact, index) => (
            <li key={index} className="flex gap-3 text-amber-900/80 items-start">
              <span className="text-amber-500 font-bold mt-1">•</span>
              <span 
                className="cursor-pointer hover:underline decoration-amber-400 decoration-2 underline-offset-2"
                onClick={() => onExplore(fact, "fun fact")}
              >
                {fact}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoryView;
