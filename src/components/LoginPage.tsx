import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, ArrowRight, Activity, Terminal } from 'lucide-react';
import { OperatorUser } from '../types/ipdr';
import { CURRENT_OPERATOR } from '../data/mockData';

interface LoginPageProps {
  onLoginSuccess: (operator: OperatorUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [operatorId, setOperatorId] = useState('NOC-OP-77491');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<OperatorUser['role']>('Cyber Intelligence Analyst');
  const [clearance, setClearance] = useState<OperatorUser['clearanceLevel']>('LEVEL_4_RESTRICTED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId.trim()) {
      setError('Please provide an authorized Operator ID');
      return;
    }
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        ...CURRENT_OPERATOR,
        operatorId,
        role,
        clearanceLevel: clearance,
      });
    }, 600);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(CURRENT_OPERATOR);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Terminal Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">IPDR System Access</h1>
                <p className="text-xs text-slate-400 font-mono-numbers">
                  Authorized Personnel Telemetry Gateway
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono-numbers">
              <Activity className="w-3 h-3 text-emerald-400" />
              NODE READY
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Operator Identifier (OID)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-numbers"
                  placeholder="e.g. NOC-OP-77491"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Security Token / Master Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-numbers"
                  placeholder="Enter security passkey"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Operating Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as OperatorUser['role'])}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Cyber Intelligence Analyst">Cyber Intelligence</option>
                  <option value="NOC Lead Engineer">NOC Lead Engineer</option>
                  <option value="Lawful Compliance Officer">Lawful Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Clearance Level
                </label>
                <select
                  value={clearance}
                  onChange={(e) => setClearance(e.target.value as OperatorUser['clearanceLevel'])}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-numbers"
                >
                  <option value="LEVEL_3_CONFIDENTIAL">Level 3 (Confidential)</option>
                  <option value="LEVEL_4_RESTRICTED">Level 4 (Restricted)</option>
                  <option value="LEVEL_5_TOP_SECRET">Level 5 (Top Secret)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
              >
                {isLoading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Authenticate & Access IPDR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>One-Click Quick Login (Senior NOC Analyst)</span>
              </button>
            </div>
          </form>

          {/* Legal Compliance Footer Notice */}
          <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span>
              All search queries and record exports are cryptographically logged in the National Telecom Compliance Audit Vault under Law No. 11/2008 & 1/2024.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
