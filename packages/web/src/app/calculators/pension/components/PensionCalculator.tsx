'use client';

import React, { useState, useEffect } from 'react';
import { calculateSATax, NL_AOW_AGE, NL_AOW_MONTHLY_SINGLE } from '../constants';

type Country = 'ZA' | 'NL' | 'DE';

export default function PensionCalculator() {
  const [country, setCountry] = useState<Country>('ZA');
  const [age, setAge] = useState(35);
  const [retireAge, setRetireAge] = useState(65);
  const [currentPot, setCurrentPot] = useState(1000000);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [growthRate, setGrowthRate] = useState(7);
  
  const [projection, setProjection] = useState<{ futureValue: number; monthlyPayout: number; tax: number }>({
    futureValue: 0,
    monthlyPayout: 0,
    tax: 0,
  });

  useEffect(() => {
    const years = retireAge - age;
    if (years <= 0) return;

    const r = (growthRate / 100) / 12;
    const n = years * 12;
    const fv = currentPot * Math.pow(1 + r, n) + monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);

    let monthlyPayout = 0;
    let tax = 0;

    if (country === 'ZA') {
      const lumpSum = fv / 3;
      tax = calculateSATax(lumpSum);
      const remainingPot = (fv * 2) / 3;
      monthlyPayout = (remainingPot * 0.05) / 12;
    } else if (country === 'NL') {
      monthlyPayout = (fv * 0.04) / 12;
      if (retireAge >= NL_AOW_AGE) {
        monthlyPayout += NL_AOW_MONTHLY_SINGLE;
      }
    } else {
      monthlyPayout = (fv * 0.04) / 12;
    }

    setProjection({ futureValue: fv, monthlyPayout, tax });
  }, [country, age, retireAge, currentPot, monthlyContribution, growthRate]);

  const currencySymbol = country === 'ZA' ? 'R' : '€';

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-white">Pension Forecaster</h2>
        <select 
          value={country} 
          onChange={(e) => setCountry(e.target.value as Country)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700"
        >
          <option value="ZA">🇿🇦 South Africa</option>
          <option value="NL">🇳🇱 Netherlands</option>
          <option value="DE">🇩🇪 Germany</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label className="block text-slate-400 text-sm mb-2 uppercase tracking-wider">Current Age: {age}</label>
            <input type="range" min="18" max="75" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2 uppercase tracking-wider">Retirement Age: {retireAge}</label>
            <input type="range" min={age + 1} max="85" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2 uppercase tracking-wider">Current Pot ({currencySymbol})</label>
            <input type="number" value={currentPot} onChange={(e) => setCurrentPot(Number(e.target.value))} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2 uppercase tracking-wider">Monthly Contribution ({currencySymbol})</label>
            <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Projected Nest Egg</p>
            <p className="text-4xl font-bold text-white mb-6">
              {currencySymbol}{projection.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            
            <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Projected Monthly Income</p>
            <p className="text-5xl font-bold text-amber-500">
              {currencySymbol}{projection.monthlyPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            {country === 'ZA' && (
              <p className="text-sm text-slate-400 italic">
                💡 SARS will take roughly <span className="text-red-400 font-semibold">{currencySymbol}{projection.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> from your 1/3 lump sum payout.
              </p>
            )}
            {country === 'NL' && retireAge < NL_AOW_AGE && (
              <p className="text-sm text-amber-400 italic">
                ⚠️ You&apos;re retiring before AOW kicks in ({NL_AOW_AGE}). You&apos;ll have a shortfall of €{NL_AOW_MONTHLY_SINGLE.toLocaleString()}/mo until then.
              </p>
            )}
            {country === 'NL' && retireAge >= NL_AOW_AGE && (
              <p className="text-sm text-emerald-400 italic">
                ✅ Including full AOW (€{NL_AOW_MONTHLY_SINGLE.toLocaleString()}/mo).
              </p>
            )}
            {country === 'DE' && (
              <p className="text-sm text-slate-400 italic">
                💡 Based on a 4% drawdown rule. Upload your Rentenbescheid for a more accurate forecast.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <a href="/register" className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl uppercase tracking-widest">
          Secure This Forecast in My Vault
        </a>
        <p className="text-slate-500 text-xs mt-4 italic">No login required to calculate. Pro features unlock auto-updates and PDF parsing.</p>
      </div>
    </div>
  );
}
