import React, { useState, useMemo } from 'react';
import { TripPlan } from '../types';
import { PlaceCard } from './PlaceCard';
import { Map, ChevronDown, ChevronUp, Navigation, Flag, Sparkles, Mountain, AlertTriangle } from 'lucide-react';
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
    
    // Google Maps allows limited waypoints in the URL structure.
    // We prioritize the POIs as waypoints.
    const waypoints = uniqueStops.slice(1, -1).slice(0, 9); // Safe limit

    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const originParam = `&origin=${encodeURIComponent(origin)}`;
    const destParam = `&destination=${encodeURIComponent(destination)}`;
    const waypointsParam = waypoints.length > 0 
      ? `&waypoints=${waypoints.map(w => encodeURIComponent(w)).join('|')}` 
      : "";
    
    // CRITICAL FIX: Removed `travelmode=bicycling`.
    // Why? Google Maps throws "Cannot find a way there" if even 1km of the route 
    // forces a highway where bikes are technically restricted (common in India/US).
    // Letting the user/app choose the mode is safer for functionality.
    return `${baseUrl}${originParam}${destParam}${waypointsParam}`;
  }, [plan.itinerary]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      {/* Trip Header */}
      <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-purple-400 font-bold tracking-widest uppercase text-[10px] mb-4 border border-purple-500/30 inline-block px-3 py-1 rounded-full bg-purple-500/10">
            <Sparkles className="w-3 h-3" /> Deep Scan Complete
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">{plan.tripName}</h1>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl leading-relaxed font-medium">
            {plan.summary}
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-sm text-slate-200">
              <Flag className="w-4 h-4 text-purple-400" /> {plan.totalDistance}
            </div>
            
            <a 
              href={fullRouteMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] font-bold active:scale-95 group"
            >
              <Map className="w-5 h-5 group-hover:scale-110 transition-transform" /> Open Route Map
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
             <GroundingSources sources={groundingSources} title="Intelligence Sources" />
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 px-2">
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Expedition Log</h2>
           <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        {plan.itinerary.map((day) => (
          <div key={day.day} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
            <button 
              onClick={() => toggleDay(day.day)}
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-6">
                <div className="bg-slate-100 text-slate-900 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <span className="text-[9px] uppercase opacity-60 leading-none mb-1">Day</span>
                  <span className="text-2xl leading-none">{day.day}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    {day.startLocation.split(',')[0]} <Navigation className="w-4 h-4 text-slate-400 rotate-90" /> {day.endLocation.split(',')[0]}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">{day.distance}</p>
                </div>
              </div>
              {expandedDay === day.day ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>

            {expandedDay === day.day && (
              <div className="p-6 md:p-8 border-t border-slate-100 space-y-10 animate-in fade-in duration-500">
                
                {/* Terrain/Route Report */}
                <div className="relative pl-6 border-l-4 border-slate-200">
                  <h4 className="text-slate-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                    <Mountain className="w-4 h-4" /> Terrain Report
                  </h4>
                  <p className="text-slate-800 text-lg leading-relaxed font-serif italic">"{day.routeDescription}"</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Points of Interest (Takes up 3 columns) */}
                  <div className="lg:col-span-3 space-y-6">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 px-1 text-sm uppercase tracking-wide">
                       <AlertTriangle className="w-4 h-4 text-orange-500" /> Anomalies & Ruins
                    </h4>
                    <div className="grid gap-4">
                      {day.pointsOfInterest.map((poi, idx) => (
                        <PlaceCard 
                          key={idx} 
                          name={poi.name} 
                          curatorNote={poi.description} 
                          tags={poi.tags}
                          type="poi" 
                          label={`Target ${idx + 1}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Logistics (Takes up 2 columns) */}
                  <div className="lg:col-span-2 space-y-6">
                     <h4 className="font-bold text-slate-900 flex items-center gap-2 px-1 text-sm uppercase tracking-wide">
                       Logistics
                    </h4>
                    <PlaceCard name={day.accommodation} type="accommodation" label="Camp / Shelter" />
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                       <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-2">Refuel Points</h5>
                       <PlaceCard name={day.meals.breakfast} type="food" label="AM" />
                       <PlaceCard name={day.meals.lunch} type="food" label="Noon" />
                       <PlaceCard name={day.meals.dinner} type="food" label="PM" />
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