import React, { useState } from 'react';
import { generateTripItinerary } from './services/gemini';
import { TripPlan, TripRequest } from './types';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { Bike, MapPin, Calendar, Loader, ArrowRight, Flag, Repeat, Heart, Compass } from 'lucide-react';

const App = () => {
  const [request, setRequest] = useState<TripRequest>({
    startLocation: '',
    destination: '',
    days: 3,
    isRoundTrip: false,
    preferences: ''
  });
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.startLocation || !request.destination) return;
    
    setLoading(true);
    setError(null);
    setPlan(null);
    
    try {
      const result = await generateTripItinerary(
        request.startLocation,
        request.destination,
        request.days,
        request.isRoundTrip,
        request.preferences
      );
      setPlan(result.plan);
      setGroundingSources(result.groundingSources);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to uncover hidden gems. This usually happens if the route is too remote or the AI timed out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPlan(null)}>
              <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">VeloVenture</span>
            </div>
            {plan && (
              <button 
                onClick={() => setPlan(null)}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-full"
              >
                New Search
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 px-4 max-w-7xl mx-auto">
        {!plan && (
          <div className="max-w-lg mx-auto mt-6 md:mt-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Discover the <span className="text-blue-600">Unmapped</span>
              </h1>
              <p className="text-lg text-slate-600">
                A "Deep Scan" planner targeting nameless overlooks, ghost towns, and hidden cycling trails.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Starting Point</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Big Sur, CA"
                      className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50/50"
                      value={request.startLocation}
                      onChange={(e) => setRequest({ ...request, startLocation: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Destination</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Flag className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tahoe, CA"
                      className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50/50"
                      value={request.destination}
                      onChange={(e) => setRequest({ ...request, destination: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                    <div className="flex items-center gap-2">
                       <Repeat className={`w-4 h-4 ${request.isRoundTrip ? 'text-blue-600' : 'text-slate-400'}`} />
                       <span className="text-sm font-semibold text-slate-700">Make it a loop?</span>
                    </div>
                    <button 
                      type="button" 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${request.isRoundTrip ? 'bg-blue-600' : 'bg-slate-300'}`}
                      onClick={() => setRequest({ ...request, isRoundTrip: !request.isRoundTrip })}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${request.isRoundTrip ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Curator's Notes</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Heart className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="e.g. 'I want to avoid asphalt, find hidden swimming holes, and see abandoned mines.'"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none bg-slate-50/50"
                      value={request.preferences}
                      onChange={(e) => setRequest({ ...request, preferences: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration (Days)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        required
                        className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-slate-50/50 text-center font-bold"
                        value={request.days}
                        onChange={(e) => setRequest({ ...request, days: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-3 h-6 w-6" />
                      Deep Scanning...
                    </>
                  ) : (
                    <>
                      Start Discovery <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                  )}
                </button>
              </form>
            </div>
            
             {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-shake">
                {error}
              </div>
            )}
          </div>
        )}

        {plan && <ItineraryDisplay plan={plan} groundingSources={groundingSources} />}
        
        {loading && plan === null && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6">
             <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-md w-full text-center border border-white/20">
                <div className="relative mb-8">
                   <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                   <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full shadow-lg">
                      <Compass className="w-10 h-10 text-white animate-[spin_4s_linear_infinite]" />
                   </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Investigating the Shadows...</h3>
                <div className="space-y-4 text-slate-500 font-medium text-lg">
                  <p className="animate-pulse">Scouring cycling forum archives (1998-present)...</p>
                  <p className="animate-pulse delay-75">Parsing topographic anomalies for hidden springs...</p>
                  <p className="animate-pulse delay-150">Filtering for stops with 0 reviews...</p>
                  <p className="text-blue-500 text-sm font-bold uppercase tracking-widest pt-4">Constructing Multi-Stop Route Map</p>
                </div>
                <div className="mt-10 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-600 h-full animate-[loading_4s_ease-in-out_infinite]"></div>
                </div>
             </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;