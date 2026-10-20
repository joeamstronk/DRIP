import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscriber } from '../types/ipdr';

export const generateSubscriberPdfReport = (subscriber: Subscriber, operatorName = 'Capt. Hendra Gunawan') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [14, 116, 144]; // Cyan / Teal (#0e7490)
  const darkTextColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const mutedTextColor: [number, number, number] = [100, 116, 139]; // Slate 500

  const pageWidth = doc.internal.pageSize.getWidth();

  // --- HEADER: Government & Carrier Telemetry Classification ---
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252);
  doc.text('IPDR FORENSIC SUBSCRIBER DOSSIER', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('NATIONAL TELECOMMUNICATION METADATA AUDIT & LAWFUL INTERCEPTION REGISTRY', 14, 18);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248); // Cyan
  doc.text('CLASSIFICATION: LEVEL-4 RESTRICTED // FORENSIC AUDIT', 14, 23);

  // Metadata block on right side
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`REPORT ID: AUD-${Date.now().toString().slice(-8)}`, pageWidth - 14, 11, { align: 'right' });
  doc.text(`GENERATED: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`, pageWidth - 14, 16, { align: 'right' });
  doc.text(`AUDITOR: ${operatorName.toUpperCase()}`, pageWidth - 14, 21, { align: 'right' });

  let currentY = 36;

  // --- SECTION 1: SUBSCRIBER IDENTIFICATION ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('1. SUBSCRIBER IDENTITY & HARDWARE ALLOCATION', 14, currentY);
  currentY += 4;

  const identityData = [
    ['Full Legal Name', subscriber.name, 'Civil Number ID (NIK)', subscriber.civilId],
    ['Phone Number (MSISDN)', subscriber.phone, 'Subscriber ID (IMSI)', `${subscriber.id} / ${subscriber.simCardImsi}`],
    ['Current Public IPv4', subscriber.currentIp, 'Current IPv6 Prefix', subscriber.currentIpv6],
    ['Active Device Model', subscriber.deviceModel, 'Active Handset IMEI', `${subscriber.currentImei} (TAC: ${subscriber.tacCode})`],
    ['Subscription Plan', subscriber.planName, 'Line Status', `${subscriber.status} (${subscriber.lastActive})`],
    ['Registered Address', subscriber.registeredAddress, 'Metro City / Region', subscriber.city],
  ];

  autoTable(doc, {
    startY: currentY,
    body: identityData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: darkTextColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      3: { cellWidth: 50 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- SECTION 2: TELCO ALTERNATIVE CREDIT SCORING ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('2. TELCO ALTERNATIVE CREDIT SCORING & BEHAVIORAL PROFILE', 14, currentY);
  currentY += 4;

  const credit = subscriber.creditScore;
  const creditData = [
    [
      'Rating Score',
      `${credit.score} / 850 (Grade: ${credit.grade})`,
      'Default Risk Level',
      `${credit.riskLevel} DEFAULT RISK`,
    ],
    [
      'Payment Timeliness',
      `${credit.paymentHistoryPercent}% On-Time Settlements`,
      'Monthly Spend Avg',
      `IDR ${credit.monthlyRechargeAvgIdr.toLocaleString('id-ID')} / month`,
    ],
    [
      'SIM Line Tenure',
      `${credit.simTenureMonths} Continuous Months`,
      'Device Stability Index',
      `${credit.deviceStabilityIndex} / 100 (Low Hardware Churn)`,
    ],
    [
      'Approved Credit Limit',
      `IDR ${credit.creditLimitIdr.toLocaleString('id-ID')}`,
      'Postpaid Financing Status',
      credit.postpaidEligible ? 'QUALIFIED / APPROVED' : 'RESTRICTED',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: creditData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: darkTextColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      3: { cellWidth: 50 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- SECTION 3: LAST 24-HOUR DUAL LOCATION HISTORY ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('3. LAST 24-HOUR LOCATION TELEMETRY (TOWER BTS & APP GPS)', 14, currentY);
  currentY += 4;

  const locationRows = subscriber.locationHistory.map((loc, idx) => {
    const isTower = loc.sourceType === 'CELL_TOWER';
    return [
      (idx + 1).toString(),
      new Date(loc.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      `${loc.hourOffset.toFixed(1)}h ago`,
      isTower ? 'CELL TOWER BTS' : 'APP GPS PERMISSION',
      loc.locationName,
      isTower ? `CID: ${loc.cellId} | LAC: ${loc.lac}` : `App: ${loc.appName}`,
      `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
      isTower ? `±${loc.estimatedRadiusMeters}m (Az: ${loc.azimuth}°)` : `±${loc.accuracyMeters}m (Alt: ${loc.altitudeMeters}m)`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Time', 'Offset', 'Source', 'Location / Sector', 'Network Identifier', 'Coordinates', 'Precision']],
    body: locationRows,
    theme: 'striped',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: darkTextColor,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 6, halign: 'center' },
      1: { cellWidth: 14 },
      2: { cellWidth: 14 },
      3: { cellWidth: 28, fontStyle: 'bold' },
      4: { cellWidth: 44 },
      5: { cellWidth: 32 },
      6: { cellWidth: 24, font: 'courier' },
      7: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
  });

  // Check if we need to add a new page for Section 4
  if ((doc as any).lastAutoTable.finalY > 210) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- SECTION 4: WHATSAPP CALL LOGS (DEDUPLICATED & INDIVIDUAL SESSIONS) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('4. WHATSAPP ENCRYPTED VOIP CALL RECORDS & CALL DURATION', 14, currentY);
  currentY += 4;

  const callRows: string[][] = [];
  subscriber.whatsappCallGroups.forEach((group) => {
    group.individualCalls.forEach((call, cIdx) => {
      callRows.push([
        group.contactName,
        group.contactPhone,
        `${group.totalCallsCount} calls total`,
        `${call.callType} (${call.direction})`,
        new Date(call.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        call.durationFormatted, // Individual talk time
        `${call.relayServerIp}:${call.relayPort}`,
        call.status,
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Contact Name', 'Phone MSISDN', 'Call Freq', 'Type & Direction', 'Timestamp', 'Talk Duration', 'Relay IP', 'Status']],
    body: callRows,
    theme: 'striped',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: darkTextColor,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 28, font: 'courier' },
      2: { cellWidth: 18 },
      3: { cellWidth: 22 },
      4: { cellWidth: 24 },
      5: { cellWidth: 20, fontStyle: 'bold', textColor: [14, 116, 144] },
      6: { cellWidth: 24, font: 'courier' },
      7: { cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer & Cryptographic Audit Seal
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...mutedTextColor);

    // Bottom border line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 285, pageWidth - 14, 285);

    doc.text(
      'FORENSIC RECORD CONFIDENTIALITY NOTICE: This metadata document is generated under official carrier regulatory warrants. Unauthorized disclosure is strictly prohibited under Law No. 1/2024.',
      14,
      290
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, 290, { align: 'right' });
  }

  // Trigger browser download of PDF file
  const fileName = `IPDR_Forensic_Dossier_${subscriber.civilId}_${Date.now()}.pdf`;
  doc.save(fileName);
};
