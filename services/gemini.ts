import { GoogleGenAI } from "@google/genai";
import { TripPlan, PlaceDetails } from "../types";

// Initialize Gemini Client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJsonFromText = (text: string): any => {
  try {
    // 1. Try finding a markdown block
    const markdownMatch = text.match(/```json\s?([\s\S]*?)```/);
    if (markdownMatch) {
      return JSON.parse(markdownMatch[1].trim());
    }

    // 2. Try finding the raw JSON object structure
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }

    return null;
  } catch (e) {
    console.error("JSON Extraction failed", e);
    return null;
  }
};

export const generateTripItinerary = async (
  start: string,
  end: string,
  days: number,
  isRoundTrip: boolean,
  preferences: string
): Promise<{ plan: TripPlan; groundingSources: any[] }> => {
  const ai = getAiClient();
  
  const routeType = isRoundTrip 
    ? `loop starting and ending in ${start}, turning around at ${end}` 
    : `one-way expedition from ${start} to ${end}`;

  // Using gemini-2.5-flash for faster generation latency while maintaining good reasoning
  const prompt = `
    Act as an Investigative Journalist and Extreme Cyclist.
    Plan a "${routeType}" for ${days} days.
    
    USER PREFERENCES: "${preferences}"

    CORE MISSION:
    Find "The Invisible Layer" of the map. No tourist traps. 
    Focus on: Abandoned Infrastructure, Geological Oddities, Local Mythology, and nameless scenic overlooks.
    
    CONSTRAINTS:
    1. **Realism**: Max 100km/day. 
    2. **Precision**: All location names must be searchable on Google Maps (include City/State).
    3. **Route Link Safety**: Total unique stops must be under 9 to keep the Google Maps link valid.
    4. **Output**: STRICTLY VALID JSON. No conversational filler.

    JSON STRUCTURE:
    {
      "tripName": "Mysterious Title",
      "summary": "Exciting summary of the hidden gems found.",
      "totalDistance": "Total km",
      "googleMapsLink": "", 
      "itinerary": [
        {
          "day": number,
          "startLocation": "City, State",
          "endLocation": "City, State",
          "distance": "string",
          "routeDescription": "Vivid description of the terrain and vibe.",
          "pointsOfInterest": [
            { 
              "name": "Searchable Landmark Name, State", 
              "description": "Why is this extraordinary?",
              "tags": ["Ruins", "Nature", "Eerie"] 
            }
          ],
          "meals": { "breakfast": "string", "lunch": "string", "dinner": "string" },
          "accommodation": "string"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const plan = extractJsonFromText(text);
    if (!plan) throw new Error("Failed to parse the mission plan. Please try a shorter route or different location.");

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { plan, groundingSources };

  } catch (error) {
    console.error("Error generating trip:", error);
    throw error;
  }
};

export const getPlaceDetails = async (query: string): Promise<{ details: PlaceDetails; groundingSources: any[] }> => {
  const ai = getAiClient();
  
  const prompt = `
    Get details for: "${query}".
    Return JSON: {"name": string, "rating": number, "address": string, "summary": "Short reality check description."}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    const details = extractJsonFromText(text) || { 
      name: query, 
      summary: "Location data sparse. Proceed with caution." 
    };

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { details, groundingSources };

  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
};