import { GoogleGenAI, Type } from "@google/genai";
import { LandmarkData, HistoryData, NearbyPlace, ItineraryData, CultureData, EventData, LogisticsData, DeepDiveData, Attraction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-3-flash-preview";

/**
 * Utility to retry failed API calls, specifically targeting 429 Resource Exhausted errors.
 * Uses exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || 
                       error?.message?.toLowerCase().includes("quota") || 
                       error?.message?.toLowerCase().includes("rate limit") ||
                       error?.message?.toLowerCase().includes("exhausted");
    
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const extractJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error("Could not parse extracted JSON block");
      }
    }
    throw e;
  }
};

// --- API Calls wrapped with withRetry ---

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Suggest 6-8 popular travel landmarks or cities that match: "${query}". Return as a raw JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    });
    return extractJSON(response.text || "[]");
  });
};

export const analyzeLandmarkImage = async (base64Image: string): Promise<LandmarkData> => {
  const base64Data = base64Image.includes("base64,") ? base64Image.split("base64,")[1] : base64Image;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: "Identify this landmark. Return JSON with name, city, country, confidence (0-100), description, and 5-6 bullet points." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: landmarkSchema,
      }
    });

    const data = extractJSON(response.text || "{}");
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
  });
};

export const searchLandmarkByName = async (name: string): Promise<LandmarkData> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Detail the landmark: "${name}". Identify city and country. Return JSON with confidence score, description, and 5-6 points.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: landmarkSchema,
      }
    });

    const data = extractJSON(response.text || "{}");
    const generatedImgUrl = `https://image.pollinations.ai/prompt/photorealistic landmark ${encodeURIComponent(data.landmarkName || name)} ${encodeURIComponent(data.city || '')}?width=1200&height=800&nologo=true`;

    return {
      landmarkName: data.landmarkName || name,
      alternativeNames: data.alternativeNames || [],
      possibleLocations: data.possibleLocations || [],
      city: data.city || "Unknown",
      country: data.country || "Unknown",
      confidenceScore: data.confidenceScore || 0,
      description: data.description || "No description available.",
      descriptionPoints: data.descriptionPoints || [],
      tags: data.tags || [],
      imageBase64: generatedImgUrl,
    };
  });
};

export const fetchHistory = async (landmark: string, city: string, country: string): Promise<HistoryData> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Provide history of: ${landmark} in ${city}, ${country}. Return JSON summary, historyPoints, and funFacts.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: historySchema,
      }
    });
    return extractJSON(response.text || "{}") as HistoryData;
  });
};

export const fetchNearbyPlaces = async (landmark: string, city: string, country: string): Promise<NearbyPlace[]> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `5-8 real nearby attractions around: ${landmark} in ${city}, ${country}. Return a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: nearbySchema,
      }
    });
    return extractJSON(response.text || "[]") as NearbyPlace[];
  });
};

export const fetchTopAttractions = async (city: string, country: string): Promise<Attraction[]> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `5-6 top rated tourist attractions in ${city}, ${country}. Return JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: attractionsSchema,
      }
    });
    return extractJSON(response.text || "[]") as Attraction[];
  });
};

export const fetchCulture = async (city: string, country: string): Promise<CultureData> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Cuisine and culture of ${city}, ${country}. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: cultureSchema,
      }
    });
    return extractJSON(response.text || "{}") as CultureData;
  });
};

export const generateItinerary = async (
  landmark: string,
  city: string,
  startTime: string,
  endTime: string,
  numDays: number,
  interests: string[],
  mustVisit: string = "",
  includeHiddenGems: boolean = false
): Promise<ItineraryData> => {
  return withRetry(async () => {
    const prompt = `Plan ${numDays} days in ${city}. Start: ${landmark}. Window: ${startTime}-${endTime}. Interests: ${interests.join(",")}. Hidden Gems: ${includeHiddenGems}. Return JSON.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
      }
    });
    return extractJSON(response.text || "{}") as ItineraryData;
  });
};

export const fetchEvents = async (city: string, country: string): Promise<EventData> => {
  return withRetry(async () => {
    const prompt = `Current events in ${city}, ${country}. Return JSON categories.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => 
      chunk.web?.uri && chunk.web?.title ? { title: chunk.web.title, url: chunk.web.uri } : null
    ).filter((s: any) => s !== null) || [];
    let parsedData = { categories: [] };
    try { parsedData = extractJSON(response.text || "{}"); } catch (e) {}
    return { categories: parsedData.categories || [], sources };
  });
};

export const fetchLogistics = async (city: string, country: string): Promise<LogisticsData> => {
  return withRetry(async () => {
    const prompt = `Transport and hotels in ${city}, ${country}. Return JSON.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    let data: Partial<LogisticsData> = {};
    try { data = extractJSON(response.text || "{}"); } catch (e) {}
    return {
      cabs: data.cabs || [],
      rentals: data.rentals || [],
      hotels: data.hotels || { luxury: [], midRange: [], budget: [] },
    };
  });
};

export const exploreTopic = async (topic: string, context: string, city: string = ""): Promise<DeepDiveData> => {
  return withRetry(async () => {
    const prompt = `Deep dive: "${topic}" in ${city}. Return JSON.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: deepDiveSchema,
      }
    });
    return extractJSON(response.text || "{}") as DeepDiveData;
  });
};

// --- Schemas ---
const landmarkSchema = {
  type: Type.OBJECT,
  properties: {
    landmarkName: { type: Type.STRING },
    alternativeNames: { type: Type.ARRAY, items: { type: Type.STRING } },
    possibleLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
    city: { type: Type.STRING },
    country: { type: Type.STRING },
    confidenceScore: { type: Type.NUMBER },
    description: { type: Type.STRING },
    descriptionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

const historySchema = {
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
      },
    },
    funFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

const nearbySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      placeName: { type: Type.STRING },
      category: { type: Type.STRING },
      distanceKm: { type: Type.NUMBER },
      approxTimeMinutes: { type: Type.NUMBER },
      shortDescription: { type: Type.STRING },
      openingHours: { type: Type.STRING },
    },
  },
};

const attractionsSchema = {
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
  },
};

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    totalDays: { type: Type.NUMBER },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.NUMBER },
          dayTitle: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepTitle: { type: Type.STRING },
                placeName: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                whyVisit: { type: Type.STRING },
                tip: { type: Type.STRING },
                isHiddenGem: { type: Type.BOOLEAN },
              },
            },
          },
        },
      },
    },
  },
};

const cultureSchema = {
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
};

const deepDiveSchema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    details: { type: Type.ARRAY, items: { type: Type.STRING } },
    stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    bestPlaces: { type: Type.ARRAY, items: { type: Type.STRING } },
    relatedInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};
