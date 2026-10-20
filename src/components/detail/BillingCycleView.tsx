import React from 'react';
import { Receipt, AlertTriangle, CheckCircle2, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { BillingCycleSummary } from '../../types/ipdr';

interface BillingCycleViewProps {
  billingSummary: BillingCycleSummary;
  planName: string;
}

export const BillingCycleView: React.FC<BillingCycleViewProps> = ({
  billingSummary,
  planName,
}) => {
  const usagePercent = Math.min(
    100,
    (billingSummary.quotaUsedGb / billingSummary.quotaAllocatedGb) * 100
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Billing Cycle & Data Quota Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Current monthly cycle quota exhaustion, roaming split, and billing metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300 font-semibold">{billingSummary.cyclePeriod}</span>
          <span className="text-cyan-400 font-bold">({billingSummary.daysRemaining} days left)</span>
        </div>
      </div>

      {/* Primary Quota Gauge */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono-numbers">
          <div className="text-slate-400">
            Subscribed Plan: <strong className="text-slate-200">{planName}</strong>
          </div>
          <div className="text-slate-300">
            Used <span className="text-cyan-400 font-bold">{billingSummary.quotaUsedGb} GB</span> of{' '}
            <span className="text-slate-100 font-bold">{billingSummary.quotaAllocatedGb} GB</span>{' '}
            ({usagePercent.toFixed(1)}%)
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercent > 85 ? 'bg-amber-400' : 'bg-cyan-500'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-500 font-mono-numbers">
          <span>0 GB</span>
          <span>Remaining: {(billingSummary.quotaAllocatedGb - billingSummary.quotaUsedGb).toFixed(1)} GB</span>
          <span>FUP Threshold: {billingSummary.quotaAllocatedGb} GB</span>
        </div>
      </div>

      {/* Summary Matrix Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono-numbers">
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Peak Hours Bandwidth</div>
          <div className="text-slate-100 font-bold text-base mt-1">
            {billingSummary.peakHourUsageGb} GB
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">High-traffic window</div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Off-Peak Bandwidth</div>
          <div className="text-slate-100 font-bold text-base mt-1">
            {billingSummary.offPeakUsageGb} GB
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Late night & off-hours</div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Domestic vs Roaming</div>
          <div className="text-slate-100 font-bold text-base mt-1">
            {billingSummary.domesticUsageGb} / {billingSummary.roamingUsageGb} GB
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {billingSummary.roamingUsageGb > 0 ? 'International roaming active' : '100% domestic network'}
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">FUP Speed State</div>
          <div className="text-emerald-400 font-bold text-base mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {billingSummary.fupStatus}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Standard 5G/4G speeds</div>
        </div>
      </div>

      {/* Financial Settlement Strip */}
      <div className="p-3.5 bg-slate-950/90 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-numbers">
        <div className="flex items-center gap-3">
          <div className="text-slate-400">Current Monthly Bill:</div>
          <div className="text-base font-bold text-slate-100">
            IDR {(billingSummary.currentMonthlyBillIdr).toLocaleString('id-ID')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-slate-400">Overage Surcharge:</div>
          <div className="text-base font-bold text-emerald-400">
            IDR {billingSummary.overageChargesIdr.toLocaleString('id-ID')} (Zero)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-slate-400">Projected Cycle Total:</div>
          <div className="text-base font-bold text-cyan-400">
            ~{billingSummary.projectedCycleEndUsageGb} GB
          </div>
        </div>
      </div>
    </div>
  );
};
