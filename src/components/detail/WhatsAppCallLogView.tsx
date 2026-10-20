import React, { useState } from 'react';
import { PhoneCall, Phone, Video, PhoneIncoming, PhoneOutgoing, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { WhatsAppContactCallGroup } from '../../types/ipdr';

interface WhatsAppCallLogViewProps {
  callGroups: WhatsAppContactCallGroup[];
  onNavigateToPhone: (phone: string) => void;
}

export const WhatsAppCallLogView: React.FC<WhatsAppCallLogViewProps> = ({
  callGroups,
  onNavigateToPhone,
}) => {
  const [expandedPhones, setExpandedPhones] = useState<Record<string, boolean>>({
    [callGroups[0]?.contactPhone || '']: true,
  });

  const toggleExpand = (phone: string) => {
    setExpandedPhones((prev) => ({
      ...prev,
      [phone]: !prev[phone],
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              WhatsApp VoIP Call Session Logs
            </h2>
            <p className="text-xs text-slate-500">
              Encrypted SRTP media session tracking, callee frequency aggregation, and individual record durations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          <span className="text-slate-500 font-medium">Unique Callee Contacts:</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            {callGroups.length} Contacts
          </span>
        </div>
      </div>

      {/* Info notice about click-through navigation */}
      <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-xs text-cyan-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 shrink-0 text-cyan-700" />
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
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              {/* Summary Row for Contact */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100/70 transition-colors">
                {/* Contact Identity & Clickable Number */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{group.contactName}</span>
                      {group.linkedSubscriberId && (
                        <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.2 rounded font-mono-numbers font-semibold">
                          Registered Carrier Line
                        </span>
                      )}
                    </div>

                    {/* Clickable Phone Number */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => onNavigateToPhone(group.contactPhone)}
                        title="Click to pivot into this subscriber's full IPDR detail page"
                        className="group/btn flex items-center gap-1.5 text-xs font-bold font-mono-numbers text-cyan-700 hover:text-cyan-900 hover:underline bg-cyan-50 hover:bg-cyan-100 px-2.5 py-0.5 rounded border border-cyan-200 transition-all"
                      >
                        <span>{group.contactPhone}</span>
                        <ExternalLink className="w-3 h-3 text-cyan-600 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
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
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Call Frequency
                    </div>
                    <div className="text-emerald-700 font-bold text-sm">
                      {group.totalCallsCount} calls
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      {group.outgoingCallsCount} out · {group.incomingCallsCount} in
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Total Talk Time
                    </div>
                    <div className="text-slate-900 font-bold text-sm">
                      {group.totalDurationFormatted}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Cumulative talk
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => toggleExpand(group.contactPhone)}
                    className="p-2 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
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
                <div className="border-t border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center justify-between">
                    <span>Individual Call Records ({group.individualCalls.length} logs):</span>
                    <span className="text-[11px] text-slate-500 font-mono-numbers">
                      SRTP encrypted payload / STUN relay
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs font-mono-numbers">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase font-bold">
                          <th className="py-2.5 px-3">Call ID</th>
                          <th className="py-2.5 px-3">Type & Direction</th>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3 text-right">Talk Duration (Each Call)</th>
                          <th className="py-2.5 px-3">Relay Media Server</th>
                          <th className="py-2.5 px-3">Codec</th>
                          <th className="py-2.5 px-3 text-right">Jitter & Quality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {group.individualCalls.map((call) => (
                          <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-500">
                              {call.id}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 font-medium">
                                {call.direction === 'OUTGOING' ? (
                                  <PhoneOutgoing className="w-3.5 h-3.5 text-cyan-600" />
                                ) : (
                                  <PhoneIncoming className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                <span className="text-slate-800">{call.callType === 'VIDEO' ? 'Video Call' : 'Voice Call'}</span>
                                <span className="text-[10px] text-slate-400">
                                  ({call.direction})
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {new Date(call.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                                {call.durationFormatted}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono">
                              {call.relayServerIp}:{call.relayPort}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {call.codec}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="text-emerald-700 font-semibold">{call.jitterMs}ms jitter</span> ·{' '}
                              <span className="text-slate-500">{call.packetLossPercent}% loss</span>
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
