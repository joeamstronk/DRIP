import React from 'react';
import { HardDrive, Smartphone, MessageCircle, PlaySquare, Compass, Tv, Camera, Globe, Landmark, Users, Car, Share2 } from 'lucide-react';
import { AppUsageSummary } from '../../types/ipdr';

interface TopAppsSummaryProps {
  appUsageSummary: AppUsageSummary;
}

export const TopAppsSummary: React.FC<TopAppsSummaryProps> = ({ appUsageSummary }) => {
  const getAppIcon = (name: string) => {
    switch (name) {
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'PlaySquare':
        return <PlaySquare className="w-4 h-4 text-red-600" />;
      case 'Tv':
        return <Tv className="w-4 h-4 text-red-600" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-pink-600" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-600" />;
      case 'Landmark':
        return <Landmark className="w-4 h-4 text-amber-600" />;
      case 'Users':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'Car':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'Share2':
        return <Share2 className="w-4 h-4 text-sky-600" />;
      default:
        return <Globe className="w-4 h-4 text-cyan-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top 5 Most Opened Apps */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Top 5 Most Opened Apps
              </h2>
              <p className="text-xs text-slate-500">
                Launch frequency and session engagement in the last 24 hours
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers text-cyan-700 font-bold">24H Frequency</span>
        </div>

        <div className="space-y-2.5">
          {appUsageSummary.mostOpened.map((app, index) => (
            <div
              key={app.appId}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-bold font-mono-numbers text-slate-700">
                  {index + 1}
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {getAppIcon(app.iconName)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{app.appName}</div>
                  <div className="text-[11px] text-slate-500">{app.category}</div>
                </div>
              </div>

              <div className="text-right font-mono-numbers">
                <div className="text-xs font-bold text-cyan-700">
                  {app.openCount24h} <span className="text-[10px] text-slate-500">opens</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  ~{app.avgSessionMinutes}m / session · {app.lastOpened}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top 5 Most Data Consuming Apps */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Top 5 Most Using Internet
              </h2>
              <p className="text-xs text-slate-500">
                Highest bandwidth volume consuming applications in GB/MB
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers text-purple-700 font-bold">Total Volume</span>
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
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-bold font-mono-numbers text-slate-700">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                      {getAppIcon(app.iconName)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{app.appName}</div>
                      <div className="text-[10px] text-slate-500">{app.category}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono-numbers">
                    <div className="text-xs font-bold text-purple-700">{formattedTotal}</div>
                    <div className="text-[10px] text-slate-500">{app.percentOfTotal}% of total</div>
                  </div>
                </div>

                {/* Progress Bar & Split */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, app.percentOfTotal * 2)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono-numbers">
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
