import { GoogleGenAI } from "@google/genai";
import { TripPlan, PlaceDetails } from "../types";

// Initialize Gemini Client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJsonFromText = (text: string): any => {
  // 1. Try direct parsing (Standard for responseMimeType: 'application/json')
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to fallback methods if direct parse fails
  }

  try {
    // 2. Try finding a markdown block
    const markdownMatch = text.match(/```json\s?([\s\S]*?)```/);
    if (markdownMatch) {
      return JSON.parse(markdownMatch[1].trim());
    }

    // 3. Try finding the raw JSON object structure manually
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
    ? `loop starting and ending in ${start}, turning around at or visiting ${end}` 
    : `one-way expedition from ${start} to ${end}`;

  // Updated Persona to be a Professional Cycling Adventure Planner
  const prompt = `
    Act as a World-Class Professional Cycling Adventure Planner.
    Plan a solo bike trip: "${routeType}" for ${days} days.
    
    USER PREFERENCES: "${preferences}"

    CORE MISSION:
    Create a safe yet adventurous route. Balance scenic beauty with cycling practicality.
    Focus on: Quiet backroads, scenic byways, bike-friendly infrastructure, and interesting cultural or natural stops.
    
    CONSTRAINTS:
    1. **Realism**: Max ~80-100km/day (unless preferences imply elite fitness).
    2. **Precision**: All location names must be real and searchable on Google Maps (include City, State).
    3. **Route Link Safety**: Keep major waypoints clear to ensure Google Maps compatibility.
    4. **Output**: STRICTLY JSON.

    JSON STRUCTURE:
    {
      "tripName": "Inspiring Trip Title",
      "summary": "Professional summary of the route, terrain, and highlights.",
      "totalDistance": "Total km",
      "googleMapsLink": "", 
      "itinerary": [
        {
          "day": number,
          "startLocation": "City, State",
          "endLocation": "City, State",
          "distance": "string",
          "routeDescription": "Description of the ride (elevation, road quality, scenery).",
          "pointsOfInterest": [
            { 
              "name": "Searchable Landmark Name, State", 
              "description": "Why stop here?",
              "tags": ["Nature", "Cafe", "Viewpoint", "History"] 
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const plan = extractJsonFromText(text);
    if (!plan) throw new Error("Failed to parse the mission plan. Please try again.");

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
    Return JSON: {"name": string, "rating": number, "address": string, "summary": "Short helpful description."}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        responseMimeType: 'application/json',
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