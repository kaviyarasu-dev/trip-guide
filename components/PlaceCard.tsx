import React, { useState } from 'react';
import { MapPin, Star, Info, Loader2, Sparkles } from 'lucide-react';
import { getPlaceDetails } from '../services/gemini';
import { PlaceDetails } from '../types';
import { GroundingSources } from './GroundingSources';

interface Props {
  name: string;
  type: 'food' | 'accommodation' | 'poi';
  label: string;
  curatorNote?: string;
}

export const PlaceCard: React.FC<Props> = ({ name, type, label, curatorNote }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCheckDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPlaceDetails(name);
      setDetails(result.details);
      setSources(result.groundingSources);
    } catch (e) {
      setError("Could not verify details.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'food': return <span className="text-orange-500">🍽️</span>;
      case 'accommodation': return <span className="text-indigo-500">🛌</span>;
      case 'poi': return <span className="text-emerald-500">📸</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
             {curatorNote && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Curated</span>}
          </div>
          <p className="text-slate-900 font-medium">{getIcon()} {name}</p>
          
          {curatorNote && (
            <div className="mt-2 text-sm text-slate-600 italic bg-slate-50 p-2 rounded-md border border-slate-100 flex gap-2 items-start">
               <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
               <span>{curatorNote}</span>
            </div>
          )}
        </div>
        
        {!details && !loading && (
          <button
            onClick={handleCheckDetails}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-full transition-colors ml-2 shrink-0"
            title="Verify with Google Maps"
          >
            <MapPin className="w-3 h-3" /> Check Info
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Verifying with Google Maps...
        </div>
      )}

      {details && (
        <div className="mt-3 bg-slate-50 p-2 rounded text-sm animate-in fade-in zoom-in duration-300">
           {details.rating && (
            <div className="flex items-center gap-1 text-yellow-600 font-bold mb-1">
              <Star className="w-3 h-3 fill-current" /> {details.rating} / 5
            </div>
          )}
          <p className="text-slate-700 leading-relaxed text-xs">{details.summary}</p>
          {details.address && (
            <p className="text-slate-500 text-xs mt-1 italic flex items-start gap-1">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {details.address}
            </p>
          )}
          <GroundingSources sources={sources} title="Maps Data" />
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};