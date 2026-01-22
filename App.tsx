import React, { useState } from 'react';
import { generateTripItinerary } from './services/gemini';
import { TripPlan, TripRequest } from './types';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { 
  Bike, 
  MapPin, 
  Calendar, 
  Navigation, 
  Settings,
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<TripRequest>({
    startLocation: '',
    destination: '',
    days: 3,
    isRoundTrip: false,
    preferences: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startLocation || !formData.destination) return;

    setLoading(true);
    try {
      const result = await generateTripItinerary(
        formData.startLocation,
        formData.destination,
        formData.days,
        formData.isRoundTrip,
        formData.preferences
      );
      setTripPlan(result.plan);
      setGroundingSources(result.groundingSources);
    } catch (error) {
      console.error(error);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTripPlan(null);
    setGroundingSources([]);
  };

  if (tripPlan) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
         <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                <Bike size={20} />
              </div>
              <span>VeloVenture</span>
            </div>
            <button 
              onClick={handleReset}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={16} /> New Plan
            </button>
         </nav>
         <ItineraryDisplay plan={tripPlan} groundingSources={groundingSources} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Bike className="w-6 h-6" />
              </div>
              <h1 className="font-bold text-xl">VeloVenture</h1>
            </div>
            <p className="text-slate-400 text-sm">Professional Solo Cycling Planner</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          
          <div className="space-y-4">
            <div className="relative group">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                required
                placeholder="Starting Location (e.g. Portland, OR)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                value={formData.startLocation}
                onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
              />
            </div>

            <div className="relative group">
              <Navigation className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                required
                placeholder="Destination or Turnaround"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  placeholder="Days"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                  value={formData.days}
                  onChange={(e) => setFormData({...formData, days: parseInt(e.target.value) || 1})}
                />
              </div>

              <div className="flex items-center justify-center">
                 <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isRoundTrip}
                    onChange={(e) => setFormData({...formData, isRoundTrip: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-slate-800">Round Trip</span>
                </label>
              </div>
            </div>

            <div className="relative group">
              <Settings className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
              <textarea
                rows={3}
                placeholder="Preferences (e.g. scenic backroads, cheap motels, avoid highways...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium resize-none"
                value={formData.preferences}
                onChange={(e) => setFormData({...formData, preferences: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span>Planning Route...</span>
              </>
            ) : (
              <>
                <span>Generate Itinerary</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default App;