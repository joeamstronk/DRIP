import React, { useState, useMemo } from 'react';
import { Search, Phone, Globe, UserCheck, Smartphone, Hash, ArrowUpRight, CheckCircle2, AlertCircle, Users } from 'lucide-react';
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
      label: 'KK Santoso Family',
      type: 'Family Card (KK)',
      value: '3174051201080042',
      desc: 'Family Tree Registry (6 Members)',
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
    { id: 'all', label: 'All Vectors (Auto-Detect)', icon: <Search className="w-3.5 h-3.5" />, placeholder: 'Enter Phone, IP, IMSI, IMEI, Civil ID (NIK), or Family Card (KK)...' },
    { id: 'phone', label: 'Phone Number (MSISDN)', icon: <Phone className="w-3.5 h-3.5" />, placeholder: 'e.g. +62 812-5550-1928 or 081255501928' },
    { id: 'civilId', label: 'Civil ID (NIK) & Family Tree', icon: <Hash className="w-3.5 h-3.5" />, placeholder: 'e.g. 3174051904880003 or Family Card (KK) 3174051201080042' },
    { id: 'ip', label: 'IP Address (v4/v6)', icon: <Globe className="w-3.5 h-3.5" />, placeholder: 'e.g. 180.252.74.119 or 2404:c0:30a1::14' },
    { id: 'subscriberId', label: 'Subscriber ID / IMSI', icon: <UserCheck className="w-3.5 h-3.5" />, placeholder: 'e.g. SUB-ID-904281 or 510100482910481' },
    { id: 'imei', label: 'Phone IMEI', icon: <Smartphone className="w-3.5 h-3.5" />, placeholder: 'e.g. 864920049281729' },
  ];

  const currentPlaceholder = useMemo(() => {
    const found = searchVectorsList.find((v) => v.id === searchVector);
    return found ? found.placeholder : 'Search subscriber telemetry...';
  }, [searchVector]);

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
        const matchesSubNik = normalize(sub.civilId).includes(cleanQuery);
        const matchesFamilyNik = sub.familyTree?.members.some(
          (m) => normalize(m.nik).includes(cleanQuery) || m.name.toLowerCase().includes(query)
        );
        const matchesKK = sub.familyTree
          ? normalize(sub.familyTree.familyCardNumber).includes(cleanQuery)
          : false;
        return matchesSubNik || matchesFamilyNik || matchesKK;
      }

      const matchesFamily = sub.familyTree
        ? normalize(sub.familyTree.familyCardNumber).includes(cleanQuery) ||
          sub.familyTree.members.some(
            (m) => normalize(m.nik).includes(cleanQuery) || m.name.toLowerCase().includes(query)
          )
        : false;

      return (
        sub.name.toLowerCase().includes(query) ||
        normalize(sub.phone).includes(cleanQuery) ||
        sub.currentIp.toLowerCase().includes(query) ||
        sub.currentIpv6.toLowerCase().includes(query) ||
        normalize(sub.id).includes(cleanQuery) ||
        normalize(sub.simCardImsi).includes(cleanQuery) ||
        normalize(sub.civilId).includes(cleanQuery) ||
        normalize(sub.currentImei).includes(cleanQuery) ||
        matchesFamily
      );
    });
  }, [subscribers, searchQuery, searchVector]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-white min-h-full">
      {/* Title & Scope */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-cyan-700 text-xs font-mono-numbers font-semibold">
          <Globe className="w-3.5 h-3.5" />
          <span>REAL-TIME TELECOMMUNICATION METADATA INVENTORY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          IPDR Multi-Vector Search Console
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl">
          Query telecommunication session records, dynamic IP allocations, physical handset hardware identifiers, and citizen subscriber registrations across nationwide mobile networks.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        {/* Vector Selection Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Target Identification Vector
          </label>
          <div className="flex flex-wrap gap-2">
            {searchVectorsList.map((vec) => (
              <button
                key={vec.id}
                onClick={() => setSearchVector(vec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  searchVector === vec.id
                    ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
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
            className="w-full pl-12 pr-28 py-3.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 font-mono-numbers"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1 font-medium">Quick Search Presets:</span>
          {quickPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setSearchQuery(preset.value);
                setSearchVector('all');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 rounded-md text-xs text-slate-700 hover:text-cyan-800 transition-colors flex items-center gap-1.5"
            >
              <span className="font-semibold text-slate-800">{preset.label}</span>
              <span className="text-slate-500 text-[10px]">({preset.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">Matching Subscriber Records</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers font-bold text-cyan-700">
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
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No Subscriber Records Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No active or historical records match &quot;{searchQuery}&quot; under vector &quot;{searchVector}&quot;. Try resetting the filter to &quot;All Vectors&quot; or click one of the quick presets above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchVector('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 rounded-lg transition-colors border border-slate-300"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="bg-white border border-slate-200 hover:border-cyan-500/80 rounded-xl p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={subscriber.photoUrl}
                        alt={subscriber.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                            {subscriber.name}
                          </h3>
                          <span className="flex items-center gap-1 text-[11px] font-mono-numbers text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {subscriber.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono-numbers flex-wrap">
                          <span>NIK:</span>
                          <span className="text-slate-800 font-bold">{subscriber.civilId}</span>
                          {subscriber.familyTree && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[11px] text-slate-600 flex items-center gap-1 font-sans">
                                <Users className="w-3 h-3 text-cyan-600" />
                                <span>KK: {subscriber.familyTree.familyCardNumber.slice(0, 8)}... ({subscriber.familyTree.members.length} members)</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-medium">Credit Score</div>
                      <div className="text-sm font-bold font-mono-numbers text-cyan-700">
                        {subscriber.creditScore.score}
                        <span className="text-[10px] text-slate-500 ml-1">
                          ({subscriber.creditScore.grade})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 font-mono-numbers">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Phone (MSISDN)</div>
                      <div className="text-slate-800 font-bold truncate">{subscriber.phone}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Public IP (NAT)</div>
                      <div className="text-cyan-700 font-bold truncate">{subscriber.currentIp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Device Model</div>
                      <div className="text-slate-700 font-medium truncate">{subscriber.deviceModel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Active IMEI</div>
                      <div className="text-slate-700 font-medium truncate">{subscriber.currentImei}</div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={() => onSelectSubscriber(subscriber)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
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
