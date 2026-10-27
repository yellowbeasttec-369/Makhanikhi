import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, query, serverTimestamp, updateDoc, doc, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { AlertTriangle, Car, CheckCircle2, Download, FileText, Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type VehicleRow = {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  registrationNumber?: string;
  vin?: string;
  legalOwnerName?: string;
  createdAt?: unknown;
};

type AgreementRow = {
  id: string;
  createdBy: string;
  ownerId: string;
  custodianId: string;
  participantUids: string[];
  vehicleId: string;
  vehicleLabel: string;
  registrationNumber: string;
  agreementType: 'loan' | 'repair' | 'custody';
  startDate: string;
  expectedReturnDate: string;
  terms: string;
  ownerAcceptedAt?: unknown;
  custodianAcceptedAt?: unknown;
  createdAt?: unknown;
};

const watermark = (pdf: jsPDF) => {
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.saveGraphicsState();
    pdf.setTextColor(215, 215, 215);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('MAKHANIKHI', 105, 148, { align: 'center', angle: 35 });
    pdf.setFontSize(8);
    pdf.setTextColor(110, 110, 110);
    pdf.text('MAKHANIKHI • USER-GENERATED RECORD • NOT LEGAL ADVICE', 105, 287, { align: 'center' });
    pdf.restoreGraphicsState();
  }
};

export const DocumentsAndAgreements: React.FC = () => {
  const { user, profile } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [agreements, setAgreements] = useState<AgreementRow[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    make: '', model: '', year: String(new Date().getFullYear()), registrationNumber: '', vin: '', legalOwnerName: ''
  });
  const [agreementForm, setAgreementForm] = useState({
    vehicleId: '', custodianId: '', agreementType: 'repair' as AgreementRow['agreementType'],
    startDate: new Date().toISOString().slice(0, 10), expectedReturnDate: '', terms: ''
  });

  useEffect(() => {
    if (!user) return;
    const vehicleQuery = query(collection(db, 'vehicles'), where('ownerId', '==', user.uid));
    const stopVehicles = onSnapshot(vehicleQuery, snapshot => {
      setVehicles(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as VehicleRow)));
    }, error => {
      console.error('Could not load vehicles for documents centre:', error);
      toast.error('Could not load your vehicle records. Check your connection and access.');
    });
    const agreementQuery = query(collection(db, 'vehicleAgreements'), where('participantUids', 'array-contains', user.uid));
    const stopAgreements = onSnapshot(agreementQuery, snapshot => {
      setAgreements(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as AgreementRow))
        .sort((a, b) => String((b.createdAt as any)?.seconds || '').localeCompare(String((a.createdAt as any)?.seconds || ''))));
    }, error => {
      console.error('Could not load agreements:', error);
      toast.error('Could not load agreements. The new agreement access rules may not be deployed in this environment.');
    });
    return () => { stopVehicles(); stopAgreements(); };
  }, [user]);

  const selectedVehicle = vehicles.find(vehicle => vehicle.id === agreementForm.vehicleId);
  const possibleDuplicate = useMemo(() => {
    const reg = vehicleForm.registrationNumber.trim().toUpperCase().replace(/\\s+/g, '');
    const vin = vehicleForm.vin.trim().toUpperCase();
    if (!reg && !vin) return false;
    return vehicles.some(vehicle =>
      (reg && (vehicle.registrationNumber || '').toUpperCase().replace(/\\s+/g, '') === reg) ||
      (vin && (vehicle.vin || '').toUpperCase() === vin)
    );
  }, [vehicleForm.registrationNumber, vehicleForm.vin, vehicles]);

  const addVehicle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!vehicleForm.make.trim() || !vehicleForm.model.trim() || !vehicleForm.registrationNumber.trim()) {
      toast.error('Enter the make, model and registration number.');
      return;
    }
    if (possibleDuplicate) {
      toast.error('A matching registration or VIN already exists in your visible garage. Review it before adding another record.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'vehicles'), {
        ownerId: user.uid,
        registeredById: user.uid,
        legalOwnerName: vehicleForm.legalOwnerName.trim() || profile?.displayName || '',
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        year: Number(vehicleForm.year),
        registrationNumber: vehicleForm.registrationNumber.trim().toUpperCase(),
        ...(vehicleForm.vin.trim() ? { vin: vehicleForm.vin.trim().toUpperCase() } : {}),
        mileage: 0,
        serviceHistory: [],
        faults: [],
        isOwnershipVerified: false,
        verificationStatus: 'unverified',
        createdAt: serverTimestamp()
      });
      setVehicleForm({ make: '', model: '', year: String(new Date().getFullYear()), registrationNumber: '', vin: '', legalOwnerName: '' });
      setShowVehicleForm(false);
      toast.success('Vehicle record added. This records registration in Makhanikhi; it does not verify legal ownership.');
    } catch (error) {
      console.error('Vehicle record save failed:', error);
      toast.error('Vehicle could not be saved. Check the Firestore rules and try again.');
    } finally {
      setSaving(false);
    }
  };

  const createAgreement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedVehicle) return;
    if (!agreementForm.custodianId.trim() || agreementForm.custodianId.trim() === user.uid) {
      toast.error('Enter the other participant’s Firebase user UID. It must be different from your own.');
      return;
    }
    if (!agreementForm.expectedReturnDate || agreementForm.expectedReturnDate < agreementForm.startDate) {
      toast.error('Choose an expected return date on or after the start date.');
      return;
    }
    if (!agreementForm.terms.trim()) {
      toast.error('Describe the permitted use/repair, condition, costs and return expectations.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'vehicleAgreements'), {
        createdBy: user.uid,
        ownerId: user.uid,
        custodianId: agreementForm.custodianId.trim(),
        participantUids: [user.uid, agreementForm.custodianId.trim()],
        vehicleId: selectedVehicle.id,
        vehicleLabel: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
        registrationNumber: selectedVehicle.registrationNumber || 'Not recorded',
        agreementType: agreementForm.agreementType,
        startDate: agreementForm.startDate,
        expectedReturnDate: agreementForm.expectedReturnDate,
        terms: agreementForm.terms.trim(),
        ownerAcceptedAt: null,
        custodianAcceptedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowAgreementForm(false);
      setAgreementForm({ vehicleId: '', custodianId: '', agreementType: 'repair', startDate: new Date().toISOString().slice(0, 10), expectedReturnDate: '', terms: '' });
      toast.success('Agreement draft created. The other participant must sign in and acknowledge it separately.');
    } catch (error) {
      console.error('Agreement creation failed:', error);
      toast.error('Agreement draft could not be saved. Check Firestore rules and participant details.');
    } finally {
      setSaving(false);
    }
  };

  const acknowledge = async (agreement: AgreementRow, side: 'owner' | 'custodian') => {
    if (!user) return;
    const allowedUid = side === 'owner' ? agreement.ownerId : agreement.custodianId;
    const field = side === 'owner' ? 'ownerAcceptedAt' : 'custodianAcceptedAt';
    if (user.uid !== allowedUid) {
      toast.error('Only the named participant can record this acknowledgement.');
      return;
    }
    if (agreement[field]) return;
    try {
      await updateDoc(doc(db, 'vehicleAgreements', agreement.id), { [field]: new Date().toISOString(), updatedAt: serverTimestamp() });
      toast.success('Your acknowledgement has been recorded.');
    } catch (error) {
      console.error('Agreement acknowledgement failed:', error);
      toast.error('Could not record acknowledgement. Check the Firestore rules and retry.');
    }
  };

  const downloadAgreement = (agreement: AgreementRow) => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Vehicle Use, Repair & Custody Record', 18, 22);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const lines = [
      `Makhanikhi reference: ${agreement.id}`,
      `Vehicle: ${agreement.vehicleLabel}`,
      `Registration: ${agreement.registrationNumber || 'Not recorded'}`,
      `Agreement type: ${agreement.agreementType}`,
      `Record owner UID: ${agreement.ownerId}`,
      `Custodian UID: ${agreement.custodianId}`,
      `Start date: ${agreement.startDate}`,
      `Expected return: ${agreement.expectedReturnDate}`,
      `Owner acknowledgement: ${agreement.ownerAcceptedAt ? 'Recorded' : 'Not yet recorded'}`,
      `Custodian acknowledgement: ${agreement.custodianAcceptedAt ? 'Recorded' : 'Not yet recorded'}`,
      '',
      'Recorded terms:',
      ...pdf.splitTextToSize(agreement.terms || 'No terms recorded.', 174),
      '',
      'This is a user-generated record, not independent proof of ownership, a legal opinion, a roadworthy certificate, or proof of payment.',
      'Both participants should review the terms and obtain legal advice where appropriate.'
    ];
    let y = 34;
    for (const line of lines) {
      const wrapped = pdf.splitTextToSize(String(line), 174);
      if (y + wrapped.length * 5 > 270) { pdf.addPage(); y = 24; }
      pdf.text(wrapped, 18, y);
      y += wrapped.length * 5 + 2;
    }
    watermark(pdf);
    pdf.save(`makhanikhi-agreement-${agreement.id}.pdf`);
  };

  return (
    <div className="space-y-6 text-digital-white">
      <section className="rounded-2xl border border-technic-yellow/30 bg-technic-yellow/5 p-5 md:p-7">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-technic-yellow" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Documents & Vehicle Custody</h2>
            <p className="mt-2 max-w-3xl text-sm text-text-dim">Keep a shared record of who is responsible for a vehicle, what use or repair was authorised, the expected return date and each participant’s acknowledgement. Records are private to the named participants under the intended Firestore rules.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => setShowVehicleForm(value => !value)} variant="outline" className="border-white/15"><Car className="mr-2 h-4 w-4" /><Plus className="mr-1 h-4 w-4" />Register vehicle</Button>
          <Button onClick={() => setShowAgreementForm(value => !value)} className="bg-technic-yellow font-bold text-industrial-charcoal"><FileText className="mr-2 h-4 w-4" />New agreement</Button>
        </div>
      </section>

      {showVehicleForm && <form onSubmit={addVehicle} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-bold uppercase">Register a vehicle you manage</h3>
        <p className="text-xs text-text-dim">Available to owners, specialists and apprentices. Registering a vehicle here does not claim or verify legal ownership. Duplicate checks only cover vehicles currently visible in your garage.</p>
        {possibleDuplicate && <p className="flex items-center gap-2 text-sm text-amber-300"><AlertTriangle className="h-4 w-4" />Possible duplicate in your visible garage. Review the existing record before continuing.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Make *</Label><Input value={vehicleForm.make} onChange={e => setVehicleForm({ ...vehicleForm, make: e.target.value })} required /></div>
          <div><Label>Model *</Label><Input value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} required /></div>
          <div><Label>Year</Label><Input type="number" min="1900" max={new Date().getFullYear() + 1} value={vehicleForm.year} onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })} required /></div>
          <div><Label>Registration number *</Label><Input value={vehicleForm.registrationNumber} onChange={e => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })} required /></div>
          <div><Label>VIN (optional)</Label><Input value={vehicleForm.vin} onChange={e => setVehicleForm({ ...vehicleForm, vin: e.target.value })} /></div>
          <div><Label>Legal owner name (if different)</Label><Input value={vehicleForm.legalOwnerName} onChange={e => setVehicleForm({ ...vehicleForm, legalOwnerName: e.target.value })} /></div>
        </div>
        <Button type="submit" disabled={saving || possibleDuplicate} className="bg-technic-yellow text-industrial-charcoal">{saving ? 'Saving…' : 'Save vehicle record'}</Button>
      </form>}

      {showAgreementForm && <form onSubmit={createAgreement} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-bold uppercase">Create a vehicle agreement</h3>
        <p className="text-xs text-text-dim">The creator is recorded as the owner/authorising party for this agreement. Enter the other participant’s Firebase UID; a secure email-based invitation flow is a follow-up task.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Vehicle *</Label><select value={agreementForm.vehicleId} onChange={e => setAgreementForm({ ...agreementForm, vehicleId: e.target.value })} required className="h-10 w-full rounded-md border border-white/15 bg-industrial-charcoal px-3 text-sm"><option value="">Select vehicle</option>{vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.year} {vehicle.make} {vehicle.model} — {vehicle.registrationNumber || 'No registration'}</option>)}</select></div>
          <div><Label>Agreement type</Label><select value={agreementForm.agreementType} onChange={e => setAgreementForm({ ...agreementForm, agreementType: e.target.value as AgreementRow['agreementType'] })} className="h-10 w-full rounded-md border border-white/15 bg-industrial-charcoal px-3 text-sm"><option value="repair">Repair authorisation</option><option value="loan">Vehicle loan / use</option><option value="custody">Temporary custody / handover</option></select></div>
          <div><Label>Other participant UID *</Label><Input value={agreementForm.custodianId} onChange={e => setAgreementForm({ ...agreementForm, custodianId: e.target.value })} required /></div>
          <div><Label>Start date *</Label><Input type="date" value={agreementForm.startDate} onChange={e => setAgreementForm({ ...agreementForm, startDate: e.target.value })} required /></div>
          <div><Label>Expected return date *</Label><Input type="date" min={agreementForm.startDate} value={agreementForm.expectedReturnDate} onChange={e => setAgreementForm({ ...agreementForm, expectedReturnDate: e.target.value })} required /></div>
        </div>
        <div><Label>Terms and expectations *</Label><Textarea value={agreementForm.terms} onChange={e => setAgreementForm({ ...agreementForm, terms: e.target.value })} required rows={5} placeholder="Describe permitted use or repairs, existing condition/damage, keys and documents handed over, agreed costs, communication expectations, return condition and how disagreements should be raised." /></div>
        <Button type="submit" disabled={saving || vehicles.length === 0} className="bg-technic-yellow text-industrial-charcoal">{saving ? 'Saving…' : 'Create agreement draft'}</Button>
        {vehicles.length === 0 && <p className="text-xs text-amber-300">Register a vehicle before creating an agreement.</p>}
      </form>}

      <section className="space-y-3">
        <h3 className="text-lg font-black uppercase">My vehicle records ({vehicles.length})</h3>
        {vehicles.length === 0 ? <p className="rounded-xl border border-white/10 p-4 text-sm text-text-dim">No vehicle records are visible yet.</p> : vehicles.map(vehicle => <div key={vehicle.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</p><p className="text-xs text-text-dim">Registration: {vehicle.registrationNumber || 'Not recorded'} · VIN: {vehicle.vin || 'Not recorded'}</p></div><span className="rounded-full border border-amber-400/30 px-2 py-1 text-[10px] uppercase text-amber-200">Ownership not verified</span></div></div>)}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-black uppercase">Agreements & history ({agreements.length})</h3>
        {agreements.length === 0 ? <p className="rounded-xl border border-white/10 p-4 text-sm text-text-dim">No agreements yet. Create a draft, then ask the other participant to sign in to Makhanikhi and acknowledge it.</p> : agreements.map(agreement => {
          const isOwner = user?.uid === agreement.ownerId;
          const myAccepted = isOwner ? agreement.ownerAcceptedAt : agreement.custodianAcceptedAt;
          const otherAccepted = isOwner ? agreement.custodianAcceptedAt : agreement.ownerAcceptedAt;
          const bothAccepted = Boolean(agreement.ownerAcceptedAt && agreement.custodianAcceptedAt);
          return <article key={agreement.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{agreement.vehicleLabel}</p><p className="text-xs text-text-dim">{agreement.registrationNumber} · {agreement.agreementType} · {agreement.startDate} to {agreement.expectedReturnDate}</p></div><span className={`rounded-full border px-2 py-1 text-[10px] uppercase ${bothAccepted ? 'border-emerald-400/30 text-emerald-300' : 'border-amber-400/30 text-amber-200'}`}>{bothAccepted ? 'Both acknowledged' : 'Awaiting acknowledgement'}</span></div>
            <p className="whitespace-pre-wrap text-sm text-text-dim">{agreement.terms}</p>
            <div className="grid gap-2 text-xs sm:grid-cols-2"><p>{agreement.ownerAcceptedAt ? <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-300" /> : '○ '}Authorising party: {agreement.ownerAcceptedAt ? 'acknowledged' : 'pending'}</p><p>{agreement.custodianAcceptedAt ? <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-300" /> : '○ '}Custodian: {agreement.custodianAcceptedAt ? 'acknowledged' : 'pending'}</p></div>
            <div className="flex flex-wrap gap-2">
              {!myAccepted && <Button size="sm" variant="outline" onClick={() => acknowledge(agreement, isOwner ? 'owner' : 'custodian')}>I acknowledge as {isOwner ? 'owner' : 'custodian'}</Button>}
              {!otherAccepted && <span className="self-center text-xs text-text-dim">Waiting for the other participant’s acknowledgement.</span>}
              <Button size="sm" onClick={() => downloadAgreement(agreement)} className="bg-technic-yellow text-industrial-charcoal"><Download className="mr-2 h-4 w-4" />Download watermarked PDF</Button>
            </div>
          </article>;
        })}
      </section>

      <p className="flex items-start gap-2 text-xs text-text-dim"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />This initial release stores acknowledgements and generates a PDF; it does not yet send emails, upload attachments, independently verify signatures/ownership, create official roadworthy certificates, or move money into escrow. Agreement templates should receive legal review before being relied on as enforceable contracts.</p>
    </div>
  );
};
