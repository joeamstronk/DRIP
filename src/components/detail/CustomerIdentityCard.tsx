import React from 'react';
import { ArrowLeft, Download, Printer, RefreshCw, Smartphone, Globe, Shield, MapPin, CheckCircle2, FileText } from 'lucide-react';
import { Subscriber } from '../../types/ipdr';
import { generateSubscriberPdfReport } from '../../utils/pdfGenerator';

interface CustomerIdentityCardProps {
  subscriber: Subscriber;
  onBackToSearch: () => void;
  onRefreshTelemetry: () => void;
  isRefreshing: boolean;
}

export const CustomerIdentityCard: React.FC<CustomerIdentityCardProps> = ({
  subscriber,
  onBackToSearch,
  onRefreshTelemetry,
  isRefreshing,
}) => {
  const handleExportCsv = () => {
    // Generate CSV string of IPDR logs
    const headers = 'ID,Start Time,End Time,Duration (s),Protocol,Category,Domain,Source IP,Source Port,NAT Public IP,NAT Port,Dest IP,Dest Port,Bytes In,Bytes Out,Total MB\n';
    const rows = subscriber.ipdrLogs
      .map((log) =>
        [
          log.id,
          log.startTime,
          log.endTime,
          log.durationSeconds,
          log.protocol,
          log.applicationCategory,
          `"${log.domain}"`,
          log.sourceIp,
          log.sourcePort,
          log.natPublicIp,
          log.natPublicPort,
          log.destinationIp,
          log.destinationPort,
          log.bytesIn,
          log.bytesOut,
          (log.totalBytes / (1024 * 1024)).toFixed(2),
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IPDR_Audit_${subscriber.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      {/* Top Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <button
          onClick={onBackToSearch}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-cyan-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Multi-Vector Search</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefreshTelemetry}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Poll Live Telemetry'}</span>
          </button>

          <button
            onClick={() => generateSubscriberPdfReport(subscriber)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            title="Generate forensic summary PDF report"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={subscriber.photoUrl}
              alt={subscriber.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
            />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active Line" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {subscriber.name}
              </h1>
              <span className="flex items-center gap-1 text-xs font-mono-numbers text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {subscriber.status}
              </span>
              <span className="text-xs text-slate-500 font-mono-numbers">
                Sub ID: <strong className="text-slate-800">{subscriber.id}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono-numbers">
              <div>
                <span>Civil ID (NIK): </span>
                <strong className="text-cyan-800 font-bold">{subscriber.civilId}</strong>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>MSISDN: </span>
                <strong className="text-slate-800 font-bold">{subscriber.phone}</strong>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{subscriber.city}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 pt-0.5">
              {subscriber.registeredAddress}
            </p>
          </div>
        </div>

        {/* Quick Identity Badges */}
        <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end text-xs font-mono-numbers">
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Plan & Carrier</div>
            <div className="text-slate-800 font-bold">{subscriber.planName}</div>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">SIM Card IMSI</div>
            <div className="text-slate-700 font-medium">{subscriber.simCardImsi}</div>
          </div>
        </div>
      </div>

      {/* Hardware & Network Allocation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono-numbers">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-600" />
            Current Public IPv4
          </div>
          <div className="text-cyan-800 font-bold truncate mt-0.5">{subscriber.currentIp}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-600" />
            Current IPv6 Prefix
          </div>
          <div className="text-slate-700 font-medium truncate mt-0.5">{subscriber.currentIpv6}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-slate-500" />
            Active Handset Model
          </div>
          <div className="text-slate-800 font-medium truncate mt-0.5">{subscriber.deviceModel}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-500" />
            Active Handset IMEI
          </div>
          <div className="text-slate-800 font-medium truncate mt-0.5">{subscriber.currentImei}</div>
        </div>
      </div>
    </div>
  );
};
