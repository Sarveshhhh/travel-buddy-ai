import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LandmarkData, HistoryData, NearbyPlace, ItineraryData, CultureData, EventData, LogisticsData, DeepDiveData, Attraction } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

// --- Schemas ---

const landmarkSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    landmarkName: { type: Type.STRING },
    alternativeNames: { type: Type.ARRAY, items: { type: Type.STRING } },
    possibleLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
    city: { type: Type.STRING },
    country: { type: Type.STRING },
    confidenceScore: { type: Type.NUMBER, description: "A score between 0 and 100 indicating confidence" },
    description: { type: Type.STRING },
    descriptionPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-6 interesting bullet points describing the landmark visually and historically." },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["landmarkName", "city", "country", "confidenceScore", "description", "descriptionPoints"],
};

const historySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    historyPoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["title", "content"],
      },
    },
    funFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "historyPoints", "funFacts"],
};

const nearbySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      placeName: { type: Type.STRING },
      category: { type: Type.STRING },
      distanceKm: { type: Type.NUMBER },
      approxTimeMinutes: { type: Type.NUMBER },
      shortDescription: { type: Type.STRING },
      openingHours: { type: Type.STRING, description: "Opening and closing times, e.g., '9:00 AM - 6:00 PM' or 'Open 24 hours'. If unknown, estimate or say 'Check locally'." },
    },
    required: ["placeName", "category", "distanceKm", "shortDescription", "openingHours"],
  },
};

const attractionsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      openingHours: { type: Type.STRING },
      suggestedDuration: { type: Type.STRING },
      rating: { type: Type.STRING },
      locationType: { type: Type.STRING },
    },
    required: ["name", "openingHours", "suggestedDuration"],
  },
};

const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    totalDuration: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepTitle: { type: Type.STRING },
          placeName: { type: Type.STRING },
          startTime: { type: Type.STRING, description: "Start time of activity e.g., '09:00 AM'" },
          endTime: { type: Type.STRING, description: "End time of activity e.g., '10:30 AM'" },
          durationMinutes: { type: Type.NUMBER },
          whyVisit: { type: Type.STRING },
          tip: { type: Type.STRING },
        },
        required: ["stepTitle", "placeName", "startTime", "endTime", "durationMinutes", "whyVisit"],
      },
    },
  },
  required: ["title", "steps"],
};

const cultureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    culinaryHighlights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    culturalEtiquette: { type: Type.ARRAY, items: { type: Type.STRING } },
    localTraditions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["culinaryHighlights", "culturalEtiquette", "localTraditions"],
};

const deepDiveSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    details: { type: Type.ARRAY, items: { type: Type.STRING } },
    stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    bestPlaces: { type: Type.ARRAY, items: { type: Type.STRING } },
    relatedInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["topic", "details"],
};

// --- API Calls ---

export const analyzeLandmarkImage = async (base64Image: string): Promise<LandmarkData> => {
  const base64Data = base64Image.includes("base64,") 
    ? base64Image.split("base64,")[1] 
    : base64Image;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
        {
          text: `You are an advanced landmark recognition AI. Analyze the uploaded image.
                 Return results in JSON format.
                 If unsure, set confidenceScore below 50.
                 Provide a description, city, and country.
                 Also provide 'descriptionPoints' which is an array of 5-6 interesting bullet points describing the landmark visually and historically.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: landmarkSchema,
    }
  });

  const text = response.text || "{}";
  const data = JSON.parse(text) as Partial<LandmarkData>;

  return {
    landmarkName: data.landmarkName || "Unknown",
    alternativeNames: data.alternativeNames || [],
    possibleLocations: data.possibleLocations || [],
    city: data.city || "Unknown",
    country: data.country || "Unknown",
    confidenceScore: data.confidenceScore || 0,
    description: data.description || "No description available.",
    descriptionPoints: data.descriptionPoints || [],
    tags: data.tags || [],
    imageBase64: base64Image,
  };
};

export const fetchHistory = async (landmark: string, city: string, country: string): Promise<HistoryData> => {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Provide history of the landmark: ${landmark} in ${city}, ${country}.
               Return JSON with summary, historyPoints (key events or architectural details as bullet points with titles), and funFacts.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: historySchema,
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as HistoryData;
};

export const fetchNearbyPlaces = async (landmark: string, city: string, country: string): Promise<NearbyPlace[]> => {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Generate a list of 5-8 real nearby attractions around: ${landmark} in ${city}, ${country}.
               Include openingHours for each place (e.g. 9 AM - 5 PM).
               Return a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: nearbySchema,
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text) as NearbyPlace[];
};

export const fetchTopAttractions = async (city: string, country: string): Promise<Attraction[]> => {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `List 5-6 top rated tourist attractions in ${city}, ${country}.
               For each, provide:
               - name
               - openingHours (e.g. 9 AM - 6 PM)
               - suggestedDuration (e.g. 1-2 hours)
               - rating (e.g. 4.5)
               - locationType (e.g. Museum, Park)
               Return JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: attractionsSchema,
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text) as Attraction[];
};

export const fetchCulture = async (city: string, country: string): Promise<CultureData> => {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Describe the authentic cuisine and culture of ${city}, ${country}.
               Return JSON with culinaryHighlights (name, description), culturalEtiquette, and localTraditions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: cultureSchema,
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as CultureData;
};

export const generateItinerary = async (
  landmark: string,
  city: string,
  startTime: string,
  endTime: string,
  interests: string[]
): Promise<ItineraryData> => {
  const prompt = `Create a personalized, time-specific travel itinerary.
    Landmark: ${landmark}
    City: ${city}
    Start Time: ${startTime}
    End Time: ${endTime}
    Interests: ${interests.join(", ")}
    
    CRITICAL INSTRUCTIONS:
    1. Start the itinerary strictly at ${startTime}.
    2. End the itinerary by or before ${endTime}.
    3. Provide specific 'startTime' and 'endTime' for each step.
    4. Ensure the timeline respects typical opening hours.
    5. Start with the main landmark provided if it fits the time.
    
    Return JSON.`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: itinerarySchema,
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as ItineraryData;
};

export const fetchEvents = async (city: string, country: string): Promise<EventData> => {
  // Uses Google Search to find real-time events.
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Find the latest upcoming events, festivals, concerts, and exhibitions in ${city}, ${country} happening this month. 
               
               Return a valid JSON object. 
               Structure: {
                 "categories": [
                   {
                     "categoryName": "Music" | "Art" | "Sports" | "Festivals",
                     "events": [
                       { "title": "Event Name", "date": "Date Time", "location": "Venue", "description": "Short desc", "mapQuery": "Location Name City" }
                     ]
                   }
                 ]
               }
               Do not use Markdown formatting in the response. Return raw JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  // Extract grounding metadata (sources)
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        return { title: chunk.web.title, url: chunk.web.uri };
      }
      return null;
    })
    .filter((s: any) => s !== null) || [];

  let parsedData = { categories: [] };
  try {
    const text = response.text?.replace(/```json/g, '').replace(/```/g, '') || "{}";
    parsedData = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse events JSON", e);
  }

  return {
    categories: parsedData.categories || [],
    sources: sources,
  };
};

export const fetchLogistics = async (city: string, country: string): Promise<LogisticsData> => {
  const prompt = `Find travel logistics for ${city}, ${country}.
  1. List popular cab/taxi apps or services available.
  2. List popular car rental agencies.
  3. List recommended hotels categorized by "Luxury" (5-star), "MidRange" (4-star), and "Budget" (3-star).
  
  Return valid JSON with keys: cabs (string array), rentals (string array), hotels (object with luxury, midRange, budget arrays of objects {name, rating, description}).
  Do not use Markdown.`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // Note: We use tools to get grounded info, but ask for JSON format text.
    }
  });

  let data: Partial<LogisticsData> = {};
  try {
     const text = response.text?.replace(/```json/g, '').replace(/```/g, '') || "{}";
     data = JSON.parse(text);
  } catch (e) {
     console.error("Failed to parse logistics JSON", e);
  }

  return {
    cabs: data.cabs || [],
    rentals: data.rentals || [],
    hotels: data.hotels || { luxury: [], midRange: [], budget: [] },
  };
};

export const exploreTopic = async (topic: string, context: string, city: string = ""): Promise<DeepDiveData> => {
  const prompt = `The user is interested in "${topic}" related to "${context}"${city ? ` in or near ${city}` : ""}.
  Provide a deep dive using bullet points.
  
  CRITICAL: If it's a food item, provide 'bestPlaces' (famous spots to try it **specifically in ${city}**) and 'details' (ingredients/history).
  If it's a craft or clothing (like shawls), provide 'stylingTips' (how to wear/style it) and 'details' (origin/process).
  If it's a tradition, provide 'relatedInfo' and 'details'.
  
  Do not suggest places in other cities unless absolutely necessary.
  Return JSON.`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: deepDiveSchema,
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as DeepDiveData;
};
