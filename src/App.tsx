import React, { useState } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SearchingPage } from './components/SearchingPage';
import { DetailPage } from './components/DetailPage';
import { OperatorUser, Subscriber } from './types/ipdr';
import { MOCK_SUBSCRIBERS, CURRENT_OPERATOR } from './data/mockData';

export default function App() {
  const [operator, setOperator] = useState<OperatorUser | null>(CURRENT_OPERATOR);
  const [activeTab, setActiveTab] = useState<'search' | 'detail'>('search');
  const [subscribers, setSubscribers] = useState<Subscriber[]>(MOCK_SUBSCRIBERS);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(
    MOCK_SUBSCRIBERS[0]
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLoginSuccess = (op: OperatorUser) => {
    setOperator(op);
    setActiveTab('search');
    showToast(`Session established for Operator: ${op.name} (${op.role})`);
  };

  const handleLogout = () => {
    setOperator(null);
    setActiveTab('search');
  };

  const handleSelectSubscriber = (sub: Subscriber) => {
    setSelectedSubscriber(sub);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cross-subscriber navigation when clicking a phone number in WhatsApp call log
  const handleNavigateToPhone = (phoneToFind: string) => {
    const cleanPhone = phoneToFind.replace(/[^0-9]/g, '');
    const found = subscribers.find(
      (s) => s.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (found) {
      setSelectedSubscriber(found);
      setActiveTab('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Navigated to dossier: ${found.name} (${found.phone})`);
    } else {
      // If number is external (like Ahmad Fahri), synthesize an on-demand verified carrier profile
      const newSubscriber: Subscriber = {
        id: `SUB-ID-${Math.floor(100000 + Math.random() * 900000)}`,
        name: 'Ahmad Fahri (External Partner)',
        civilId: '3172031109920008',
        photoUrl: MOCK_SUBSCRIBERS[2].photoUrl,
        phone: phoneToFind,
        currentIp: '180.250.19.45',
        currentIpv6: '2404:c0:9912:4410::09',
        status: 'ONLINE',
        registeredAddress: 'Jl. Fatmawati Raya No. 88, Cilandak, Jakarta Selatan',
        city: 'Jakarta Selatan',
        planName: 'Telco Business Flexi 80GB',
        carrier: 'TelcoNet Indonesia',
        simCardImsi: '510100881920194',
        currentImei: '864810294819203',
        tacCode: '864810-04',
        deviceModel: 'Samsung Galaxy A55 5G',
        lastActive: '10 mins ago',
        creditScore: {
          score: 710,
          grade: 'B (Standard)',
          riskLevel: 'MODERATE',
          paymentHistoryPercent: 97.4,
          monthlyRechargeAvgIdr: 250000,
          simTenureMonths: 32,
          deviceStabilityIndex: 88,
          creditLimitIdr: 8000000,
          postpaidEligible: true,
          scoreFactors: [
            { label: 'Active SIM Record', impact: 'POSITIVE', detail: 'Consistent monthly activity for 32 months.' },
            { label: 'Low Roaming Activity', impact: 'NEUTRAL', detail: '100% domestic usage.' },
          ],
          scoreHistory: [
            { month: 'May 2026', monthShort: 'May', score: 680, grade: 'B', change: 0, changeDirection: 'STABLE', event: 'Active subscription baseline' },
            { month: 'Jun 2026', monthShort: 'Jun', score: 688, grade: 'B', change: 8, changeDirection: 'UP', event: 'Timely invoice settlement' },
            { month: 'Jul 2026', monthShort: 'Jul', score: 694, grade: 'B', change: 6, changeDirection: 'UP', event: 'Consistent package reload' },
            { month: 'Aug 2026', monthShort: 'Aug', score: 700, grade: 'B', change: 6, changeDirection: 'UP', event: 'Zero reported fraud incidents' },
            { month: 'Sep 2026', monthShort: 'Sep', score: 705, grade: 'B', change: 5, changeDirection: 'UP', event: 'Device stability verified' },
            { month: 'Oct 2026', monthShort: 'Oct', score: 710, grade: 'B (Standard)', change: 5, changeDirection: 'UP', event: 'Current billing period evaluated' },
          ],
        },
        appUsageSummary: {
          mostOpened: [
            { appId: 'com.whatsapp', appName: 'WhatsApp Messenger', category: 'VoIP', iconName: 'MessageCircle', openCount24h: 112, avgSessionMinutes: 4.2, lastOpened: '10 mins ago' },
            { appId: 'com.android.chrome', appName: 'Google Chrome', category: 'Web', iconName: 'Globe', openCount24h: 34, avgSessionMinutes: 6.0, lastOpened: '30 mins ago' },
            { appId: 'com.tokopedia.tkpd', appName: 'Tokopedia', category: 'Shopping', iconName: 'Share2', openCount24h: 20, avgSessionMinutes: 8.5, lastOpened: '2 hrs ago' },
            { appId: 'com.google.android.youtube', appName: 'YouTube', category: 'Video', iconName: 'PlaySquare', openCount24h: 14, avgSessionMinutes: 20.0, lastOpened: '4 hrs ago' },
            { appId: 'com.bca', appName: 'BCA Mobile', category: 'Finance', iconName: 'Landmark', openCount24h: 8, avgSessionMinutes: 2.0, lastOpened: '5 hrs ago' },
          ],
          mostDataConsuming: [
            { appId: 'com.google.android.youtube', appName: 'YouTube Stream', category: 'Video', iconName: 'PlaySquare', totalMb: 12400, foregroundMb: 12100, backgroundMb: 300, percentOfTotal: 44.2 },
            { appId: 'com.whatsapp', appName: 'WhatsApp Media', category: 'VoIP', iconName: 'MessageCircle', totalMb: 5200, foregroundMb: 4100, backgroundMb: 1100, percentOfTotal: 18.5 },
            { appId: 'com.android.chrome', appName: 'Chrome Browser', category: 'Web', iconName: 'Globe', totalMb: 4100, foregroundMb: 3950, backgroundMb: 150, percentOfTotal: 14.6 },
            { appId: 'com.tokopedia.tkpd', appName: 'Tokopedia', category: 'Shopping', iconName: 'Share2', totalMb: 2400, foregroundMb: 2300, backgroundMb: 100, percentOfTotal: 8.5 },
            { appId: 'com.instagram.android', appName: 'Instagram', category: 'Social', iconName: 'Camera', totalMb: 1900, foregroundMb: 1800, backgroundMb: 100, percentOfTotal: 6.8 },
          ],
        },
        locationHistory: [
          {
            id: 'LOC-AF01',
            timestamp: '2026-10-20T07:20:00Z',
            hourOffset: 0.6,
            sourceType: 'APP_PERMISSION',
            lat: -6.2905,
            lng: 106.7970,
            locationName: 'Fatmawati Central Commercial Area',
            appName: 'WhatsApp Messenger',
            appPackage: 'com.whatsapp',
            accuracyMeters: 8,
            altitudeMeters: 45,
          },
          {
            id: 'LOC-AF02',
            timestamp: '2026-10-20T04:10:00Z',
            hourOffset: 3.8,
            sourceType: 'CELL_TOWER',
            lat: -6.2880,
            lng: 106.8000,
            locationName: 'BTS Fatmawati Raya (Cell ID: 36112)',
            cellId: '36112',
            lac: '1084',
            azimuth: 180,
            signalStrengthDbm: -68,
            estimatedRadiusMeters: 280,
            towerName: 'Tower Telco FTW-02',
          },
        ],
        whatsappCallGroups: [
          {
            contactPhone: '+62 812-5550-1928',
            contactName: 'Budi Santoso',
            contactCivilId: '3174051904880003',
            linkedSubscriberId: 'SUB-ID-904281',
            totalCallsCount: 2,
            outgoingCallsCount: 1,
            incomingCallsCount: 1,
            totalDurationSeconds: 175,
            totalDurationFormatted: '02m 55s',
            lastCallTimestamp: '2026-10-19T11:20:00Z',
            individualCalls: [
              {
                id: 'WAC-AF01',
                timestamp: '2026-10-19T11:20:00Z',
                callType: 'AUDIO',
                direction: 'INCOMING',
                durationSeconds: 130,
                durationFormatted: '02m 10s',
                relayServerIp: '157.240.214.52',
                relayPort: 3478,
                protocol: 'STUN/UDP',
                codec: 'OPUS 16kHz',
                status: 'COMPLETED',
                packetLossPercent: 0.0,
                jitterMs: 15,
              },
              {
                id: 'WAC-AF02',
                timestamp: '2026-10-19T07:50:00Z',
                callType: 'AUDIO',
                direction: 'OUTGOING',
                durationSeconds: 45,
                durationFormatted: '00m 45s',
                relayServerIp: '157.240.214.54',
                relayPort: 3478,
                protocol: 'STUN/UDP',
                codec: 'OPUS 16kHz',
                status: 'COMPLETED',
                packetLossPercent: 0.1,
                jitterMs: 18,
              },
            ],
          },
        ],
        ipdrLogs: [
          {
            id: 'IPDR-AF01',
            startTime: '2026-10-20T07:15:00Z',
            endTime: '2026-10-20T07:45:00Z',
            durationSeconds: 1800,
            sourceIp: '10.160.22.81',
            sourcePort: 49120,
            natPublicIp: '180.250.19.45',
            natPublicPort: 28190,
            destinationIp: '157.240.214.52',
            destinationPort: 3478,
            domain: 'g.whatsapp.net',
            protocol: 'UDP',
            applicationCategory: 'VoIP',
            bytesIn: 18400000,
            bytesOut: 9800000,
            totalBytes: 28200000,
            terminationReason: 'ACTIVE',
          },
        ],
        billingSummary: {
          cyclePeriod: '01 Oct 2026 - 31 Oct 2026',
          daysRemaining: 11,
          quotaAllocatedGb: 80.0,
          quotaUsedGb: 44.2,
          peakHourUsageGb: 31.0,
          offPeakUsageGb: 13.2,
          domesticUsageGb: 44.2,
          roamingUsageGb: 0.0,
          overageChargesIdr: 0,
          fupStatus: 'NORMAL',
          currentMonthlyBillIdr: 250000,
          projectedCycleEndUsageGb: 62.0,
        },
        deviceHistory: [
          {
            imei: '864810294819203',
            model: 'Samsung Galaxy A55 5G',
            firstSeen: '2024-03-22',
            lastSeen: 'Active (Current)',
            tacCode: '864810-04',
            isCurrent: true,
            osVersion: 'Android 15',
            dualSimSlots: 2,
          },
        ],
        phoneHistory: [
          {
            msisdn: phoneToFind,
            simImsi: '510100881920194',
            activatedDate: '2023-08-10',
            status: 'ACTIVE',
            carrier: 'TelcoNet Indonesia Postpaid',
          },
        ],
        familyTree: {
          familyCardNumber: '3172031804100088',
          headOfHouseholdName: 'Ahmad Fahri',
          registeredAddress: 'Jl. Fatmawati Raya No. 88, Cilandak, Jakarta Selatan',
          rtRw: '002 / 005',
          kelurahan: 'Cilandak Barat',
          kecamatan: 'Cilandak',
          kabupatenKota: 'Kota Jakarta Selatan',
          provinsi: 'DKI Jakarta',
          postalCode: '12430',
          issuingDate: '2023-01-10',
          dukcapilRegionCode: '31.72.03',
          members: [
            {
              nik: '3172031109920008',
              name: 'Ahmad Fahri',
              relationship: 'HEAD_OF_HOUSEHOLD',
              relationshipLabel: 'Kepala Keluarga (Self)',
              gender: 'MALE',
              birthDate: '1992-09-11',
              birthPlace: 'Jakarta',
              age: 34,
              religion: 'Islam',
              education: 'Sarjana (S1)',
              occupation: 'Business Development Specialist',
              maritalStatus: 'MARRIED',
              bloodType: 'O',
              phone: phoneToFind,
              carrier: 'TelcoNet Indonesia Postpaid',
              telcoStatus: 'ACTIVE_SUBSCRIBER',
              isTargetSubscriber: true,
              generation: 2,
            },
            {
              nik: '3172035201940003',
              name: 'Indah Permatasari',
              relationship: 'SPOUSE',
              relationshipLabel: 'Istri (Spouse)',
              gender: 'FEMALE',
              birthDate: '1994-01-12',
              birthPlace: 'Semarang',
              age: 32,
              religion: 'Islam',
              education: 'Sarjana (S1)',
              occupation: 'Marketing Lead',
              maritalStatus: 'MARRIED',
              bloodType: 'A',
              phone: '+62 812-7788-3321',
              carrier: 'TelcoNet Indonesia Postpaid',
              telcoStatus: 'ACTIVE_SUBSCRIBER',
              generation: 2,
            },
            {
              nik: '3172032004210001',
              name: 'Zayn Fahri',
              relationship: 'CHILD',
              relationshipLabel: 'Anak (Son)',
              gender: 'MALE',
              birthDate: '2021-04-20',
              birthPlace: 'Jakarta',
              age: 5,
              religion: 'Islam',
              education: 'Belum Sekolah',
              occupation: 'Belum Bekerja',
              maritalStatus: 'SINGLE',
              bloodType: 'O',
              telcoStatus: 'UNREGISTERED_MINOR',
              generation: 3,
            },
          ],
        },
      };

      setSubscribers((prev) => [...prev, newSubscriber]);
      setSelectedSubscriber(newSubscriber);
      setActiveTab('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Cross-referenced and generated dossier for ${phoneToFind}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        operator={operator}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        activeSubscriberName={selectedSubscriber?.name}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-2.5 rounded-lg shadow-xl font-mono-numbers animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {!operator ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : activeTab === 'search' ? (
          <SearchingPage
            subscribers={subscribers}
            onSelectSubscriber={handleSelectSubscriber}
          />
        ) : selectedSubscriber ? (
          <DetailPage
            subscriber={selectedSubscriber}
            onBackToSearch={() => setActiveTab('search')}
            onNavigateToPhone={handleNavigateToPhone}
          />
        ) : (
          <SearchingPage
            subscribers={subscribers}
            onSelectSubscriber={handleSelectSubscriber}
          />
        )}
      </main>
    </div>
  );
}
