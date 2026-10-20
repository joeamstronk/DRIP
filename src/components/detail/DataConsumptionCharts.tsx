import React from 'react';
import { BarChart3, TrendingUp, ArrowDownCircle, ArrowUpCircle, PieChart } from 'lucide-react';
import { Subscriber } from '../../types/ipdr';

interface DataConsumptionChartsProps {
  subscriber: Subscriber;
}

export const DataConsumptionCharts: React.FC<DataConsumptionChartsProps> = ({ subscriber }) => {
  // 24-hour mock hourly consumption points (MB)
  const hourlyData = [
    { hour: '00:00', dl: 820, ul: 95 },
    { hour: '02:00', dl: 1420, ul: 110 },
    { hour: '04:00', dl: 420, ul: 60 },
    { hour: '06:00', dl: 180, ul: 40 },
    { hour: '08:00', dl: 950, ul: 210 },
    { hour: '10:00', dl: 1850, ul: 340 },
    { hour: '12:00', dl: 2400, ul: 480 },
    { hour: '14:00', dl: 1950, ul: 420 },
    { hour: '16:00', dl: 2100, ul: 390 },
    { hour: '18:00', dl: 3200, ul: 620 }, // Peak
    { hour: '20:00', dl: 4100, ul: 810 }, // Highest Peak
    { hour: '22:00', dl: 2800, ul: 540 },
  ];

  const maxDl = Math.max(...hourlyData.map((d) => d.dl));

  const categories = [
    { name: 'Video Streaming', percent: 46.2, color: 'bg-cyan-500', vol: '43.5 GB' },
    { name: 'Enterprise & VoIP', percent: 22.4, color: 'bg-emerald-500', vol: '21.1 GB' },
    { name: 'Social Networking', percent: 16.8, color: 'bg-purple-500', vol: '15.8 GB' },
    { name: 'Web Browsing', percent: 9.5, color: 'bg-amber-500', vol: '8.9 GB' },
    { name: 'System & Background', percent: 5.1, color: 'bg-slate-500', vol: '4.9 GB' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Hourly Bandwidth Consumption Chart */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                24-Hour Bandwidth Throughput
              </h2>
              <p className="text-xs text-slate-400">
                Hourly Downlink (DL) and Uplink (UL) transfer rates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-numbers">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
              <span className="text-slate-300">Downlink (DL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-300">Uplink (UL)</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="space-y-2">
          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {hourlyData.map((d) => {
              const dlHeightPercent = (d.dl / maxDl) * 100;
              const ulHeightPercent = (d.ul / maxDl) * 100;
              const isPeak = d.dl >= 3200;

              return (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-[10px] font-mono-numbers text-slate-200 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap mb-1">
                    DL: {d.dl}MB · UL: {d.ul}MB
                  </div>

                  {/* Dual Bar Cluster */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Downlink Bar */}
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isPeak ? 'bg-cyan-400 shadow-sm shadow-cyan-500/50' : 'bg-cyan-600/80 hover:bg-cyan-500'
                      }`}
                      style={{ height: `${dlHeightPercent}%` }}
                    />
                    {/* Uplink Bar */}
                    <div
                      className="w-1.5 rounded-t-sm bg-emerald-500/80 hover:bg-emerald-400 transition-all duration-300"
                      style={{ height: `${ulHeightPercent}%` }}
                    />
                  </div>

                  {/* Hour label */}
                  <span className="text-[10px] font-mono-numbers text-slate-400 mt-1">
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 font-mono-numbers pt-2 border-t border-slate-800">
            <span>Peak Bandwidth Window: <strong>18:00 - 21:00 (Evening Prime)</strong></span>
            <span className="text-cyan-400">Peak DL: 4.1 GB/hr</span>
          </div>
        </div>
      </div>

      {/* 2. Application Category Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Protocol & service share breakdown
            </p>
          </div>
        </div>

        {/* Multi-segment distribution bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`${cat.color} h-full transition-all`}
                style={{ width: `${cat.percent}%` }}
                title={`${cat.name}: ${cat.percent}%`}
              />
            ))}
          </div>
        </div>

        {/* Category Items List */}
        <div className="space-y-2.5 pt-1">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono-numbers"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-slate-200 font-medium">{cat.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-100 font-bold">{cat.vol}</span>
                <span className="text-slate-400 text-[10px] ml-1.5">({cat.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
