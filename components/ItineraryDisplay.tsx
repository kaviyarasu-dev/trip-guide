import React, { useState, useMemo } from 'react';
import { TripPlan } from '../types';
import { PlaceCard } from './PlaceCard';
import { Map, ChevronDown, ChevronUp, Navigation, Flag, Sparkles } from 'lucide-react';
import { GroundingSources } from './GroundingSources';

interface Props {
  plan: TripPlan;
  groundingSources: any[];
}

export const ItineraryDisplay: React.FC<Props> = ({ plan, groundingSources }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  /**
   * Programmatically build the entire trip route URL using the official Google Maps API v1 structure.
   */
  const fullRouteMapsUrl = useMemo(() => {
    const stops: string[] = [];
    
    if (plan.itinerary.length > 0) {
      // 1. Initial Start
      stops.push(plan.itinerary[0].startLocation);
      
      // 2. Intermediate Waypoints
      plan.itinerary.forEach(day => {
        day.pointsOfInterest.forEach(poi => stops.push(poi.name));
        stops.push(day.endLocation);
      });
    }

    // Filter out duplicates while preserving order
    const uniqueStops = stops.reduce((acc: string[], curr: string) => {
      const trimmed = curr.trim();
      if (trimmed && !acc.includes(trimmed)) {
        acc.push(trimmed);
      }
      return acc;
    }, []);

    if (uniqueStops.length < 2) return "";

    const origin = uniqueStops[0];
    const destination = uniqueStops[uniqueStops.length - 1];
    
    // Waypoints are the stops in between the origin and destination.
    // Standard Google Maps URLs handle up to 8-9 stops reliably.
    const waypoints = uniqueStops.slice(1, -1).slice(0, 8);

    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const originParam = `&origin=${encodeURIComponent(origin)}`;
    const destParam = `&destination=${encodeURIComponent(destination)}`;
    const waypointsParam = waypoints.length > 0 
      ? `&waypoints=${waypoints.map(w => encodeURIComponent(w)).join('|')}` 
      : "";
    
    // We omit travelmode=bicycling because many regions lack biking data,
    // which leads to the "Cannot seem to find a way there" error.
    return `${baseUrl}${originParam}${destParam}${waypointsParam}`;
  }, [plan.itinerary]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      {/* Trip Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-400 font-bold tracking-widest uppercase text-xs mb-4">
            <Sparkles className="w-4 h-4" /> Deep Scan Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{plan.tripName}</h1>
          <p className="text-blue-100/80 text-lg mb-8 max-w-2xl leading-relaxed font-medium">
            {plan.summary}
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm">
              <Flag className="w-4 h-4 text-blue-400" /> {plan.totalDistance}
            </div>
            
            <a 
              href={fullRouteMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 font-bold active:scale-95"
            >
              <Map className="w-5 h-5" /> Open Complete Route Map
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
             <GroundingSources sources={groundingSources} title="Data Sources" />
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 px-2 flex items-center gap-2">
           Daily Discovery Log
        </h2>
        {plan.itinerary.map((day) => (
          <div key={day.day} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <button 
              onClick={() => toggleDay(day.day)}
              className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
            >
              <div className="flex items-center gap-5">
                <div className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg">
                  <span className="text-[10px] uppercase opacity-60 leading-none mb-0.5">Day</span>
                  <span className="text-xl leading-none">{day.day}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {day.startLocation.split(',')[0]} <Navigation className="w-4 h-4 text-blue-500 rotate-90" /> {day.endLocation.split(',')[0]}
                  </h3>
                  <p className="text-slate-500 font-semibold text-sm">{day.distance}</p>
                </div>
              </div>
              {expandedDay === day.day ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>

            {expandedDay === day.day && (
              <div className="p-6 md:p-8 border-t border-slate-100 space-y-8">
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <Map className="w-4 h-4" /> Scout Report
                  </h4>
                  <p className="text-slate-700 text-base leading-relaxed font-medium">{day.routeDescription}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 px-1">
                       <Sparkles className="w-5 h-5 text-purple-600" /> Ghost Stops
                    </h4>
                    <div className="space-y-4">
                      {day.pointsOfInterest.map((poi, idx) => (
                        <PlaceCard 
                          key={idx} 
                          name={poi.name} 
                          curatorNote={poi.description} 
                          type="poi" 
                          label={`Ghost Stop ${idx + 1}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="font-bold text-slate-900 flex items-center gap-2 px-1">
                       Sanctuary
                    </h4>
                    <PlaceCard name={day.accommodation} type="accommodation" label="Rest Location" />
                    
                    <div className="mt-8">
                       <h4 className="font-bold text-slate-900 mb-4 px-1">Provisioning</h4>
                       <div className="space-y-3">
                         <PlaceCard name={day.meals.breakfast} type="food" label="Breakfast" />
                         <PlaceCard name={day.meals.lunch} type="food" label="Lunch" />
                         <PlaceCard name={day.meals.dinner} type="food" label="Dinner" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};