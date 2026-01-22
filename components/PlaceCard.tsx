import React, { useState } from 'react';
import { MapPin, Star, Loader2, Sparkles, Tag } from 'lucide-react';
import { getPlaceDetails } from '../services/gemini';
import { PlaceDetails } from '../types';
import { GroundingSources } from './GroundingSources';

interface Props {
  name: string;
  type: 'food' | 'accommodation' | 'poi';
  label: string;
  curatorNote?: string;
  tags?: string[];
}

export const PlaceCard: React.FC<Props> = ({ name, type, label, curatorNote, tags }) => {
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
      setError("Location verification unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'food': return <span className="text-xl">🥘</span>;
      case 'accommodation': return <span className="text-xl">🛖</span>;
      case 'poi': return <span className="text-xl">🗺️</span>;
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{label}</span>
             {tags && tags.map((tag, i) => (
               <span key={i} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1">
                 <Tag className="w-3 h-3" /> {tag}
               </span>
             ))}
          </div>

          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {getIcon()} {name}
          </h4>
          
          {curatorNote && (
            <div className="text-sm text-slate-600 leading-relaxed pl-3 border-l-2 border-purple-300">
               {curatorNote}
            </div>
          )}
        </div>
        
        {!details && !loading && (
          <button
            onClick={handleCheckDetails}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-slate-200"
            title="Verify location on Map"
          >
            <MapPin className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3 h-3 animate-spin" /> Retrieving satellite data...
        </div>
      )}

      {details && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
           <div className="flex justify-between items-start mb-2">
              <h5 className="text-sm font-bold text-slate-900">{details.name}</h5>
              {details.rating && (
                <div className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-current" /> {details.rating}
                </div>
              )}
           </div>
          <p className="text-slate-600 text-xs leading-relaxed mb-2">{details.summary}</p>
          {details.address && (
            <p className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {details.address}
            </p>
          )}
          <div className="mt-2">
            <GroundingSources sources={sources} title="Validated Via" />
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">{error}</p>
      )}
    </div>
  );
};