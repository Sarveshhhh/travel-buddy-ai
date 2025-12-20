export interface LandmarkData {
  landmarkName: string;
  alternativeNames: string[];
  possibleLocations: string[];
  city: string;
  country: string;
  confidenceScore: number;
  description: string;
  descriptionPoints: string[]; 
  tags: string[];
  imageBase64: string;
}

export interface HistoryData {
  summary: string;
  historyPoints: Array<{
    title: string;
    content: string;
  }>;
  funFacts: string[];
}

export interface NearbyPlace {
  placeName: string;
  category: 'monument' | 'museum' | 'park' | 'food' | 'shopping' | 'activity' | string;
  distanceKm: number;
  approxTimeMinutes: number;
  shortDescription: string;
  openingHours: string;
}

export interface Attraction {
  name: string;
  description: string;
  openingHours: string;
  suggestedDuration: string;
  rating: string;
  locationType: string;
}

export interface ItineraryStep {
  stepTitle: string;
  placeName: string;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  durationMinutes: number;
  whyVisit: string;
  tip: string;
  isHiddenGem?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  steps: ItineraryStep[];
}

export interface ItineraryData {
  title: string;
  totalDays: number;
  days: ItineraryDay[];
}

export interface CultureData {
  culinaryHighlights: Array<{
    name: string;
    description: string;
  }>;
  culturalEtiquette: string[];
  localTraditions: string[];
}

export interface EventItem {
  title: string;
  date: string;
  location: string;
  description: string;
  mapQuery: string;
}

export interface EventCategory {
  categoryName: string;
  events: EventItem[];
}

export interface EventData {
  categories: EventCategory[];
  sources: Array<{ title: string; url: string }>;
}

export interface Hotel {
  name: string;
  rating: string; // e.g. "5-star"
  description: string;
}

export interface LogisticsData {
  cabs: string[];
  rentals: string[];
  hotels: {
    luxury: Hotel[]; // 5-star
    midRange: Hotel[]; // 4-star
    budget: Hotel[]; // 3-star/others
  };
}

export interface DeepDiveData {
  topic: string;
  details: string[]; // Bullet points
  stylingTips?: string[]; // Specifically for fashion/items
  bestPlaces?: string[]; // Specifically for food
  relatedInfo?: string[];
}

export enum AppState {
  HOME = 'HOME',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}

export type ViewTab = 'overview' | 'history' | 'nearby' | 'itinerary' | 'culture' | 'events' | 'logistics';