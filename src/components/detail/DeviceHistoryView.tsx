import React from 'react';
import { Smartphone, History, Shield, CheckCircle2, Phone, Calendar } from 'lucide-react';
import { DeviceHistoryRecord, PhoneHistoryRecord } from '../../types/ipdr';

interface DeviceHistoryViewProps {
  deviceHistory: DeviceHistoryRecord[];
  phoneHistory: PhoneHistoryRecord[];
  currentImei: string;
}

export const DeviceHistoryView: React.FC<DeviceHistoryViewProps> = ({
  deviceHistory,
  phoneHistory,
  currentImei,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Handset IMEI Hardware Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Handset IMEI Hardware Timeline
              </h2>
              <p className="text-xs text-slate-400">
                TAC allocation codes, hardware model changes, and multi-SIM history
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers text-cyan-400 font-semibold">
            {deviceHistory.length} Devices
          </span>
        </div>

        <div className="space-y-3">
          {deviceHistory.map((dev) => (
            <div
              key={dev.imei}
              className={`p-3.5 rounded-xl border text-xs font-mono-numbers transition-colors ${
                dev.isCurrent
                  ? 'bg-slate-950 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{dev.model}</span>
                  {dev.isCurrent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-bold">
                      ACTIVE CURRENT HANDSET
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      PREVIOUS HARDWARE
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Handset IMEI</div>
                  <div className="text-cyan-300 font-bold truncate">{dev.imei}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">TAC Code</div>
                  <div className="text-slate-300 truncate">{dev.tacCode}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">OS Build / Specs</div>
                  <div className="text-slate-300 truncate">{dev.osVersion}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Timeline Range</div>
                  <div className="text-slate-400 text-[10px] truncate">
                    {dev.firstSeen} → {dev.lastSeen}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Phone Number & SIM Swap History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Phone Number (MSISDN) History
              </h2>
              <p className="text-xs text-slate-400">
                SIM card swaps, IMSI allocations, and line activation logs
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers text-emerald-400 font-semibold">
            {phoneHistory.length} Lines
          </span>
        </div>

        <div className="space-y-3">
          {phoneHistory.map((ph) => (
            <div
              key={ph.msisdn}
              className={`p-3.5 rounded-xl border text-xs font-mono-numbers transition-colors ${
                ph.status === 'ACTIVE'
                  ? 'bg-slate-950 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{ph.msisdn}</span>
                  {ph.status === 'ACTIVE' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-bold">
                      ACTIVE PRIMARY LINE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      PREVIOUS SUBSCRIBER LINE
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">SIM IMSI</div>
                  <div className="text-slate-200 font-bold truncate">{ph.simImsi}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Carrier Service</div>
                  <div className="text-slate-300 truncate">{ph.carrier}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-[10px] text-slate-500 uppercase">Activation Date</div>
                  <div className="text-slate-400">{ph.activatedDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
