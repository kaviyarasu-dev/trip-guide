import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Props {
  sources: any[];
  title?: string;
}

export const GroundingSources: React.FC<Props> = ({ sources, title = "Sources" }) => {
  if (!sources || sources.length === 0) return null;

  // Extract web URIs and Maps URIs
  const validSources = sources
    .map((chunk, idx) => {
      if (chunk.web) return { type: 'web', ...chunk.web, key: idx };
      if (chunk.maps) return { type: 'maps', ...chunk.maps, key: idx }; // Maps specific source
      return null;
    })
    .filter(Boolean);

  if (validSources.length === 0) return null;

  return (
    <div className="mt-4 text-xs text-slate-500 border-t border-slate-200 pt-2">
      <span className="font-semibold uppercase tracking-wider mr-2">{title}:</span>
      <div className="inline-flex flex-wrap gap-2">
        {validSources.slice(0, 5).map((source: any) => (
          <a
            key={source.key}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-blue-600 transition-colors bg-slate-100 px-2 py-1 rounded-md"
          >
            {source.title || source.uri?.split('/')[2] || "Source"}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        ))}
      </div>
    </div>
  );
};
