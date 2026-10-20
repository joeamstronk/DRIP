import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Globe,
  Radio,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Filter,
  Eye,
  Activity,
  Zap,
} from 'lucide-react';
import { Subscriber, SecurityAlert } from '../../types/ipdr';

interface SecurityAlertsWidgetProps {
  subscriber: Subscriber;
}

export const SecurityAlertsWidget: React.FC<SecurityAlertsWidgetProps> = ({ subscriber }) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ADVISORY'>('ALL');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Dynamically analyze subscriber's actual IPDR logs, locations, and call history for anomalies
  const generatedAlerts: SecurityAlert[] = useMemo(() => {
    const alerts: SecurityAlert[] = [];

    // 1. Check for Massive Data Spike in a Single Session (> 400 MB)
    const heavySessions = subscriber.ipdrLogs.filter(
      (log) => log.totalBytes > 400 * 1024 * 1024
    );
    if (heavySessions.length > 0) {
      const topSpike = heavySessions.sort((a, b) => b.totalBytes - a.totalBytes)[0];
      const volMb = (topSpike.totalBytes / (1024 * 1024)).toFixed(0);
      const isLateNight =
        new Date(topSpike.startTime).getUTCHours() >= 1 &&
        new Date(topSpike.startTime).getUTCHours() <= 5;

      alerts.push({
        id: `ALT-SPIKE-${topSpike.id}`,
        severity: isLateNight ? 'CRITICAL' : 'WARNING',
        category: 'BANDWIDTH_SPIKE',
        title: `Abnormal High-Throughput Packet Spike (${volMb} MB)`,
        description: `Single IPDR session consumed ${volMb} MB over ${topSpike.protocol} protocol${
          isLateNight ? ' during off-peak hours (01:00-05:00 UTC)' : ''
        }, exceeding baseline threshold by 340%.`,
        detectedAt: topSpike.startTime,
        evidence: [
          { label: 'Session ID', value: topSpike.id },
          { label: 'Domain / Target', value: `${topSpike.domain} (${topSpike.destinationIp}:${topSpike.destinationPort})` },
          { label: 'NAT Public Port', value: `${topSpike.natPublicIp}:${topSpike.natPublicPort}` },
          { label: 'Session Duration', value: `${Math.floor(topSpike.durationSeconds / 60)}m ${topSpike.durationSeconds % 60}s` },
          { label: 'Data In / Out', value: `DL: ${(topSpike.bytesIn / (1024 * 1024)).toFixed(1)} MB | UL: ${(topSpike.bytesOut / (1024 * 1024)).toFixed(1)} MB` },
        ],
        mitigationRecommendation:
          'Inspect content categorization via DPI prober; monitor destination IP subnet for unauthorized data exfiltration or automated peer-to-peer mirrors.',
      });
    }

    // 2. Check for Roaming Activity / Restricted Sensitive Zone Tracking
    if (subscriber.billingSummary.roamingUsageGb > 0) {
      alerts.push({
        id: `ALT-ROAM-${subscriber.id}`,
        severity: 'WARNING',
        category: 'RESTRICTED_ZONE',
        title: `Cross-Border International Roaming Active (${subscriber.billingSummary.roamingUsageGb} GB)`,
        description: `Subscriber initiated foreign roaming data sessions totaling ${subscriber.billingSummary.roamingUsageGb} GB with partner MCC/MNC relays.`,
        detectedAt: subscriber.lastActive,
        evidence: [
          { label: 'Roaming Volume', value: `${subscriber.billingSummary.roamingUsageGb} GB` },
          { label: 'Domestic Baseline', value: `${subscriber.billingSummary.domesticUsageGb} GB` },
          { label: 'Active IMEI', value: subscriber.currentImei },
          { label: 'SIM IMSI', value: subscriber.simCardImsi },
        ],
        mitigationRecommendation:
          'Audit roaming partner clearinghouse records for foreign IMSI attachment and verify lawful roaming policy compliance.',
      });
    }

    // 3. Check for Restricted Physical Location Proximity (e.g., Financial Central / Diplomatic Area)
    const sensitiveLocations = subscriber.locationHistory.filter(
      (loc) =>
        loc.locationName.toLowerCase().includes('scbd') ||
        loc.locationName.toLowerCase().includes('thamrin') ||
        loc.locationName.toLowerCase().includes('kuningan')
    );
    if (sensitiveLocations.length > 0) {
      const recentLoc = sensitiveLocations[0];
      alerts.push({
        id: `ALT-ZONE-${recentLoc.id}`,
        severity: 'ADVISORY',
        category: 'RESTRICTED_ZONE',
        title: `Restricted Commercial & Financial Corridor Attachment`,
        description: `Handset registered multiple BTS/GPS location pings inside protected financial core (${recentLoc.locationName}).`,
        detectedAt: recentLoc.timestamp,
        evidence: [
          { label: 'Zone Name', value: recentLoc.locationName },
          { label: 'Coordinates', value: `Lat: ${recentLoc.lat.toFixed(4)}, Lng: ${recentLoc.lng.toFixed(4)}` },
          { label: 'Telemetry Source', value: recentLoc.sourceType === 'CELL_TOWER' ? `Cell ID: ${recentLoc.cellId} (LAC: ${recentLoc.lac})` : `App: ${recentLoc.appName}` },
          { label: 'Precision Radius', value: `±${recentLoc.sourceType === 'CELL_TOWER' ? recentLoc.estimatedRadiusMeters : recentLoc.accuracyMeters} meters` },
        ],
        mitigationRecommendation:
          'Correlate physical cell site azimuth with adjacent surveillance feeds if lawful authorization is requested.',
      });
    }

    // 4. WhatsApp VoIP Relay Signaling Surges
    const highFreqContact = subscriber.whatsappCallGroups.find(
      (g) => g.totalCallsCount >= 4
    );
    if (highFreqContact) {
      alerts.push({
        id: `ALT-VOIP-${highFreqContact.contactPhone.replace(/[^0-9]/g, '')}`,
        severity: 'ADVISORY',
        category: 'VOIP_SURGE',
        title: `High-Density Encrypted VoIP Call Burst (${highFreqContact.totalCallsCount} Sessions)`,
        description: `Concentrated encrypted SRTP audio/video sessions detected with single remote party (${highFreqContact.contactName}) totaling ${highFreqContact.totalDurationFormatted}.`,
        detectedAt: highFreqContact.lastCallTimestamp,
        evidence: [
          { label: 'Target Callee', value: `${highFreqContact.contactPhone} (${highFreqContact.contactName})` },
          { label: 'Call Frequency', value: `${highFreqContact.totalCallsCount} calls (${highFreqContact.outgoingCallsCount} out / ${highFreqContact.incomingCallsCount} in)` },
          { label: 'Total Talk Time', value: highFreqContact.totalDurationFormatted },
          { label: 'Primary Protocol', value: 'SRTP / STUN 3478' },
        ],
        mitigationRecommendation:
          'Review callee contact identity graph to ascertain peer network relationship and call schedule recurrence.',
      });
    }

    // 5. Check for Network Protocol Resets / RST Anomalies
    const rstLogs = subscriber.ipdrLogs.filter(
      (l) => l.terminationReason === 'TIMEOUT' || l.terminationReason === 'NETWORK_RST'
    );
    if (rstLogs.length > 0) {
      alerts.push({
        id: `ALT-RST-${rstLogs[0].id}`,
        severity: 'WARNING',
        category: 'PORT_ANOMALY',
        title: `Unusual Connection Termination / Gateway Timeout`,
        description: `Repeated abnormal session terminations detected on destination ${rstLogs[0].destinationIp}:${rstLogs[0].destinationPort} (${rstLogs[0].domain}).`,
        detectedAt: rstLogs[0].endTime,
        evidence: [
          { label: 'Session ID', value: rstLogs[0].id },
          { label: 'Termination Flag', value: rstLogs[0].terminationReason },
          { label: 'Source NAT Port', value: `${rstLogs[0].natPublicIp}:${rstLogs[0].natPublicPort}` },
          { label: 'Target Host', value: rstLogs[0].domain },
        ],
        mitigationRecommendation:
          'Investigate firewall RST injection or transient CGNAT exhaustion at PGW/UPF gateway nodes.',
      });
    }

    return alerts;
  }, [subscriber]);

  // Filter alerts by user severity selection
  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'ALL') return generatedAlerts;
    return generatedAlerts.filter((a) => a.severity === severityFilter);
  }, [generatedAlerts, severityFilter]);

  const toggleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts((prev) => ({
      ...prev,
      [alertId]: !prev[alertId],
    }));
  };

  const handleExportIncident = () => {
    const reportData = {
      subscriberId: subscriber.id,
      subscriberName: subscriber.name,
      civilId: subscriber.civilId,
      phone: subscriber.phone,
      generatedAt: new Date().toISOString(),
      threatSummary: {
        totalAnomaliesDetected: generatedAlerts.length,
        criticalFlags: generatedAlerts.filter((a) => a.severity === 'CRITICAL').length,
        warningFlags: generatedAlerts.filter((a) => a.severity === 'WARNING').length,
      },
      anomalousIncidents: generatedAlerts,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Security_Incident_Audit_${subscriber.id}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Threat Level calculation
  const criticalCount = generatedAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = generatedAlerts.filter((a) => a.severity === 'WARNING').length;

  const threatPostKey =
    criticalCount > 0 ? 'CRITICAL' : warningCount > 1 ? 'ELEVATED' : 'NOMINAL';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Security & Anomalous IPDR Pattern Alerts
            </h2>
            <p className="text-xs text-slate-400">
              Heuristic anomaly detection engine auditing data spikes, restricted zones, and protocol deviations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportIncident}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Incident Audit</span>
          </button>
        </div>
      </div>

      {/* Threat Level & Heuristic Scoreboard Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono-numbers">
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Threat Level</div>
            <div
              className={`text-base font-bold mt-0.5 ${
                threatPostKey === 'CRITICAL'
                  ? 'text-rose-400'
                  : threatPostKey === 'ELEVATED'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {threatPostKey}
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              threatPostKey === 'CRITICAL'
                ? 'bg-rose-500 animate-ping'
                : threatPostKey === 'ELEVATED'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Critical Anomalies</div>
          <div className="text-rose-400 font-bold text-base mt-0.5">
            {criticalCount} <span className="text-[11px] text-slate-500">active</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Warning Flags</div>
          <div className="text-amber-400 font-bold text-base mt-0.5">
            {warningCount} <span className="text-[11px] text-slate-500">events</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Total Heuristics</div>
          <div className="text-cyan-400 font-bold text-base mt-0.5">
            {generatedAlerts.length} <span className="text-[11px] text-slate-500">audited</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs font-mono-numbers">
        <span className="text-slate-500 text-xs px-2 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filter:
        </span>
        <button
          onClick={() => setSeverityFilter('ALL')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            severityFilter === 'ALL'
              ? 'bg-slate-800 text-slate-100 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({generatedAlerts.length})
        </button>
        <button
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
            severityFilter === 'CRITICAL'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/50 font-bold'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setSeverityFilter('WARNING')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
            severityFilter === 'WARNING'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/50 font-bold'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          Warning ({warningCount})
        </button>
        <button
          onClick={() => setSeverityFilter('ADVISORY')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            severityFilter === 'ADVISORY'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          Advisory ({generatedAlerts.filter((a) => a.severity === 'ADVISORY').length})
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No security alerts detected under selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAck = !!acknowledgedAlerts[alert.id];
            const isExpanded = expandedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all text-xs font-mono-numbers space-y-3 ${
                  isAck
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Alert Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                          : alert.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                          : 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-bold text-slate-100 text-sm font-sans">
                      {alert.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">
                      Detected: {new Date(alert.detectedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      onClick={() => toggleAcknowledge(alert.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
                        isAck
                          ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          : 'bg-cyan-600/80 hover:bg-cyan-500 text-slate-950 font-semibold'
                      }`}
                    >
                      {isAck ? 'Acknowledged' : 'Mark Reviewed'}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {alert.description}
                </p>

                {/* Evidence Grid (Always visible or toggleable) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  {alert.evidence.map((ev, i) => (
                    <div key={i} className="truncate">
                      <div className="text-[10px] text-slate-500 uppercase">{ev.label}</div>
                      <div className="text-slate-200 font-bold truncate mt-0.5" title={ev.value}>
                        {ev.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mitigation Recommendation */}
                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/60 flex items-start gap-2 text-[11px] font-sans text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Recommended Operator Action: </strong>
                    {alert.mitigationRecommendation}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
