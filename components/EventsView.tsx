import React from 'react';
import { EventData } from '../types';
import { Calendar, ExternalLink, MapPin, Tag } from 'lucide-react';

interface EventsViewProps {
  data: EventData | null;
  loading: boolean;
}

const EventsView: React.FC<EventsViewProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2].map(i => (
             <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!data || data.categories.length === 0) return <div className="text-gray-500 text-center py-10">No upcoming events found.</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Live & Upcoming
        </h3>
        <p className="text-purple-100">
            Real-time events happening nearby categorized for you.
        </p>
      </div>

      <div className="space-y-8">
        {data.categories.map((category, catIdx) => (
            <div key={catIdx}>
                <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 px-1">
                    <Tag className="w-5 h-5 text-purple-500" />
                    {category.categoryName}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                    {category.events.map((event, eventIdx) => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`;
                        return (
                            <div key={eventIdx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h5 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h5>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                            <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{event.date}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                                    </div>
                                    <a 
                                        href={mapsUrl}
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Directions
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      {data.sources.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sources & Tickets</h4>
              <div className="flex flex-wrap gap-2">
                  {data.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
                      >
                          <ExternalLink className="w-3 h-3" />
                          {source.title}
                      </a>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default EventsView;
