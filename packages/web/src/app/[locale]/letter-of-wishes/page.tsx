'use client';

import { useState, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import { Shield, ChevronLeft, ChevronRight, Download, Lock, Plus, Trash2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Contact { name: string; contact: string }
interface BankAccount { institution: string; accountType: string }
interface InsurancePolicy { provider: string; policyNumber: string }
interface PensionFund { provider: string; details: string }
interface Property { description: string }
interface DigitalAccount { description: string }
interface SentimentalItem { item: string; person: string }

interface FormData {
  // Step 1
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  countryOfResidence: string;
  countryOfOrigin: string;
  // Step 2
  burialPreference: 'burial' | 'cremation' | '';
  funeralWishes: string;
  religiousPreferences: string;
  musicAndReadings: string;
  // Step 3
  messageToPartner: string;
  messageToChildren: string;
  messageToParents: string;
  otherMessages: string;
  // Step 4
  executor: Contact;
  financialAdvisor: Contact;
  attorney: Contact;
  otherContacts: Contact[];
  // Step 5
  bankAccounts: BankAccount[];
  insurancePolicies: InsurancePolicy[];
  pensionFunds: PensionFund[];
  properties: Property[];
  digitalAccounts: DigitalAccount[];
  // Step 6
  petCareInstructions: string;
  sentimentalItems: SentimentalItem[];
  charityDonations: string;
  otherWishes: string;
}

const initialFormData: FormData = {
  fullName: '', dateOfBirth: '', idNumber: '', countryOfResidence: '', countryOfOrigin: '',
  burialPreference: '', funeralWishes: '', religiousPreferences: '', musicAndReadings: '',
  messageToPartner: '', messageToChildren: '', messageToParents: '', otherMessages: '',
  executor: { name: '', contact: '' }, financialAdvisor: { name: '', contact: '' }, attorney: { name: '', contact: '' }, otherContacts: [],
  bankAccounts: [], insurancePolicies: [], pensionFunds: [], properties: [], digitalAccounts: [],
  petCareInstructions: '', sentimentalItems: [], charityDonations: '', otherWishes: '',
};

const STEPS = [
  'Personal Details',
  'Funeral & Burial Wishes',
  'Personal Messages',
  'Important Contacts',
  'Assets & Accounts',
  'Special Wishes',
  'Review & Generate',
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors';
const textareaClass = inputClass + ' min-h-[100px] resize-y';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const btnPrimary = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors';
const btnDanger = 'p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors';
const btnAdd = 'inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors mt-2';

// ── PDF Generation ─────────────────────────────────────────────────────────────

async function generatePDF(data: FormData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string) => {
    checkPage(16);
    y += 6;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text(text, margin, y);
    y += 2;
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentW, y);
    y += 8;
  };

  const field = (label: string, value: string) => {
    if (!value) return;
    checkPage(12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, y);
    y += 4.5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(value, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  // Header
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Letter of Wishes', margin, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 225);
  doc.text('Prepared with LegacyShield — legacyshield.eu', margin, 27);
  doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), pageW - margin - 50, 27);
  y = 45;

  // Step 1
  heading('Personal Details');
  field('Full Name', data.fullName);
  field('Date of Birth', data.dateOfBirth);
  field('ID / Passport Number', data.idNumber);
  field('Country of Residence', data.countryOfResidence);
  field('Country of Origin', data.countryOfOrigin);

  // Step 2
  heading('Funeral & Burial Wishes');
  field('Preference', data.burialPreference === 'burial' ? 'Burial' : data.burialPreference === 'cremation' ? 'Cremation' : '');
  field('Specific Funeral Wishes', data.funeralWishes);
  field('Religious / Cultural Preferences', data.religiousPreferences);
  field('Music, Readings & Other Requests', data.musicAndReadings);

  // Step 3
  heading('Personal Messages');
  field('Message to Partner / Spouse', data.messageToPartner);
  field('Message to Children', data.messageToChildren);
  field('Message to Parents', data.messageToParents);
  field('Other Messages', data.otherMessages);

  // Step 4
  heading('Important People & Contacts');
  if (data.executor.name) field('Executor', `${data.executor.name} — ${data.executor.contact}`);
  if (data.financialAdvisor.name) field('Financial Advisor', `${data.financialAdvisor.name} — ${data.financialAdvisor.contact}`);
  if (data.attorney.name) field('Attorney / Lawyer', `${data.attorney.name} — ${data.attorney.contact}`);
  data.otherContacts.forEach((c, i) => { if (c.name) field(`Other Contact ${i + 1}`, `${c.name} — ${c.contact}`); });

  // Step 5
  heading('Assets & Accounts Overview');
  data.bankAccounts.forEach((a, i) => { if (a.institution) field(`Bank Account ${i + 1}`, `${a.institution} — ${a.accountType}`); });
  data.insurancePolicies.forEach((p, i) => { if (p.provider) field(`Insurance Policy ${i + 1}`, `${p.provider} — ${p.policyNumber}`); });
  data.pensionFunds.forEach((f, i) => { if (f.provider) field(`Pension / Retirement ${i + 1}`, `${f.provider} — ${f.details}`); });
  data.properties.forEach((p, i) => { if (p.description) field(`Property ${i + 1}`, p.description); });
  data.digitalAccounts.forEach((d, i) => { if (d.description) field(`Digital Account ${i + 1}`, d.description); });

  // Step 6
  heading('Special Wishes');
  field('Pet Care Instructions', data.petCareInstructions);
  data.sentimentalItems.forEach((s, i) => { if (s.item) field(`Sentimental Item ${i + 1}`, `"${s.item}" → ${s.person}`); });
  field('Charity Donations', data.charityDonations);
  field('Other Wishes', data.otherWishes);

  // Signature
  checkPage(40);
  y += 10;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 80, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Signature', margin, y);
  doc.line(margin + 100, y - 5, margin + contentW, y - 5);
  doc.text('Date', margin + 100, y);

  y += 12;
  checkPage(10);
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('This document was generated using LegacyShield (legacyshield.eu). No data was transmitted to any server.', margin, y);

  doc.save(`Letter-of-Wishes-${data.fullName.replace(/\s+/g, '-') || 'Document'}.pdf`);
}

// ── Step Components ────────────────────────────────────────────────────────────

function Step1({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input className={inputClass} value={data.fullName} onChange={e => update({ fullName: e.target.value })} placeholder="John Doe" />
      </div>
      <div>
        <label className={labelClass}>Date of Birth</label>
        <input className={inputClass} type="date" value={data.dateOfBirth} onChange={e => update({ dateOfBirth: e.target.value })} />
      </div>
      <div>
        <label className={labelClass}>ID / Passport Number</label>
        <input className={inputClass} value={data.idNumber} onChange={e => update({ idNumber: e.target.value })} placeholder="AB1234567" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Country of Residence</label>
          <input className={inputClass} value={data.countryOfResidence} onChange={e => update({ countryOfResidence: e.target.value })} placeholder="Netherlands" />
        </div>
        <div>
          <label className={labelClass}>Country of Origin</label>
          <input className={inputClass} value={data.countryOfOrigin} onChange={e => update({ countryOfOrigin: e.target.value })} placeholder="South Africa" />
        </div>
      </div>
    </div>
  );
}

function Step2({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Burial or Cremation Preference</label>
        <div className="flex gap-4 mt-1">
          {(['burial', 'cremation'] as const).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => update({ burialPreference: opt })}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${data.burialPreference === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass}>Specific Funeral Wishes</label>
        <textarea className={textareaClass} value={data.funeralWishes} onChange={e => update({ funeralWishes: e.target.value })} placeholder="Any specific wishes for the ceremony..." />
      </div>
      <div>
        <label className={labelClass}>Religious / Cultural Preferences</label>
        <textarea className={textareaClass} value={data.religiousPreferences} onChange={e => update({ religiousPreferences: e.target.value })} placeholder="Denomination, traditions, rituals..." />
      </div>
      <div>
        <label className={labelClass}>Music, Readings, or Other Requests</label>
        <textarea className={textareaClass} value={data.musicAndReadings} onChange={e => update({ musicAndReadings: e.target.value })} placeholder="Songs, poems, scripture passages..." />
      </div>
    </div>
  );
}

function Step3({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">These messages are optional. Write what you&apos;d like your loved ones to read.</p>
      <div>
        <label className={labelClass}>Message to Partner / Spouse</label>
        <textarea className={textareaClass} value={data.messageToPartner} onChange={e => update({ messageToPartner: e.target.value })} placeholder="My dearest..." />
      </div>
      <div>
        <label className={labelClass}>Message to Children</label>
        <textarea className={textareaClass} value={data.messageToChildren} onChange={e => update({ messageToChildren: e.target.value })} placeholder="To my children..." />
      </div>
      <div>
        <label className={labelClass}>Message to Parents</label>
        <textarea className={textareaClass} value={data.messageToParents} onChange={e => update({ messageToParents: e.target.value })} placeholder="Dear Mom and Dad..." />
      </div>
      <div>
        <label className={labelClass}>Any Other Messages</label>
        <textarea className={textareaClass} value={data.otherMessages} onChange={e => update({ otherMessages: e.target.value })} placeholder="To my friends, siblings, colleagues..." />
      </div>
    </div>
  );
}

function ContactField({ label, value, onChange }: { label: string; value: Contact; onChange: (c: Contact) => void }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} placeholder="Name" />
        <input className={inputClass} value={value.contact} onChange={e => onChange({ ...value, contact: e.target.value })} placeholder="Phone / Email" />
      </div>
    </div>
  );
}

function Step4({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <ContactField label="Executor" value={data.executor} onChange={executor => update({ executor })} />
      <ContactField label="Financial Advisor" value={data.financialAdvisor} onChange={financialAdvisor => update({ financialAdvisor })} />
      <ContactField label="Attorney / Lawyer" value={data.attorney} onChange={attorney => update({ attorney })} />
      <div>
        <label className={labelClass}>Other Important Contacts</label>
        {data.otherContacts.map((c, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className={inputClass} value={c.name} onChange={e => { const arr = [...data.otherContacts]; arr[i] = { ...c, name: e.target.value }; update({ otherContacts: arr }); }} placeholder="Name" />
            <input className={inputClass} value={c.contact} onChange={e => { const arr = [...data.otherContacts]; arr[i] = { ...c, contact: e.target.value }; update({ otherContacts: arr }); }} placeholder="Phone / Email" />
            <button type="button" className={btnDanger} onClick={() => update({ otherContacts: data.otherContacts.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button type="button" className={btnAdd} onClick={() => update({ otherContacts: [...data.otherContacts, { name: '', contact: '' }] })}><Plus className="h-4 w-4" /> Add Contact</button>
      </div>
    </div>
  );
}

function DynamicList<T extends Record<string, string>>({ label, items, fields, onUpdate, empty }: { label: string; items: T[]; fields: { key: keyof T; placeholder: string }[]; onUpdate: (items: T[]) => void; empty: T }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          {fields.map(f => (
            <input key={f.key as string} className={inputClass} value={item[f.key]} onChange={e => { const arr = [...items]; arr[i] = { ...item, [f.key]: e.target.value }; onUpdate(arr); }} placeholder={f.placeholder} />
          ))}
          <button type="button" className={btnDanger} onClick={() => onUpdate(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" className={btnAdd} onClick={() => onUpdate([...items, { ...empty }])}><Plus className="h-4 w-4" /> Add</button>
    </div>
  );
}

function Step5({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <DynamicList label="Bank Accounts" items={data.bankAccounts} fields={[{ key: 'institution', placeholder: 'Institution' }, { key: 'accountType', placeholder: 'Account type' }]} onUpdate={bankAccounts => update({ bankAccounts })} empty={{ institution: '', accountType: '' }} />
      <DynamicList label="Insurance Policies" items={data.insurancePolicies} fields={[{ key: 'provider', placeholder: 'Provider' }, { key: 'policyNumber', placeholder: 'Policy number' }]} onUpdate={insurancePolicies => update({ insurancePolicies })} empty={{ provider: '', policyNumber: '' }} />
      <DynamicList label="Retirement / Pension Funds" items={data.pensionFunds} fields={[{ key: 'provider', placeholder: 'Provider' }, { key: 'details', placeholder: 'Details' }]} onUpdate={pensionFunds => update({ pensionFunds })} empty={{ provider: '', details: '' }} />
      <DynamicList label="Property" items={data.properties} fields={[{ key: 'description', placeholder: 'Property description' }]} onUpdate={properties => update({ properties })} empty={{ description: '' }} />
      <DynamicList label="Digital Accounts" items={data.digitalAccounts} fields={[{ key: 'description', placeholder: 'Email, social media, crypto...' }]} onUpdate={digitalAccounts => update({ digitalAccounts })} empty={{ description: '' }} />
    </div>
  );
}

function Step6({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Pet Care Instructions</label>
        <textarea className={textareaClass} value={data.petCareInstructions} onChange={e => update({ petCareInstructions: e.target.value })} placeholder="Who should care for your pets, feeding instructions, vet details..." />
      </div>
      <DynamicList label="Sentimental Items Distribution" items={data.sentimentalItems} fields={[{ key: 'item', placeholder: 'Item' }, { key: 'person', placeholder: 'Goes to (person)' }]} onUpdate={sentimentalItems => update({ sentimentalItems })} empty={{ item: '', person: '' }} />
      <div>
        <label className={labelClass}>Charity Donations</label>
        <textarea className={textareaClass} value={data.charityDonations} onChange={e => update({ charityDonations: e.target.value })} placeholder="Organizations or causes you'd like to support..." />
      </div>
      <div>
        <label className={labelClass}>Any Other Wishes</label>
        <textarea className={textareaClass} value={data.otherWishes} onChange={e => update({ otherWishes: e.target.value })} placeholder="Anything else you'd like to include..." />
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">{children}</div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <p><span className="font-medium text-gray-900">{label}:</span> {value}</p>;
}

function Step7({ data }: { data: FormData }) {
  return (
    <div>
      <ReviewSection title="Personal Details">
        <ReviewField label="Full Name" value={data.fullName} />
        <ReviewField label="Date of Birth" value={data.dateOfBirth} />
        <ReviewField label="ID / Passport" value={data.idNumber} />
        <ReviewField label="Country of Residence" value={data.countryOfResidence} />
        <ReviewField label="Country of Origin" value={data.countryOfOrigin} />
      </ReviewSection>
      <ReviewSection title="Funeral & Burial Wishes">
        <ReviewField label="Preference" value={data.burialPreference} />
        <ReviewField label="Funeral Wishes" value={data.funeralWishes} />
        <ReviewField label="Religious Preferences" value={data.religiousPreferences} />
        <ReviewField label="Music & Readings" value={data.musicAndReadings} />
      </ReviewSection>
      <ReviewSection title="Personal Messages">
        <ReviewField label="To Partner" value={data.messageToPartner} />
        <ReviewField label="To Children" value={data.messageToChildren} />
        <ReviewField label="To Parents" value={data.messageToParents} />
        <ReviewField label="Other" value={data.otherMessages} />
      </ReviewSection>
      <ReviewSection title="Important Contacts">
        {data.executor.name && <ReviewField label="Executor" value={`${data.executor.name} — ${data.executor.contact}`} />}
        {data.financialAdvisor.name && <ReviewField label="Financial Advisor" value={`${data.financialAdvisor.name} — ${data.financialAdvisor.contact}`} />}
        {data.attorney.name && <ReviewField label="Attorney" value={`${data.attorney.name} — ${data.attorney.contact}`} />}
        {data.otherContacts.filter(c => c.name).map((c, i) => <ReviewField key={i} label={`Contact ${i + 1}`} value={`${c.name} — ${c.contact}`} />)}
      </ReviewSection>
      <ReviewSection title="Assets & Accounts">
        {data.bankAccounts.filter(a => a.institution).map((a, i) => <ReviewField key={i} label={`Bank ${i + 1}`} value={`${a.institution} — ${a.accountType}`} />)}
        {data.insurancePolicies.filter(p => p.provider).map((p, i) => <ReviewField key={i} label={`Insurance ${i + 1}`} value={`${p.provider} — ${p.policyNumber}`} />)}
        {data.pensionFunds.filter(f => f.provider).map((f, i) => <ReviewField key={i} label={`Pension ${i + 1}`} value={`${f.provider} — ${f.details}`} />)}
        {data.properties.filter(p => p.description).map((p, i) => <ReviewField key={i} label={`Property ${i + 1}`} value={p.description} />)}
        {data.digitalAccounts.filter(d => d.description).map((d, i) => <ReviewField key={i} label={`Digital ${i + 1}`} value={d.description} />)}
      </ReviewSection>
      <ReviewSection title="Special Wishes">
        <ReviewField label="Pet Care" value={data.petCareInstructions} />
        {data.sentimentalItems.filter(s => s.item).map((s, i) => <ReviewField key={i} label={s.item} value={`→ ${s.person}`} />)}
        <ReviewField label="Charity Donations" value={data.charityDonations} />
        <ReviewField label="Other Wishes" value={data.otherWishes} />
      </ReviewSection>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LetterOfWishesPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialFormData);
  const [generating, setGenerating] = useState(false);

  const update = useCallback((partial: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await generatePDF(data);
    } finally {
      setGenerating(false);
    }
  };

  const stepComponents = [
    <Step1 key={0} data={data} update={update} />,
    <Step2 key={1} data={data} update={update} />,
    <Step3 key={2} data={data} update={update} />,
    <Step4 key={3} data={data} update={update} />,
    <Step5 key={4} data={data} update={update} />,
    <Step6 key={5} data={data} update={update} />,
    <Step7 key={6} data={data} />,
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="h-3 w-3" /> 100% Private</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Letter of Wishes
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-xl mx-auto">
            A guided template to document your wishes for your loved ones. Free, private, and entirely in your browser.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                  i === step
                    ? 'bg-primary-600 text-white'
                    : i < step
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
                title={s}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{STEPS[step]}</h2>
          {stepComponents[step]}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className={btnSecondary}
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className={btnPrimary}
              onClick={() => setStep(s => s + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                className={btnPrimary}
                onClick={handleDownload}
                disabled={generating}
              >
                <Download className="h-4 w-4" /> {generating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          )}
        </div>

        {/* Save to Vault CTA */}
        {step === STEPS.length - 1 && (
          <div className="mt-6 rounded-2xl bg-primary-50 border border-primary-100 p-6 text-center">
            <Shield className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Want to keep this safe?</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Store your Letter of Wishes in your encrypted LegacyShield vault — with emergency access for your loved ones.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-colors"
            >
              Save to LegacyShield Vault
            </Link>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Your data never leaves your browser. Nothing is stored on our servers.
          </p>
        </div>
      </div>
    </main>
  );
}
