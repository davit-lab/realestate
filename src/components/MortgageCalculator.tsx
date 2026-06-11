import React, { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice: number;
  currency: 'GEL' | 'USD';
  className?: string;
}

export default function MortgageCalculator({ propertyPrice, currency, className = '' }: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(currency === 'GEL' ? 12 : 8);
  const currencySymbol = currency === 'GEL' ? '₾' : '$';

  const { downPayment, loanPrincipal, monthlyPayment, totalInterest, totalMonths } = useMemo(() => {
    const dp = (propertyPrice * downPaymentPercent) / 100;
    const lp = Math.max(propertyPrice - dp, 0);
    const mr = (rate / 100) / 12;
    const tm = years * 12;
    let mp = 0;
    if (lp > 0) {
      mp = mr > 0
        ? (lp * mr * Math.pow(1 + mr, tm)) / (Math.pow(1 + mr, tm) - 1)
        : lp / tm;
    }
    const ti = Math.max(mp * tm - lp, 0);
    return { downPayment: dp, loanPrincipal: lp, monthlyPayment: mp, totalInterest: ti, totalMonths: tm };
  }, [propertyPrice, downPaymentPercent, years, rate]);

  if (!propertyPrice || propertyPrice <= 0) return null;

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Calculator size={14} className="text-ss-primary" />
        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">იპოთეკური კალკულატორი</h4>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-100 dark:border-gray-700 rounded-xl mb-4 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">ქონების ფასი:</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
          {propertyPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} {currencySymbol}
        </span>
      </div>

      <div className="space-y-4">
        {/* Down payment */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">თანამონაწილეობა:</span>
            <span className="text-ss-primary font-semibold">
              {downPaymentPercent}% · {Math.round(downPayment).toLocaleString('en-US')} {currencySymbol}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
            style={{ accentColor: '#7C3AED' }}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>10%</span><span>80%</span>
          </div>
        </div>

        {/* Term */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500 dark:text-gray-400">სესხის ვადა:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{years} წელი</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[5, 10, 15, 20].map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setYears(yr)}
                className={`py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  years === yr
                    ? 'bg-ss-primary text-white border-ss-primary'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {yr}წ.
              </button>
            ))}
          </div>
        </div>

        {/* Rate */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500 dark:text-gray-400">საპროცენტო განაკვეთი:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{rate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRate(p => Math.max(p - 0.5, 1))}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer transition-colors"
            >
              -
            </button>
            <div className="flex-1 text-center font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-2 text-sm rounded-xl text-gray-900 dark:text-gray-100">
              {rate}%
            </div>
            <button
              type="button"
              onClick={() => setRate(p => Math.min(p + 0.5, 25))}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer transition-colors"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">GEL 10-14% / USD 7-9%</p>
        </div>

        {/* Result */}
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-xl p-4 text-center">
          <span className="text-xs text-ss-primary font-medium uppercase tracking-wide block mb-1">ყოველთვიური გადასახადი</span>
          <div className="flex items-baseline justify-center gap-1.5 my-1">
            <span className="text-2xl font-black text-ss-primary">
              {Math.round(monthlyPayment).toLocaleString('en-US')}
            </span>
            <span className="text-sm font-semibold text-ss-primary">{currencySymbol}/თვე</span>
          </div>
          <div className="h-px bg-violet-200 dark:bg-violet-800/40 my-2" />
          <div className="grid grid-cols-2 gap-2 text-xs text-left">
            <div>
              <span className="text-gray-400 dark:text-gray-500 block">სესხის ძირი</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {Math.round(loanPrincipal).toLocaleString()} {currencySymbol}
              </span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 block">სულ პროცენტი</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {Math.round(totalInterest).toLocaleString()} {currencySymbol}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
