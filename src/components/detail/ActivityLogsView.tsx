import React, { useState, useMemo } from 'react';
import { Database, Search } from 'lucide-react';
import { IpdrSessionLog } from '../../types/ipdr';

interface ActivityLogsViewProps {
  logs: IpdrSessionLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const protocols = ['ALL', 'TCP', 'UDP', 'QUIC', 'HTTPS', 'DNS'];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchProto = protocolFilter === 'ALL' || log.protocol === protocolFilter;
      const matchCat = categoryFilter === 'ALL' || log.applicationCategory === categoryFilter;
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        !query ||
        log.domain.toLowerCase().includes(query) ||
        log.destinationIp.includes(query) ||
        log.sourceIp.includes(query) ||
        log.id.toLowerCase().includes(query);

      return matchProto && matchCat && matchSearch;
    });
  }, [logs, protocolFilter, categoryFilter, searchTerm]);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${bytes} B`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Historic IPDR Activity Session Logs
            </h2>
            <p className="text-xs text-slate-500">
              Raw Internet Protocol Data Records including NAT port translations, endpoints, and byte metrics
            </p>
          </div>
        </div>

        <div className="text-xs font-mono-numbers text-slate-500">
          Showing <span className="text-cyan-700 font-bold">{filteredLogs.length}</span> of {logs.length} packet sessions
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        {/* Protocol tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600 font-semibold mr-1">Protocol:</span>
          {protocols.map((proto) => (
            <button
              key={proto}
              onClick={() => setProtocolFilter(proto)}
              className={`px-2.5 py-1 rounded font-mono-numbers font-semibold transition-colors ${
                protocolFilter === proto
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter domain, IP, or record ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 font-mono-numbers text-xs"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs font-mono-numbers">
          <thead>
            <tr className="bg-slate-50 text-[11px] text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
              <th className="py-3 px-3">Session ID</th>
              <th className="py-3 px-3">Start Time</th>
              <th className="py-3 px-3">Duration</th>
              <th className="py-3 px-3">Protocol</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Domain / Hostname</th>
              <th className="py-3 px-3">Source & NAT Port</th>
              <th className="py-3 px-3">Destination IP:Port</th>
              <th className="py-3 px-3 text-right">Bytes In / Out</th>
              <th className="py-3 px-3 text-right">Total Vol</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-500">
                  {log.id}
                </td>
                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                  {new Date(log.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td className="py-2.5 px-3 text-slate-800 font-medium">
                  {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.protocol === 'UDP'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : log.protocol === 'TCP'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : log.protocol === 'QUIC'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                    }`}
                  >
                    {log.protocol}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {log.applicationCategory}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 max-w-[200px] truncate" title={log.domain}>
                  {log.domain}
                </td>
                <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                  <div>{log.sourceIp}:{log.sourcePort}</div>
                  <div className="text-[10px] text-cyan-700 font-bold">NAT: {log.natPublicPort}</div>
                </td>
                <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-medium">
                  {log.destinationIp}:{log.destinationPort}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                  <div>↓ {formatBytes(log.bytesIn)}</div>
                  <div className="text-[10px] text-slate-400">↑ {formatBytes(log.bytesOut)}</div>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                  {formatBytes(log.totalBytes)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.terminationReason === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.terminationReason}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
