import React from 'react';
import { Award, CheckCircle, TrendingUp, Calendar, Smartphone, CreditCard, ShieldAlert } from 'lucide-react';
import { TelcoCreditScore } from '../../types/ipdr';
import { CreditScoreSparkline } from './CreditScoreSparkline';

interface CreditScoreCardProps {
  creditScore: TelcoCreditScore;
}

export const CreditScoreCard: React.FC<CreditScoreCardProps> = ({ creditScore }) => {
  // Score percentage on 300 - 850 scale
  const percentage = Math.min(
    100,
    Math.max(0, ((creditScore.score - 300) / (850 - 300)) * 100)
  );

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-700';
    if (score >= 680) return 'text-cyan-700';
    if (score >= 600) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getBadgeColor = (risk: TelcoCreditScore['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'MODERATE':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-rose-800 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Telco Alternative Credit Scoring
            </h2>
            <p className="text-xs text-slate-500">
              Behavioral creditworthiness assessed from telecom tenure, payment habits, and device stability
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-mono-numbers border font-bold ${getBadgeColor(creditScore.riskLevel)}`}>
          {creditScore.riskLevel} DEFAULT RISK
        </div>
      </div>

      {/* Main Scoring Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score Gauge Block */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center space-y-3">
          <div className="text-xs text-slate-500 uppercase font-semibold">Rating Score</div>
          <div className="flex items-baseline justify-center gap-1 font-mono-numbers">
            <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(creditScore.score)}`}>
              {creditScore.score}
            </span>
            <span className="text-xs text-slate-400">/ 850</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers font-medium">
              <span>300 (Poor)</span>
              <span>650 (Fair)</span>
              <span>850 (Prime)</span>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-700">
            Grade: <span className="text-cyan-700">{creditScore.grade}</span>
          </div>
        </div>

        {/* Behavioral Metrics Grid */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-numbers">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Payment Timeliness
            </div>
            <div className="text-slate-900 font-bold text-sm mt-1">
              {creditScore.paymentHistoryPercent}%
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">On-time settlements</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-600" />
              Monthly Spend Avg
            </div>
            <div className="text-slate-900 font-bold text-sm mt-1">
              IDR {(creditScore.monthlyRechargeAvgIdr).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Recurring commitment</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              SIM Line Tenure
            </div>
            <div className="text-slate-900 font-bold text-sm mt-1">
              {creditScore.simTenureMonths} Months
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Continuous active line</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-400" />
              Device Stability
            </div>
            <div className="text-slate-900 font-bold text-sm mt-1">
              {creditScore.deviceStabilityIndex} / 100
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Low hardware churn</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-cyan-600" />
              Approved Credit Limit
            </div>
            <div className="text-cyan-800 font-bold text-sm mt-1">
              IDR {(creditScore.creditLimitIdr).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Postpaid financing limit</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-emerald-600" />
              Postpaid Status
            </div>
            <div className="text-emerald-700 font-bold text-sm mt-1">
              {creditScore.postpaidEligible ? 'QUALIFIED' : 'RESTRICTED'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Instant device credit</div>
          </div>
        </div>
      </div>

      {/* 6-Month Credit Score Sparkline & Stability Trend */}
      <CreditScoreSparkline
        history={creditScore.scoreHistory}
        currentScore={creditScore.score}
      />

      {/* Credit Factors List */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-600 mb-2">Key Telco Assessment Factors:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {creditScore.scoreFactors.map((factor, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  factor.impact === 'POSITIVE'
                    ? 'bg-emerald-500'
                    : factor.impact === 'NEGATIVE'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              <div>
                <span className="font-bold text-slate-800">{factor.label}: </span>
                <span className="text-slate-600">{factor.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
