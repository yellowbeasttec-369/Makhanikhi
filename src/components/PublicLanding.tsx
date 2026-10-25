import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Facebook, FileText, Gauge, Mail, ShieldCheck, Wrench, CarFront, Building2, Users, ClipboardCheck } from 'lucide-react';

const FACEBOOK_URL = 'https://www.facebook.com/makhanikhiapp';
const GOOGLE_BUSINESS_URL = 'https://www.google.com/search?q=Makhanikhi+-+Specialist+Mobile+Mechanic';
const CONTACT_EMAIL = 'makhanikhiwadikoloi@gmail.com';

const audiences = [
  { title: 'Vehicle owners', description: 'Find the right kind of automotive help, understand proposed work and build a clearer record of maintenance.', icon: CarFront },
  { title: 'Mechanics & specialists', description: 'Show your skills, tell us what work you want, and help shape a platform that respects your time and expertise.', icon: Wrench },
  { title: 'Industry partners', description: 'Explore collaboration around workshops, specialist services and better vehicle maintenance records.', icon: Building2 },
];

const interestOptions = [
  'Find a trustworthy mechanic or specialist',
  'Get more customers and bookings',
  'Clearer quotes, approvals and payment arrangements',
  'Keep a digital vehicle maintenance history',
  'Voice-assisted diagnostics and spares discovery',
  'Workshop, fleet or industry collaboration',
  'Training, apprenticeship or skills evidence',
];

export const PublicLanding: React.FC = () => {
  // Formspree form IDs are public submission endpoints, not private credentials.
  // The Vercel environment variable can override this default if the form changes.
  const endpoint = (import.meta as ImportMeta & { env: { VITE_FORMSPREE_ENDPOINT?: string } }).env.VITE_FORMSPREE_ENDPOINT?.trim() || 'https://formspree.io/f/xnppjeoo';
  const [participantType, setParticipantType] = useState('Vehicle owner');
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!endpoint) {
      setError('The interest form is being connected. Please email us directly for now, or try again soon.');
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('participantType', participantType);
    data.set('interests', interests.join('; '));
    data.set('source', 'Makhanikhi public landing page');
    data.set('_subject', 'New Makhanikhi expression of interest');
    setSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Submission was not accepted. Please try again or email us.');
      setSubmitted(true);
      form.reset();
      setInterests([]);
      setParticipantType('Vehicle owner');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your interest. Please email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-industrial-charcoal text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop" alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-industrial-charcoal/50 via-industrial-charcoal/80 to-industrial-charcoal" />
          <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-technic-yellow/10 blur-[110px]" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="mb-7 flex items-center gap-4">
              <img src="/Makhanikhi_logo_launch.png" alt="Makhanikhi logo" className="h-20 w-auto object-contain sm:h-24" />
              <div>
                <p className="text-sm font-black uppercase tracking-[.22em] text-technic-yellow">Makhanikhi</p>
                <p className="mt-1 text-xs text-white/70">Specialist mobile mechanics</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-technic-yellow/30 bg-technic-yellow/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-technic-yellow">
              <Wrench className="h-4 w-4" /> Built around real automotive needs
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black uppercase leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Better connections.<br /><span className="text-technic-yellow">Clearer repairs.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Makhanikhi is being developed to connect vehicle owners with independent mechanics and specialist technicians, make repair conversations clearer, and help build useful records of vehicle maintenance.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#interest" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-technic-yellow px-6 py-3 font-black text-industrial-charcoal transition hover:brightness-110">
                Tell us what you need <ArrowRight className="h-5 w-5" />
              </a>
              <Link to="/demo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white transition hover:border-technic-yellow/60 hover:bg-white/10">
                Explore the demo <Gauge className="h-5 w-5 text-technic-yellow" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/50">Early-stage product · Help us shape what gets built next</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/45 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
            <p className="text-xs font-black uppercase tracking-[.2em] text-technic-yellow">Who is Makhanikhi for?</p>
            <div className="mt-5 space-y-5">
              {audiences.map(({ title, description, icon: Icon }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-technic-yellow/10 text-technic-yellow"><Icon className="h-5 w-5" /></div>
                  <div><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-white/65">{description}</p></div>
                </div>
              ))}
            </div>
            <a href="#interest" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-technic-yellow hover:underline">Express your interest <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <ClipboardCheck className="h-7 w-7 text-technic-yellow" />
            <h2 className="mt-4 text-xl font-black">Clearer job conversations</h2>
            <p className="mt-2 text-sm leading-7 text-white/65">Explore a workflow for discussing the problem, agreeing on a quote and recording what was approved before work proceeds.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <ShieldCheck className="h-7 w-7 text-technic-yellow" />
            <h2 className="mt-4 text-xl font-black">Useful repair records</h2>
            <p className="mt-2 text-sm leading-7 text-white/65">Help us learn what evidence owners and specialists need to make vehicle maintenance histories more useful and trustworthy.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <Users className="h-7 w-7 text-technic-yellow" />
            <h2 className="mt-4 text-xl font-black">Designed with participants</h2>
            <p className="mt-2 text-sm leading-7 text-white/65">Tell us what would make the platform useful, fair and practical for the people who maintain vehicles every day.</p>
          </article>
        </div>
      </section>

      <section id="interest" className="scroll-mt-24 border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-technic-yellow">Help shape the pilot</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">What would you like Makhanikhi to do for you?</h2>
            <p className="mt-4 leading-7 text-white/65">This short form helps us understand who wants to participate and which problems matter most. Submitting it is not a booking or a commitment to pay.</p>
            <div className="mt-7 space-y-3 text-sm text-white/70">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-technic-yellow" /> No account required</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-technic-yellow" /> Choose the needs that matter to you</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-technic-yellow" /> Help guide future features and pilot locations</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:border-technic-yellow/50"><Facebook className="h-4 w-4 text-[#1877F2]" /> Follow on Facebook</a>
              <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:border-technic-yellow/50"><Building2 className="h-4 w-4 text-technic-yellow" /> Google Business Profile</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:border-technic-yellow/50"><Mail className="h-4 w-4 text-technic-yellow" /> Email us</a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-industrial-charcoal p-5 sm:p-8">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-technic-yellow/10"><CheckCircle2 className="h-7 w-7 text-technic-yellow" /></div>
                <h3 className="mt-5 text-2xl font-black">Thank you for your interest.</h3>
                <p className="mt-3 text-white/65">Your response has been submitted. We appreciate you helping shape Makhanikhi.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-bold text-technic-yellow hover:underline">Submit another response</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label>Leave this field empty<input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-white/85">Your name<input required name="name" autoComplete="name" maxLength={120} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-technic-yellow" placeholder="Name" /></label>
                  <label className="block text-sm font-semibold text-white/85">Email address<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-technic-yellow" placeholder="you@example.com" /></label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-white/85">I am a...<select value={participantType} onChange={(e) => setParticipantType(e.target.value)} name="participantType" className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#191919] px-4 text-white outline-none focus:border-technic-yellow"><option>Vehicle owner</option><option>Mechanic or specialist technician</option><option>Workshop or parts supplier</option><option>Fleet operator or used-car dealer</option><option>Automotive industry organisation</option><option>Student, apprentice or trainee</option><option>Other</option></select></label>
                  <label className="block text-sm font-semibold text-white/85">Town / province<input name="location" autoComplete="address-level2" maxLength={120} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-technic-yellow" placeholder="e.g. Polokwane, Limpopo" /></label>
                </div>
                <fieldset>
                  <legend className="text-sm font-semibold text-white/85">What would you like help with? Choose all that apply.</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {interestOptions.map((option) => (
                      <label key={option} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3 text-sm leading-5 text-white/75 hover:border-technic-yellow/40">
                        <input type="checkbox" checked={interests.includes(option)} onChange={(e) => setInterests((current) => e.target.checked ? [...current, option] : current.filter((item) => item !== option))} className="mt-1 accent-yellow-400" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="block text-sm font-semibold text-white/85">Anything else you want us to know? <span className="font-normal text-white/45">(optional)</span><textarea name="message" rows={3} maxLength={1500} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-technic-yellow" placeholder="Tell us about the service, feature or problem that matters to you." /></label>
                <label className="flex items-start gap-3 text-sm leading-6 text-white/65"><input required type="checkbox" name="contactConsent" value="yes" className="mt-1 accent-yellow-400" /><span>I agree that Makhanikhi may use these details to respond to my enquiry and contact me about relevant pilot opportunities. I can ask to stop being contacted.</span></label>
                {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
                {!endpoint && <p className="rounded-xl border border-technic-yellow/20 bg-technic-yellow/5 p-3 text-sm text-white/65">Online submissions are being configured. For now, email <a className="font-bold text-technic-yellow underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to express interest.</p>}
                <button disabled={submitting || !endpoint} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-technic-yellow px-6 py-3 font-black text-industrial-charcoal transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit expression of interest'} <ArrowRight className="h-5 w-5" /></button>
                <p className="text-xs leading-5 text-white/40">Please do not submit identity documents, payment details, wallet keys or confidential vehicle records through this form.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-technic-yellow/20 bg-technic-yellow/[.05] p-6 sm:flex-row sm:items-center sm:p-8">
          <div><h2 className="text-2xl font-black">Want to see the concept first?</h2><p className="mt-2 text-sm text-white/65">Explore a guided sample journey before deciding whether to participate.</p></div>
          <Link to="/demo" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-technic-yellow px-6 py-3 font-black text-industrial-charcoal"><Gauge className="h-5 w-5" /> Explore the demo</Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/45">
        <p>Makhanikhi · Specialist mobile mechanics</p>
        <p className="mt-2">In development. Features, availability, verification and payment arrangements may change as the product is tested.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-5"><a className="hover:text-technic-yellow" href={FACEBOOK_URL} target="_blank" rel="noreferrer">Facebook</a><a className="hover:text-technic-yellow" href={GOOGLE_BUSINESS_URL} target="_blank" rel="noreferrer">Google Business Profile</a><a className="hover:text-technic-yellow" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><Link className="hover:text-technic-yellow" to="/login">Existing user sign-in</Link></div>
      </footer>
    </main>
  );
};
