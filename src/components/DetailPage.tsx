import React, { useState } from 'react';
import { Subscriber } from '../types/ipdr';
import { CustomerIdentityCard } from './detail/CustomerIdentityCard';
import { CreditScoreCard } from './detail/CreditScoreCard';
import { TopAppsSummary } from './detail/TopAppsSummary';
import { LocationTracker } from './detail/LocationTracker';
import { WhatsAppCallLogView } from './detail/WhatsAppCallLogView';
import { ActivityLogsView } from './detail/ActivityLogsView';
import { DataConsumptionCharts } from './detail/DataConsumptionCharts';
import { BillingCycleView } from './detail/BillingCycleView';
import { DeviceHistoryView } from './detail/DeviceHistoryView';
import { SecurityAlertsWidget } from './detail/SecurityAlertsWidget';
import { generateSubscriberPdfReport } from '../utils/pdfGenerator';
import { Shield, Navigation, Smartphone, PhoneCall, Database, BarChart3, Receipt, History, ShieldAlert, FileText } from 'lucide-react';

interface DetailPageProps {
  subscriber: Subscriber;
  onBackToSearch: () => void;
  onNavigateToPhone: (phone: string) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  subscriber,
  onBackToSearch,
  onNavigateToPhone,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'security' | 'location' | 'whatsapp' | 'ipdr' | 'billing'>('all');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const navItems = [
    { id: 'all', label: 'Complete Dossier (All Sections)', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security & Anomaly Alerts', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'location', label: '24h Dual Location Tracking', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'whatsapp', label: 'WhatsApp Call Records', icon: <PhoneCall className="w-3.5 h-3.5" /> },
    { id: 'ipdr', label: 'Historic IPDR Activity Logs', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'billing', label: 'Billing Cycle & Quota', icon: <Receipt className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-white min-h-full">
      {/* 1. Customer Identity Dossier Banner */}
      <CustomerIdentityCard
        subscriber={subscriber}
        onBackToSearch={onBackToSearch}
        onRefreshTelemetry={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Section Filter Pills & Quick PDF Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as typeof activeSection)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeSection === item.id
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => generateSubscriberPdfReport(subscriber)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-xs"
          title="Download forensic summary PDF dossier"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Security & Anomaly Alerts Section */}
      {(activeSection === 'all' || activeSection === 'security') && (
        <SecurityAlertsWidget subscriber={subscriber} />
      )}

      {/* Conditional or All Renderings */}
      {(activeSection === 'all' || activeSection === 'location') && (
        <>
          {/* 2. Last 24-Hour Dual Location Tracking (Tower BTS + App GPS) */}
          <LocationTracker
            locationHistory={subscriber.locationHistory}
            subscriberName={subscriber.name}
          />
        </>
      )}

      {activeSection === 'all' && (
        <>
          {/* 3. Credit Scoring & Risk Assessment */}
          <CreditScoreCard creditScore={subscriber.creditScore} />

          {/* 4. Top 5 Most Opened & Highest Bandwidth Consuming Apps */}
          <TopAppsSummary appUsageSummary={subscriber.appUsageSummary} />
        </>
      )}

      {(activeSection === 'all' || activeSection === 'whatsapp') && (
        <>
          {/* 5. WhatsApp Call Logs (Deduplicated with clickable navigation & individual call durations) */}
          <WhatsAppCallLogView
            callGroups={subscriber.whatsappCallGroups}
            onNavigateToPhone={onNavigateToPhone}
          />
        </>
      )}

      {(activeSection === 'all' || activeSection === 'ipdr') && (
        <>
          {/* 6. Historic IPDR Packet Activity Logs */}
          <ActivityLogsView logs={subscriber.ipdrLogs} />

          {/* 7. Graphical Data Consumption Breakdown */}
          <DataConsumptionCharts subscriber={subscriber} />
        </>
      )}

      {(activeSection === 'all' || activeSection === 'billing') && (
        <>
          {/* 8. Summary Table for Billing Cycle Analysis */}
          <BillingCycleView
            billingSummary={subscriber.billingSummary}
            planName={subscriber.planName}
          />

          {/* 9. Handset Device Hardware History & Phone Numbers */}
          <DeviceHistoryView
            deviceHistory={subscriber.deviceHistory}
            phoneHistory={subscriber.phoneHistory}
            currentImei={subscriber.currentImei}
          />
        </>
      )}
    </div>
  );
};
