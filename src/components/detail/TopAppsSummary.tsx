import React from 'react';
import { Layers, HardDrive, Smartphone, MessageCircle, PlaySquare, Compass, Tv, Camera, Globe, Landmark, Users, Car, Share2 } from 'lucide-react';
import { AppUsageSummary } from '../../types/ipdr';

interface TopAppsSummaryProps {
  appUsageSummary: AppUsageSummary;
}

export const TopAppsSummary: React.FC<TopAppsSummaryProps> = ({ appUsageSummary }) => {
  const getAppIcon = (name: string) => {
    switch (name) {
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'PlaySquare':
        return <PlaySquare className="w-4 h-4 text-red-400" />;
      case 'Tv':
        return <Tv className="w-4 h-4 text-red-500" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-pink-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-400" />;
      case 'Landmark':
        return <Landmark className="w-4 h-4 text-amber-400" />;
      case 'Users':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'Car':
        return <Car className="w-4 h-4 text-emerald-500" />;
      case 'Share2':
        return <Share2 className="w-4 h-4 text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top 5 Most Opened Apps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Top 5 Most Opened Apps
              </h2>
              <p className="text-xs text-slate-400">
                Launch frequency and session engagement in the last 24 hours
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers text-cyan-400 font-semibold">24H Frequency</span>
        </div>

        <div className="space-y-2.5">
          {appUsageSummary.mostOpened.map((app, index) => (
            <div
              key={app.appId}
              className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold font-mono-numbers text-slate-400">
                  {index + 1}
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                  {getAppIcon(app.iconName)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{app.appName}</div>
                  <div className="text-[11px] text-slate-400">{app.category}</div>
                </div>
              </div>

              <div className="text-right font-mono-numbers">
                <div className="text-xs font-bold text-cyan-400">
                  {app.openCount24h} <span className="text-[10px] text-slate-500">opens</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  ~{app.avgSessionMinutes}m / session · {app.lastOpened}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top 5 Most Data Consuming Apps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Top 5 Most Using Internet
              </h2>
              <p className="text-xs text-slate-400">
                Highest bandwidth volume consuming applications in GB/MB
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers text-purple-400 font-semibold">Total Volume</span>
        </div>

        <div className="space-y-3">
          {appUsageSummary.mostDataConsuming.map((app, index) => {
            const formattedTotal =
              app.totalMb >= 1024
                ? `${(app.totalMb / 1024).toFixed(1)} GB`
                : `${app.totalMb.toLocaleString()} MB`;

            return (
              <div
                key={app.appId}
                className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold font-mono-numbers text-slate-400">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                      {getAppIcon(app.iconName)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{app.appName}</div>
                      <div className="text-[10px] text-slate-400">{app.category}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono-numbers">
                    <div className="text-xs font-bold text-purple-300">{formattedTotal}</div>
                    <div className="text-[10px] text-slate-400">{app.percentOfTotal}% of total</div>
                  </div>
                </div>

                {/* Progress Bar & Split */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, app.percentOfTotal * 2)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers">
                    <span>FG: {app.foregroundMb >= 1024 ? `${(app.foregroundMb / 1024).toFixed(1)} GB` : `${app.foregroundMb} MB`}</span>
                    <span>BG: {app.backgroundMb} MB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
