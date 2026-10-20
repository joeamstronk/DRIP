import React from 'react';
import { ShieldCheck, Search, FileText, LogOut, Radio } from 'lucide-react';
import { OperatorUser } from '../types/ipdr';

interface HeaderProps {
  operator: OperatorUser | null;
  activeTab: 'search' | 'detail';
  onNavigateTab: (tab: 'search' | 'detail') => void;
  onLogout: () => void;
  activeSubscriberName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  operator,
  activeTab,
  onNavigateTab,
  onLogout,
  activeSubscriberName,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              IPDR MONITORING SYSTEM
            </span>
            <div className="text-[11px] text-slate-500 font-mono-numbers">
              Carrier Telemetry & Lawful Record Analytics
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        {operator && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigateTab('search')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap ${
                activeTab === 'search'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Multi-Vector Search</span>
            </button>

            <button
              onClick={() => onNavigateTab('detail')}
              disabled={!activeSubscriberName}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap ${
                activeTab === 'detail'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 font-semibold'
                  : activeSubscriberName
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>
                {activeSubscriberName ? `Dossier: ${activeSubscriberName}` : 'Subscriber Detail'}
              </span>
            </button>
          </nav>
        )}

        {/* Zone 3: Operator Clearance & Logout */}
        <div className="flex items-center gap-4 shrink-0">
          {operator ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end text-xs">
                <span className="font-semibold text-slate-800">{operator.name}</span>
                <span className="text-cyan-700 font-mono-numbers text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-600" />
                  {operator.clearanceLevel.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Log out operator session"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-rose-600 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono-numbers">
              Secure Terminal Standby
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
