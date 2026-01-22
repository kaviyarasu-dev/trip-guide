import React, { useState } from 'react';
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      {/* Trip Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{plan.tripName}</h1>
        <p className="text-blue-100 text-lg mb-6 leading-relaxed">{plan.summary}</p>
        
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <Flag className="w-4 h-4" /> {plan.totalDistance}
          </div>
          <a 
            href={plan.googleMapsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-lg"
          >
            <Map className="w-4 h-4" /> Open Map (with Hidden Gems)
          </a>
        </div>
        
        {/* Main plan sources (Search) */}
        <div className="mt-4 opacity-75">
           <GroundingSources sources={groundingSources} title="Planned with Google Search" />
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {plan.itinerary.map((day) => (
          <div key={day.day} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <button 
              onClick={() => toggleDay(day.day)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {day.day}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {day.startLocation} <Navigation className="w-4 h-4 text-slate-400" /> {day.endLocation}
                  </h3>
                  <p className="text-slate-500 text-sm">{day.distance}</p>
                </div>
              </div>
              {expandedDay === day.day ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>

            {expandedDay === day.day && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                
                {/* Route Description */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                    <Map className="w-4 h-4" /> Route Highlights
                  </h4>
                  <p className="text-blue-900/80 text-sm leading-relaxed">{day.routeDescription}</p>
                </div>

                {/* Logistics Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Points of Interest - Now with Curator Notes */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-purple-600" /> Curated Experiences
                    </h4>
                    <div className="space-y-3">
                      {day.pointsOfInterest.map((poi, idx) => (
                        <PlaceCard 
                          key={idx} 
                          name={poi.name} 
                          curatorNote={poi.description} 
                          type="poi" 
                          label={`Unique Stop ${idx + 1}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div>
                     <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                       Rest for the Night
                    </h4>
                    <PlaceCard name={day.accommodation} type="accommodation" label="Accommodation" />
                  </div>
                </div>

                {/* Food Section */}
                <div>
                   <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      Local Eats
                   </h4>
                   <div className="grid md:grid-cols-3 gap-4">
                     <PlaceCard name={day.meals.breakfast} type="food" label="Breakfast" />
                     <PlaceCard name={day.meals.lunch} type="food" label="Lunch" />
                     <PlaceCard name={day.meals.dinner} type="food" label="Dinner" />
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