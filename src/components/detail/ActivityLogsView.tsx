import React, { useState, useMemo } from 'react';
import { Database, Filter, Search, ArrowDownUp, CheckCircle, Clock } from 'lucide-react';
import { IpdrSessionLog } from '../../types/ipdr';

interface ActivityLogsViewProps {
  logs: IpdrSessionLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const protocols = ['ALL', 'TCP', 'UDP', 'QUIC', 'HTTPS', 'DNS'];
  const categories = ['ALL', 'Streaming', 'Social', 'VoIP', 'Web', 'System'];

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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Historic IPDR Activity Session Logs
            </h2>
            <p className="text-xs text-slate-400">
              Raw Internet Protocol Data Records including NAT port translations, endpoints, and byte metrics
            </p>
          </div>
        </div>

        <div className="text-xs font-mono-numbers text-slate-400">
          Showing <span className="text-cyan-400 font-bold">{filteredLogs.length}</span> of {logs.length} packet sessions
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
        {/* Protocol tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium mr-1">Protocol:</span>
          {protocols.map((proto) => (
            <button
              key={proto}
              onClick={() => setProtocolFilter(proto)}
              className={`px-2.5 py-1 rounded font-mono-numbers font-medium transition-colors ${
                protocolFilter === proto
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter domain, IP, or record ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono-numbers text-xs"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs font-mono-numbers">
          <thead>
            <tr className="bg-slate-950 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-400">
                  {log.id}
                </td>
                <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                  {new Date(log.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.protocol === 'UDP'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : log.protocol === 'TCP'
                        ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                        : log.protocol === 'QUIC'
                        ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                        : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {log.protocol}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  {log.applicationCategory}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-200 max-w-[200px] truncate" title={log.domain}>
                  {log.domain}
                </td>
                <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                  <div>{log.sourceIp}:{log.sourcePort}</div>
                  <div className="text-[10px] text-cyan-400">NAT: {log.natPublicPort}</div>
                </td>
                <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                  {log.destinationIp}:{log.destinationPort}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-400 whitespace-nowrap">
                  <div>↓ {formatBytes(log.bytesIn)}</div>
                  <div className="text-[10px] text-slate-500">↑ {formatBytes(log.bytesOut)}</div>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-100 whitespace-nowrap">
                  {formatBytes(log.totalBytes)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.terminationReason === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
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
