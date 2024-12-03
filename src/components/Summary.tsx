import React from 'react';
import { Clock, List, FileText } from 'lucide-react';
import { VideoSummary } from '../types';

interface SummaryProps {
  data: VideoSummary;
}

export function Summary({ data }: SummaryProps) {
  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText size={24} className="text-blue-500" />
          Summary
        </h2>
        <p className="text-gray-300 leading-relaxed">{data.summary}</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={24} className="text-blue-500" />
          Key Moments
        </h2>
        <div className="space-y-4">
          {data.keyMoments.map((moment, index) => (
            <div key={index} className="flex items-start gap-4">
              <span className="text-blue-500 font-mono">{moment.timestamp}</span>
              <p className="text-gray-300">{moment.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <List size={24} className="text-blue-500" />
          Step-by-Step Instructions
        </h2>
        <ol className="list-decimal list-inside space-y-2">
          {data.steps.map((step, index) => (
            <li key={index} className="text-gray-300">{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}