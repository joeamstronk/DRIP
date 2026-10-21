import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
  Lock,
  Building2,
  PhoneForwarded,
  FileText,
  BadgeAlert,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { FraudAlertTicket, TelcoCreditScore } from '../../types/ipdr';

interface FraudNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriberName?: string;
  subscriberPhone?: string;
  subscriberCivilId?: string;
  currentRisk: TelcoCreditScore['riskLevel'];
  currentScore: number;
  onConfirmFlagAsHighRisk: (ticket: FraudAlertTicket) => void;
  existingTicket?: FraudAlertTicket;
}

const FRAUD_REASONS = [
  'Identity Theft & Suspicious SIM Clone Detected',
  'Abnormal Off-Hours High Throughput Spike (IPDR Anomaly)',
  'Rapid Velocity & Cross-Border Triangulation Mismatch',
  'Repeated High-Volume WhatsApp VoIP Outgoing Burst',
  'False KYC / Dukcapil Civil Registry Inconsistency',
  'Severe Payment Delinquency & Financial Insolvency Risk',
];

export const FraudNotificationDialog: React.FC<FraudNotificationDialogProps> = ({
  isOpen,
  onClose,
  subscriberName = 'Subscriber',
  subscriberPhone = '+62 812-XXXX-XXXX',
  subscriberCivilId = '3174XXXXXXXXXXXX',
  currentScore,
  onConfirmFlagAsHighRisk,
  existingTicket,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(
    existingTicket?.reason || FRAUD_REASONS[1]
  );
  const [investigatorNotes, setInvestigatorNotes] = useState<string>(
    existingTicket?.investigatorNotes ||
      `Manual risk override triggered by Senior Forensic Analyst. Evidence warrants immediate escalation to CRITICAL risk tier. Restrict postpaid line financing and flag for continuous BTS tower telemetry logging.`
  );

  const [channels, setChannels] = useState<{ [key: string]: boolean }>({
    soc: true,
    aml: true,
    liaison: true,
    lineFreeze: true,
  });

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStep, setDispatchStep] = useState(1);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<FraudAlertTicket | null>(
    existingTicket || null
  );

  if (!isOpen) return null;

  const handleToggleChannel = (key: string) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExecuteDispatch = () => {
    setIsDispatching(true);
    setDispatchStep(1);

    // Simulate multi-step dispatch progression
    setTimeout(() => {
      setDispatchStep(2);
    }, 700);

    setTimeout(() => {
      setDispatchStep(3);
    }, 1400);

    setTimeout(() => {
      const ticketId = `IFP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const activeChannels = [
        channels.soc ? 'Internal SOC / FOC Center' : '',
        channels.aml ? 'AML & Financial Crime Liaison' : '',
        channels.liaison ? 'Telecom Law Enforcement Unit' : '',
        channels.lineFreeze ? 'Postpaid Quota & Line Throttle' : '',
      ].filter(Boolean);

      const ticket: FraudAlertTicket = {
        ticketId,
        flaggedAt: new Date().toISOString(),
        reason: selectedReason,
        investigatorNotes,
        dispatchedChannels: activeChannels,
        status: 'ACTIVE',
      };

      setGeneratedTicket(ticket);
      setIsDispatching(false);
      setDispatchedSuccess(true);
      onConfirmFlagAsHighRisk(ticket);
    }, 2100);
  };

  const handleCloseDialog = () => {
    setIsDispatching(false);
    setDispatchedSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-rose-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header Bar */}
        <div className="bg-rose-50/80 border-b border-rose-100 p-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  Priority 1 Escalation
                </span>
                <span className="text-[11px] font-mono-numbers text-rose-700 font-semibold">
                  PROTOCOL #TELCO-IFP-2026
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Internal Fraud & Critical Risk Escalation
              </h2>
              <p className="text-xs text-slate-600">
                Trigger internal fraud broadcast and override subscriber risk rating to{' '}
                <strong className="text-rose-700 font-bold">CRITICAL</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseDialog}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Dispatched Success View */}
          {dispatchedSuccess && generatedTicket ? (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-emerald-900">
                    Fraud Escalation Dispatched Successfully
                  </div>
                  <div className="text-xs text-emerald-800">
                    The subscriber's risk status has been updated to{' '}
                    <span className="font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      CRITICAL
                    </span>
                    . Automated forensic alerts have been logged and routed to the designated departments.
                  </div>
                </div>
              </div>

              {/* Ticket Details Summary Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Incident Ticket Ref:</span>
                  <span className="font-mono-numbers font-extrabold text-rose-700 text-sm">
                    {generatedTicket.ticketId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Subscriber:</span>
                    <strong className="text-slate-800">{subscriberName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">MSISDN:</span>
                    <strong className="text-slate-800 font-mono-numbers">{subscriberPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK:</span>
                    <strong className="text-slate-800 font-mono-numbers">{subscriberCivilId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Updated Risk Status:</span>
                    <span className="font-bold text-rose-700">CRITICAL DEFAULT RISK</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] mb-1">Flagged Reason:</span>
                  <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-800">
                    {generatedTicket.reason}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Notified Units:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedTicket.dispatchedChannels.map((ch, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700"
                      >
                        ✓ {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Close & View Updated Dossier
                </button>
              </div>
            </div>
          ) : isDispatching ? (
            /* Dispatch Animation State */
            <div className="py-10 text-center space-y-5">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 animate-spin">
                  <Loader2 className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Broadcasting Internal Fraud Escalation
                </h3>
                <p className="text-xs text-slate-500 font-mono-numbers">
                  {dispatchStep === 1 && 'Encrypting IPDR telemetry & subscriber risk payload...'}
                  {dispatchStep === 2 && 'Routing P1 notification to SOC / Financial Crime Unit...'}
                  {dispatchStep === 3 && 'Committing database status update to CRITICAL...'}
                </p>
              </div>

              <div className="max-w-xs mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(dispatchStep / 3) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Main Form View */
            <>
              {/* Target Profile Mini Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Subscriber</div>
                  <div className="text-slate-900 font-bold text-sm">{subscriberName}</div>
                  <div className="text-slate-500 font-mono-numbers">{subscriberPhone}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Credit Score</div>
                  <div className="text-slate-900 font-bold font-mono-numbers text-sm">
                    {currentScore} <span className="text-slate-400 text-xs">/ 850</span>
                  </div>
                  <div className="text-[10px] font-bold text-rose-700">
                    Will update to: CRITICAL
                  </div>
                </div>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Primary Fraud / Risk Trigger:
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {FRAUD_REASONS.map((r, idx) => (
                    <option key={idx} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Channels Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-600" />
                    Internal Notification Broadcast Recipients:
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">All channels active by default</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => handleToggleChannel('soc')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                      channels.soc
                        ? 'bg-rose-50/50 border-rose-300 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.soc}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-semibold text-[11px] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-rose-600" />
                        Telco SOC / FOC Center
                      </div>
                      <div className="text-[10px] text-slate-500">Real-time P1 Incident dispatch</div>
                    </div>
                  </label>

                  <label
                    onClick={() => handleToggleChannel('aml')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                      channels.aml
                        ? 'bg-rose-50/50 border-rose-300 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.aml}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-semibold text-[11px] flex items-center gap-1">
                        <BadgeAlert className="w-3 h-3 text-amber-600" />
                        Bank AML & Financial Unit
                      </div>
                      <div className="text-[10px] text-slate-500">Credit underwriting halt</div>
                    </div>
                  </label>

                  <label
                    onClick={() => handleToggleChannel('liaison')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                      channels.liaison
                        ? 'bg-rose-50/50 border-rose-300 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.liaison}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-semibold text-[11px] flex items-center gap-1">
                        <PhoneForwarded className="w-3 h-3 text-cyan-600" />
                        Law Enforcement Liaison
                      </div>
                      <div className="text-[10px] text-slate-500">Statutory metadata archiving</div>
                    </div>
                  </label>

                  <label
                    onClick={() => handleToggleChannel('lineFreeze')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                      channels.lineFreeze
                        ? 'bg-rose-50/50 border-rose-300 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.lineFreeze}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-semibold text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-purple-600" />
                        Postpaid Limit Freeze
                      </div>
                      <div className="text-[10px] text-slate-500">Instantly locks device credit</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Investigator Forensic Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Forensic Investigator Audit Log Note:
                </label>
                <textarea
                  rows={3}
                  value={investigatorNotes}
                  onChange={(e) => setInvestigatorNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-sans"
                  placeholder="Enter specific forensic observations or intelligence lead details..."
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Logged under ID: INV-SOC-9418</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteDispatch}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Alert & Set CRITICAL</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
