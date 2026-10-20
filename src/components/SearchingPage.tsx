import React, { useState, useMemo } from 'react';
import { Search, Phone, Globe, UserCheck, Smartphone, Hash, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Subscriber, SearchVector } from '../types/ipdr';

interface SearchingPageProps {
  subscribers: Subscriber[];
  onSelectSubscriber: (subscriber: Subscriber) => void;
}

export const SearchingPage: React.FC<SearchingPageProps> = ({
  subscribers,
  onSelectSubscriber,
}) => {
  const [searchVector, setSearchVector] = useState<SearchVector | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick preset shortcuts
  const quickPresets = [
    {
      label: 'Budi Santoso',
      type: 'Phone',
      value: '+62 812-5550-1928',
      desc: 'Heavy Data & VoIP User',
    },
    {
      label: 'Siti Rahmawati',
      type: 'Civil ID (NIK)',
      value: '3271045209930005',
      desc: 'Prime Corporate Account',
    },
    {
      label: 'Reza Aditya',
      type: 'IP Address',
      value: '114.124.205.88',
      desc: 'Active High-Throughput IP',
    },
    {
      label: 'Dewi Lestari',
      type: 'IMEI',
      value: '354891048271635',
      desc: 'Global Roaming Subscriber',
    },
  ];

  const searchVectorsList: { id: SearchVector | 'all'; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { id: 'all', label: 'All Vectors (Auto-Detect)', icon: <Search className="w-3.5 h-3.5" />, placeholder: 'Enter Phone, IP, IMSI, IMEI, or Civil ID (NIK)...' },
    { id: 'phone', label: 'Phone Number (MSISDN)', icon: <Phone className="w-3.5 h-3.5" />, placeholder: 'e.g. +62 812-5550-1928 or 081255501928' },
    { id: 'ip', label: 'IP Address (v4/v6)', icon: <Globe className="w-3.5 h-3.5" />, placeholder: 'e.g. 180.252.74.119 or 2404:c0:30a1::14' },
    { id: 'subscriberId', label: 'Subscriber ID / IMSI', icon: <UserCheck className="w-3.5 h-3.5" />, placeholder: 'e.g. SUB-ID-904281 or 510100482910481' },
    { id: 'imei', label: 'Phone IMEI', icon: <Smartphone className="w-3.5 h-3.5" />, placeholder: 'e.g. 864920049281729' },
    { id: 'civilId', label: 'Civil Number ID (NIK)', icon: <Hash className="w-3.5 h-3.5" />, placeholder: 'e.g. 3174051904880003' },
  ];

  const currentPlaceholder = useMemo(() => {
    const found = searchVectorsList.find((v) => v.id === searchVector);
    return found ? found.placeholder : 'Search subscriber telemetry...';
  }, [searchVector]);

  // Clean strings for fuzzy comparison
  const normalize = (val: string) => val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) {
      return subscribers;
    }
    const query = searchQuery.trim().toLowerCase();
    const cleanQuery = normalize(query);

    return subscribers.filter((sub) => {
      if (searchVector === 'phone') {
        return normalize(sub.phone).includes(cleanQuery);
      }
      if (searchVector === 'ip') {
        return (
          sub.currentIp.toLowerCase().includes(query) ||
          sub.currentIpv6.toLowerCase().includes(query)
        );
      }
      if (searchVector === 'subscriberId') {
        return (
          normalize(sub.id).includes(cleanQuery) ||
          normalize(sub.simCardImsi).includes(cleanQuery)
        );
      }
      if (searchVector === 'imei') {
        return (
          normalize(sub.currentImei).includes(cleanQuery) ||
          sub.deviceHistory.some((d) => normalize(d.imei).includes(cleanQuery))
        );
      }
      if (searchVector === 'civilId') {
        return normalize(sub.civilId).includes(cleanQuery);
      }

      // 'all' auto-detect: match across any vector
      return (
        sub.name.toLowerCase().includes(query) ||
        normalize(sub.phone).includes(cleanQuery) ||
        sub.currentIp.toLowerCase().includes(query) ||
        sub.currentIpv6.toLowerCase().includes(query) ||
        normalize(sub.id).includes(cleanQuery) ||
        normalize(sub.simCardImsi).includes(cleanQuery) ||
        normalize(sub.civilId).includes(cleanQuery) ||
        normalize(sub.currentImei).includes(cleanQuery)
      );
    });
  }, [subscribers, searchQuery, searchVector]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Title & Scope */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono-numbers">
          <Globe className="w-3.5 h-3.5" />
          <span>REAL-TIME TELECOMMUNICATION METADATA INVENTORY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          IPDR Multi-Vector Search Console
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Query telecommunication session records, dynamic IP allocations, physical handset hardware identifiers, and citizen subscriber registrations across nationwide mobile networks.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        {/* Vector Selection Tabs */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Target Identification Vector
          </label>
          <div className="flex flex-wrap gap-2">
            {searchVectorsList.map((vec) => (
              <button
                key={vec.id}
                onClick={() => setSearchVector(vec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  searchVector === vec.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {vec.icon}
                <span>{vec.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentPlaceholder}
            className="w-full pl-12 pr-28 py-3.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono-numbers"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="pt-1 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Quick Search Presets:</span>
          {quickPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setSearchQuery(preset.value);
                setSearchVector('all');
              }}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md text-xs text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span className="font-medium text-slate-200">{preset.label}</span>
              <span className="text-slate-500 text-[10px]">({preset.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Matching Subscriber Records</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers font-medium text-cyan-400">
              {filteredSubscribers.length} found
            </span>
          </div>
          {searchQuery && (
            <div className="text-slate-500 font-mono-numbers">
              Query: &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {filteredSubscribers.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Subscriber Records Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No active or historical records match &quot;{searchQuery}&quot; under vector &quot;{searchVector}&quot;. Try resetting the filter to &quot;All Vectors&quot; or click one of the quick presets above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchVector('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 transition-all shadow-md hover:shadow-cyan-950/20 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={subscriber.photoUrl}
                        alt={subscriber.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {subscriber.name}
                          </h3>
                          <span className="flex items-center gap-1 text-[11px] font-mono-numbers text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {subscriber.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono-numbers">
                          <span>NIK:</span>
                          <span className="text-slate-200 font-semibold">{subscriber.civilId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Credit Score</div>
                      <div className="text-sm font-bold font-mono-numbers text-cyan-400">
                        {subscriber.creditScore.score}
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({subscriber.creditScore.grade})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-4 font-mono-numbers">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Phone (MSISDN)</div>
                      <div className="text-slate-200 font-medium truncate">{subscriber.phone}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Public IP (NAT)</div>
                      <div className="text-cyan-400 font-medium truncate">{subscriber.currentIp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Device Model</div>
                      <div className="text-slate-300 truncate">{subscriber.deviceModel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active IMEI</div>
                      <div className="text-slate-300 truncate">{subscriber.currentImei}</div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={() => onSelectSubscriber(subscriber)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Inspect Complete IPDR Dossier</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
