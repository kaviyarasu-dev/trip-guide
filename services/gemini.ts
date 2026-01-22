import { GoogleGenAI } from "@google/genai";
import { TripPlan, PlaceDetails } from "../types";

// Initialize Gemini Client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility to extract JSON from markdown or raw text response
 */
const extractJsonFromText = (text: string): any => {
  try {
    // Attempt to find JSON inside markdown code blocks first
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
    Act as a Deep-Search Cycling Scout. Use Google Search to find "Ghost Places" (0-5 reviews, niche forum mentions, or nameless vista points) for a ${routeType} over ${days} days.
    
    CRITICAL INSTRUCTIONS:
    1. Search for places that NO ONE expects. Cross-reference niche cycling blogs and satellite views.
    2. Preferences: "${preferences}".
    3. The Google Maps URL MUST include the Start, Destination, AND every single hidden gem discovered as intermediate waypoints in a directions link.
    
    OUTPUT FORMAT (Raw JSON only):
    {
      "tripName": "string",
      "summary": "string explaining why these spots were hidden",
      "totalDistance": "string",
      "googleMapsLink": "https://www.google.com/maps/dir/Start/Hidden1/Hidden2/.../End",
      "itinerary": [
        {
          "day": number,
          "startLocation": "string",
          "endLocation": "string",
          "distance": "string",
          "routeDescription": "string",
          "pointsOfInterest": [{ "name": "string", "description": "curator note" }],
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
        // responseMimeType and responseSchema are NOT allowed with grounding tools
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const plan = extractJsonFromText(text);
    if (!plan) throw new Error("Could not parse trip plan from AI response.");

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
    If it has 0 reviews, describe its physical location based on Maps data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // responseMimeType and responseSchema are NOT allowed with grounding tools
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const details = extractJsonFromText(text) || { 
      name: query, 
      summary: text.length < 200 ? text : "Could not verify exact details." 
    };

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { details, groundingSources };

  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
};