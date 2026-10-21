import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Phone,
  ArrowRight,
  Copy,
  Check,
  FileText,
  BadgeCheck,
  Info,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Baby,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { FamilyTreeData, FamilyMember } from '../../types/ipdr';

interface FamilyTreeViewProps {
  familyTree?: FamilyTreeData;
  targetNik: string;
  onNavigateToPhone: (phone: string) => void;
}

export const FamilyTreeView: React.FC<FamilyTreeViewProps> = ({
  familyTree,
  targetNik,
  onNavigateToPhone,
}) => {
  const [viewMode, setViewMode] = useState<'TREE' | 'TABLE'>('TREE');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [copiedNik, setCopiedNik] = useState<string | null>(null);

  if (!familyTree) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
        <Users className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Family Registry Linked</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No civil registry Kartu Keluarga record is currently linked to NIK {targetNik} in the local cache.
        </p>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNik(text);
    setTimeout(() => {
      setCopiedNik(null);
    }, 2000);
  };

  // Group members by generations for the visual tree
  const gen1Parents = familyTree.members.filter((m) => m.generation === 1);
  const gen2Couples = familyTree.members.filter((m) => m.generation === 2);
  const gen3Children = familyTree.members.filter((m) => m.generation === 3);

  const getRelationshipBadgeColor = (rel: FamilyMember['relationship'], isTarget?: boolean) => {
    if (isTarget) return 'bg-cyan-600 text-white font-bold ring-2 ring-cyan-400 ring-offset-1';
    switch (rel) {
      case 'HEAD_OF_HOUSEHOLD':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SPOUSE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'CHILD':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PARENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SIBLING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const renderMemberCard = (member: FamilyMember) => {
    const isTarget = member.nik === targetNik || member.isTargetSubscriber;

    return (
      <div
        key={member.nik}
        onClick={() => setSelectedMember(member)}
        className={`relative group cursor-pointer bg-white rounded-xl p-4 transition-all duration-200 border text-left ${
          isTarget
            ? 'border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {isTarget && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 tracking-wider whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-cyan-200" />
            <span>Target NIK Dossier</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                isTarget
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                  : member.gender === 'MALE'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {member.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900 text-sm leading-tight group-hover:text-cyan-700 transition-colors">
                  {member.name}
                </span>
              </div>
              <span
                className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getRelationshipBadgeColor(
                  member.relationship,
                  isTarget
                )}`}
              >
                {member.relationshipLabel}
              </span>
            </div>
          </div>
        </div>

        {/* NIK Block */}
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center justify-between text-xs font-mono-numbers mb-2.5">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">
              NIK (Civil ID)
            </span>
            <span className="font-bold text-slate-800 tracking-wide text-xs">{member.nik}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(member.nik);
            }}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
            title="Copy NIK"
          >
            {copiedNik === member.nik ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Member Details Mini Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 mb-3">
          <div className="flex items-center gap-1 truncate">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {member.age} yo ({member.birthPlace})
            </span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate" title={member.occupation}>
              {member.occupation}
            </span>
          </div>
        </div>

        {/* Telecom Link Status */}
        {member.phone ? (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">
                Linked Phone
              </span>
              <span className="text-xs font-bold text-cyan-700 font-mono-numbers truncate block">
                {member.phone}
              </span>
            </div>
            {!isTarget && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToPhone(member.phone!);
                }}
                className="shrink-0 px-2 py-1 bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 border border-cyan-200"
                title="Cross-navigate to this family member's telecom dossier"
              >
                <span>Dossier</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>
              {member.telcoStatus === 'UNREGISTERED_MINOR' ? 'Minor / Dependent' : 'No Active Line'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      {/* 1. Header Zone: Kartu Keluarga Title & Civil Registry Authority */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Family Tree & Civil Registry (Kartu Keluarga)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span>Verified Dukcapil Kemendagri</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kinship graph and statutory family lineage cross-referenced via civil identification number (NIK).
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('TREE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'TREE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Family Hierarchy Tree</span>
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'TABLE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official KK Table</span>
          </button>
        </div>
      </div>

      {/* 2. Official Kartu Keluarga Summary Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono-numbers">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              Nomor Kartu Keluarga (KK)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-wider">
                {familyTree.familyCardNumber}
              </span>
              <button
                onClick={() => handleCopy(familyTree.familyCardNumber)}
                className="text-slate-400 hover:text-slate-700"
                title="Copy Family Card Number"
              >
                {copiedNik === familyTree.familyCardNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              Kepala Keluarga (Head of House)
            </span>
            <div className="text-sm font-bold text-slate-800 font-sans">
              {familyTree.headOfHouseholdName}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              Civil Jurisdiction
            </span>
            <div className="text-xs text-slate-700 font-sans">
              {familyTree.kecamatan}, {familyTree.kabupatenKota}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              Registered Address
            </span>
            <div className="text-xs text-slate-700 font-sans truncate" title={familyTree.registeredAddress}>
              {familyTree.registeredAddress}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main View: Diagram Tree OR Official Table */}
      {viewMode === 'TREE' ? (
        <div className="space-y-8 pt-2">
          {/* Generation 1: Parents / Grandparents */}
          {gen1Parents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Generation 1: Orang Tua / Mertua (Parents)
                </h4>
                <span className="text-[11px] text-slate-500">({gen1Parents.length} registered)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gen1Parents.map((member) => renderMemberCard(member))}
              </div>

              {/* Generational Connector Line */}
              <div className="flex justify-center my-2">
                <div className="h-6 w-0.5 bg-slate-300" />
              </div>
            </div>
          )}

          {/* Generation 2: Target & Spouse (Core Family) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generation 2: Kepala Keluarga & Pasangan (Spouse / Target)
              </h4>
              <span className="text-[11px] text-slate-500">({gen2Couples.length} members)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gen2Couples.map((member) => renderMemberCard(member))}
            </div>

            {/* Generational Connector Line */}
            {gen3Children.length > 0 && (
              <div className="flex justify-center my-2">
                <div className="h-6 w-0.5 bg-slate-300" />
              </div>
            )}
          </div>

          {/* Generation 3: Children */}
          {gen3Children.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Generation 3: Anak Kandung (Children / Dependents)
                </h4>
                <span className="text-[11px] text-slate-500">({gen3Children.length} registered)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gen3Children.map((member) => renderMemberCard(member))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* OFFICIAL KARTU KELUARGA TABLE */
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Nama Lengkap</th>
                  <th className="py-3 px-3 font-mono">NIK</th>
                  <th className="py-3 px-3">Hubungan</th>
                  <th className="py-3 px-3">JK</th>
                  <th className="py-3 px-3">Tempat, Tgl Lahir</th>
                  <th className="py-3 px-3">Agama</th>
                  <th className="py-3 px-3">Pendidikan</th>
                  <th className="py-3 px-3">Pekerjaan</th>
                  <th className="py-3 px-3">Status Kawin</th>
                  <th className="py-3 px-3">Gol. Darah</th>
                  <th className="py-3 px-3">No. Telepon (MSISDN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {familyTree.members.map((m, idx) => {
                  const isTarget = m.nik === targetNik || m.isTargetSubscriber;
                  return (
                    <tr
                      key={m.nik}
                      onClick={() => setSelectedMember(m)}
                      className={`cursor-pointer transition-colors ${
                        isTarget
                          ? 'bg-cyan-50/70 font-semibold text-slate-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono-numbers">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{m.name}</span>
                          {isTarget && (
                            <span className="text-[10px] bg-cyan-600 text-white px-1.5 py-0.2 rounded font-bold">
                              TARGET
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">{m.nik}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${getRelationshipBadgeColor(
                            m.relationship,
                            isTarget
                          )}`}
                        >
                          {m.relationshipLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3">{m.gender === 'MALE' ? 'L' : 'P'}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {m.birthPlace}, {m.birthDate} ({m.age} thn)
                      </td>
                      <td className="py-3 px-3">{m.religion}</td>
                      <td className="py-3 px-3">{m.education}</td>
                      <td className="py-3 px-3">{m.occupation}</td>
                      <td className="py-3 px-3">{m.maritalStatus}</td>
                      <td className="py-3 px-3 text-center">{m.bloodType}</td>
                      <td className="py-3 px-3 font-mono text-cyan-700">
                        {m.phone ? (
                          <div className="flex items-center gap-2">
                            <span>{m.phone}</span>
                            {!isTarget && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToPhone(m.phone!);
                                }}
                                className="text-cyan-700 hover:text-cyan-900"
                                title="Inspect this phone"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans italic text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Modal / Drawer for Member Inspection */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base border ${
                    selectedMember.gender === 'MALE'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {selectedMember.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 font-mono-numbers">
                      NIK: {selectedMember.nik}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedMember.nik)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedNik === selectedMember.nik ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Family Status
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedMember.relationshipLabel}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Birth Place & Date
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedMember.birthPlace}, {selectedMember.birthDate} ({selectedMember.age} yo)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Education Level
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedMember.education}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Occupation
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedMember.occupation}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Marital Status
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedMember.maritalStatus}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Blood Type & Religion
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  Type {selectedMember.bloodType} / {selectedMember.religion}
                </span>
              </div>
            </div>

            {/* Telecom Intelligence Status in Modal */}
            <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 block">
                Carrier Line Correlation
              </span>
              {selectedMember.phone ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold font-mono text-cyan-900">
                      {selectedMember.phone}
                    </div>
                    <div className="text-[11px] text-cyan-700">
                      {selectedMember.carrier || 'TelcoNet Indonesia Network'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const phone = selectedMember.phone!;
                      setSelectedMember(null);
                      onNavigateToPhone(phone);
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Investigate Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  No active carrier subscription linked under this NIK (dependent/minor).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
