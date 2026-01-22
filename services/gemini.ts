import { GoogleGenAI } from "@google/genai";
import { TripPlan, PlaceDetails } from "../types";

// Initialize Gemini Client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility to extract JSON from markdown or raw text response
 */
const extractJsonFromText = (text: string): any => {
  try {
    const match = text.match(/```json\s?([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const cleaned = match[1] || match[0];
    return JSON.parse(cleaned.trim());
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
    ? `round trip starting from ${start} to ${end} and returning to ${start}` 
    : `one-way trip from ${start} to ${end}`;

  const prompt = `
    Act as a Deep-Search Cycling Scout. Use Google Search to find "Ghost Places" for a ${routeType} over ${days} days.
    
    CRITICAL SEARCH INSTRUCTIONS:
    1. Search for specific landmarks, ruins, or scenic points that are searchable on Google Maps but have very few reviews.
    2. Preferences: "${preferences}".
    3. IMPORTANT: Every location name MUST be high-precision for Google Maps. ALWAYS include the State and Country. (e.g. "Karikattukuppam Tsunami Ruins, Tamil Nadu, India").
    4. Provide exactly 1 or 2 high-quality points of interest per day. 
    5. Keep the total unique locations across the whole trip to 8 or fewer. This ensures the Google Maps Directions link stays valid.
    
    OUTPUT FORMAT (Raw JSON only):
    {
      "tripName": "string",
      "summary": "Summary of discovery logic.",
      "totalDistance": "string",
      "googleMapsLink": "", 
      "itinerary": [
        {
          "day": number,
          "startLocation": "City, State, Country",
          "endLocation": "City, State, Country",
          "distance": "string",
          "routeDescription": "string",
          "pointsOfInterest": [
            { "name": "Specific Full Name, State, Country", "description": "curator note" }
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
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const plan = extractJsonFromText(text);
    if (!plan) throw new Error("Could not parse trip plan. Please try again with a slightly different route.");

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
    Return details for: "${query}". 
    JSON Format: {"name": string, "rating": number, "address": string, "summary": string}.
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
      summary: "Verification failed." 
    };

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { details, groundingSources };

  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
};