import React from 'react';
import { Award, CheckCircle, TrendingUp, Calendar, Smartphone, CreditCard, ShieldAlert } from 'lucide-react';
import { TelcoCreditScore } from '../../types/ipdr';

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
    if (score >= 750) return 'text-emerald-400';
    if (score >= 680) return 'text-cyan-400';
    if (score >= 600) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBadgeColor = (risk: TelcoCreditScore['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Telco Alternative Credit Scoring
            </h2>
            <p className="text-xs text-slate-400">
              Behavioral creditworthiness assessed from telecom tenure, payment habits, and device stability
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-mono-numbers border font-semibold ${getBadgeColor(creditScore.riskLevel)}`}>
          {creditScore.riskLevel} DEFAULT RISK
        </div>
      </div>

      {/* Main Scoring Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score Gauge Block */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Rating Score</div>
          <div className="flex items-baseline justify-center gap-1 font-mono-numbers">
            <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(creditScore.score)}`}>
              {creditScore.score}
            </span>
            <span className="text-xs text-slate-500">/ 850</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers">
              <span>300 (Poor)</span>
              <span>650 (Fair)</span>
              <span>850 (Prime)</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-200">
            Grade: <span className="text-cyan-400">{creditScore.grade}</span>
          </div>
        </div>

        {/* Behavioral Metrics Grid */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-numbers">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              Payment Timeliness
            </div>
            <div className="text-slate-100 font-bold text-sm mt-1">
              {creditScore.paymentHistoryPercent}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">On-time settlements</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              Monthly Spend Avg
            </div>
            <div className="text-slate-100 font-bold text-sm mt-1">
              IDR {(creditScore.monthlyRechargeAvgIdr).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recurring commitment</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              SIM Line Tenure
            </div>
            <div className="text-slate-100 font-bold text-sm mt-1">
              {creditScore.simTenureMonths} Months
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Continuous active line</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-400" />
              Device Stability
            </div>
            <div className="text-slate-100 font-bold text-sm mt-1">
              {creditScore.deviceStabilityIndex} / 100
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Low hardware churn</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-cyan-400" />
              Approved Credit Limit
            </div>
            <div className="text-cyan-400 font-bold text-sm mt-1">
              IDR {(creditScore.creditLimitIdr).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Postpaid financing limit</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-emerald-400" />
              Postpaid Status
            </div>
            <div className="text-emerald-400 font-bold text-sm mt-1">
              {creditScore.postpaidEligible ? 'QUALIFIED' : 'RESTRICTED'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Instant device credit</div>
          </div>
        </div>
      </div>

      {/* Credit Factors List */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-xs font-medium text-slate-400 mb-2">Key Telco Assessment Factors:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {creditScore.scoreFactors.map((factor, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 bg-slate-950/60 rounded-md border border-slate-800/60"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  factor.impact === 'POSITIVE'
                    ? 'bg-emerald-400'
                    : factor.impact === 'NEGATIVE'
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`}
              />
              <div>
                <span className="font-semibold text-slate-200">{factor.label}: </span>
                <span className="text-slate-400">{factor.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
