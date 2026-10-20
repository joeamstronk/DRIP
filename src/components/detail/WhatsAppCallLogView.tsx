import React, { useState } from 'react';
import { PhoneCall, Phone, Video, PhoneIncoming, PhoneOutgoing, ChevronDown, ChevronUp, ExternalLink, Shield, Activity, Clock } from 'lucide-react';
import { WhatsAppContactCallGroup } from '../../types/ipdr';

interface WhatsAppCallLogViewProps {
  callGroups: WhatsAppContactCallGroup[];
  onNavigateToPhone: (phone: string) => void;
}

export const WhatsAppCallLogView: React.FC<WhatsAppCallLogViewProps> = ({
  callGroups,
  onNavigateToPhone,
}) => {
  // Track expanded contact IDs
  const [expandedPhones, setExpandedPhones] = useState<Record<string, boolean>>({
    [callGroups[0]?.contactPhone || '']: true, // Expand first contact by default
  });

  const toggleExpand = (phone: string) => {
    setExpandedPhones((prev) => ({
      ...prev,
      [phone]: !prev[phone],
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              WhatsApp VoIP Call Session Logs
            </h2>
            <p className="text-xs text-slate-400">
              Encrypted SRTP media session tracking, callee frequency aggregation, and individual record durations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          <span className="text-slate-400">Unique Callee Contacts:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            {callGroups.length} Contacts
          </span>
        </div>
      </div>

      {/* Info notice about click-through navigation */}
      <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>
            <strong>Cross-Subscriber Graph Navigation:</strong> Click any highlighted phone number below to immediately inspect that subscriber&apos;s full IPDR intelligence dossier.
          </span>
        </div>
      </div>

      {/* Deduplicated Call Groups Table */}
      <div className="space-y-3">
        {callGroups.map((group) => {
          const isExpanded = !!expandedPhones[group.contactPhone];

          return (
            <div
              key={group.contactPhone}
              className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Summary Row for Contact */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/90 hover:bg-slate-800/40 transition-colors">
                {/* Contact Identity & Clickable Number */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{group.contactName}</span>
                      {group.linkedSubscriberId && (
                        <span className="text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono-numbers">
                          Registered Carrier Line
                        </span>
                      )}
                    </div>

                    {/* Clickable Phone Number */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => onNavigateToPhone(group.contactPhone)}
                        title="Click to pivot into this subscriber's full IPDR detail page"
                        className="group/btn flex items-center gap-1.5 text-xs font-bold font-mono-numbers text-cyan-400 hover:text-cyan-300 hover:underline bg-cyan-950/40 hover:bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30 transition-all"
                      >
                        <span>{group.contactPhone}</span>
                        <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>

                      {group.contactCivilId && (
                        <span className="text-[11px] text-slate-500 font-mono-numbers">
                          NIK: {group.contactCivilId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aggregate Metrics: Frequency & Cumulative Duration */}
                <div className="flex items-center gap-6 text-xs font-mono-numbers self-end md:self-center">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Call Frequency
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">
                      {group.totalCallsCount} calls
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {group.outgoingCallsCount} out · {group.incomingCallsCount} in
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Total Talk Time
                    </div>
                    <div className="text-slate-200 font-bold text-sm">
                      {group.totalDurationFormatted}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Cumulative talk
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => toggleExpand(group.contactPhone)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    aria-label="Toggle individual records"
                  >
                    <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Sub-Table with Each Individual Call's Exact Duration */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                    <span>Individual Call Records ({group.individualCalls.length} logs):</span>
                    <span className="text-[11px] text-slate-500 font-mono-numbers">
                      SRTP encrypted payload / STUN relay
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono-numbers">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase">
                          <th className="py-2 px-3">Call ID</th>
                          <th className="py-2 px-3">Type & Direction</th>
                          <th className="py-2 px-3">Timestamp</th>
                          <th className="py-2 px-3 text-right">Talk Duration (Each Call)</th>
                          <th className="py-2 px-3">Relay Media Server</th>
                          <th className="py-2 px-3">Codec</th>
                          <th className="py-2 px-3 text-right">Jitter & Quality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {group.individualCalls.map((call) => (
                          <tr key={call.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">
                              {call.id}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                {call.direction === 'OUTGOING' ? (
                                  <PhoneOutgoing className="w-3.5 h-3.5 text-cyan-400" />
                                ) : (
                                  <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                <span>{call.callType === 'VIDEO' ? 'Video Call' : 'Voice Call'}</span>
                                <span className="text-[10px] text-slate-500">
                                  ({call.direction})
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {new Date(call.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                                {call.durationFormatted}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {call.relayServerIp}:{call.relayPort}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {call.codec}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="text-emerald-400">{call.jitterMs}ms jitter</span> ·{' '}
                              <span className="text-slate-400">{call.packetLossPercent}% loss</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
