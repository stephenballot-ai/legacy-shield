import React from 'react';
import PensionCalculator from './components/PensionCalculator';

export default function PensionPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Will your future self afford your current lifestyle?</h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed italic">
          3 minutes to see your monthly payout at 60, 65, and 70. No spreadsheets. No login. Just clarity.
        </p>
      </div>
      
      <PensionCalculator />
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto text-white">
        <div className="p-8 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h3 className="text-xl font-bold mb-4">🇿🇦 South Africa</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Includes the latest SARS 2024 retirement lump sum tax tables and the 1/3 compulsory annuity rules.
          </p>
        </div>
        <div className="p-8 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h3 className="text-xl font-bold mb-4">🇳🇱 Netherlands</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Calculates your AOW gap if you retire early. Includes current single-person AOW rates (€1,459/mo).
          </p>
        </div>
        <div className="p-8 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h3 className="text-xl font-bold mb-4">🇩🇪 Germany</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Estimates your Rentenbescheid based on standard pension point values and expected growth.
          </p>
        </div>
      </div>
    </div>
  );
}
