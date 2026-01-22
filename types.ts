export interface TripRequest {
  startLocation: string;
  destination: string;
  days: number;
  isRoundTrip: boolean;
  preferences: string;
}

export interface PointOfInterest {
  name: string;
  description: string;
  tags: string[]; // e.g., "Ruins", "Danger", "Viewpoint"
}

export interface DayItinerary {
  day: number;
  startLocation: string;
  endLocation: string;
  distance: string;
  routeDescription: string;
  pointsOfInterest: PointOfInterest[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}

export interface TripPlan {
  tripName: string;
  summary: string;
  totalDistance: string;
  googleMapsLink: string;
  itinerary: DayItinerary[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface PlaceDetails {
  name: string;
  rating?: number;
  address?: string;
  summary?: string;
}