import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Users, Database, AlertTriangle } from 'lucide-react';

type PolicySection = { title: string; body: React.ReactNode };

const policyContent: Record<string, { title: string; intro: string; updated: string; sections: PolicySection[] }> = {
  privacy: {
    title: 'Privacy Notice',
    intro: 'This notice explains how Makhanikhi proposes to handle personal information when people explore the platform, contact us, register, or use available features.',
    updated: 'Draft version 0.2 · 30 October 2026',
    sections: [
      { title: '1. Responsible entity and contact details', body: <>Makhanikhi is being developed and operated by <strong>Yellow Beast (Pty) Ltd</strong>, which is the responsible entity for the platform at this stage. The designated contact person is <strong>Pontsho Moletsane</strong>. For app support, privacy requests and questions about personal information, email <a className="text-technic-yellow underline" href="mailto:yellowbeasttech@gmail.com">yellowbeasttech@gmail.com</a> or call <a className="text-technic-yellow underline" href="tel:+27826247571">+27 82 624 7571</a>. The business contact address for correspondence is <strong>mLab Limpopo, Biccard Street, Polokwane, 0699, South Africa</strong>. This is a business contact address and is not represented here as the company’s registered office. For client-facing Makhanikhi communications, use <a className="text-technic-yellow underline" href="mailto:yellowbeasttech@gmail.com">yellowbeasttech@gmail.com</a>. Do not send sensitive identity or vehicle documents by ordinary email unless we have explained a safe, necessary process.</> },
      { title: '2. What information may be processed?', body: <>Depending on the feature used, this may include account and contact details; profile and role information; information users enter about vehicles and service needs; messages, enquiries and feedback; service, booking or work records; and technical information needed to operate and protect the service. Do not submit identity documents, payment-card details, passwords, wallet recovery phrases or unrelated sensitive information unless a feature explicitly requires it and a safe process has been provided.</> },
      { title: '3. Why would information be used?', body: <>Potential purposes include creating and securing accounts, responding to enquiries, connecting vehicle owners and service providers, supporting service records, handling support or disputes, preventing misuse, improving the product, and meeting applicable legal obligations. Information should only be used for a lawful, specific and explained purpose.</> },
      { title: '4. Who may receive information?', body: <>Information may be shared with another user when needed for a requested interaction and where an appropriate basis and safeguards exist, or with service providers supporting hosting, authentication, database, form processing, communications or security. The current code references Firebase services and a Formspree enquiry form; the deployed configuration and actual data flows must be verified before this notice is finalised. Makhanikhi should not sell personal information. Any additional sharing should be explained before it occurs.</> },
      { title: '5. Public profiles, locations and records', body: <>Do not assume profile, vehicle or service information is public unless the interface clearly says so. Home addresses, live location, vehicle registration numbers, invoices, photographs and service histories can expose people to risk. Public visibility and sharing should be limited to what is necessary, explained clearly and controlled where practical. Never publish another person’s details or photographs without an appropriate basis and permission.</> },
      { title: '6. Security and access', body: <>Reasonable technical and organisational safeguards should protect information against loss, unauthorised access, alteration or disclosure. Access should be limited by role and need. Security depends on the deployed application, database rules, server-side authorisation, vendor configuration and operational practices; this notice is not a guarantee that any system is risk-free. Security controls must be tested before sensitive records are collected at scale.</> },
      { title: '7. Retention and deletion', body: <>Information should be retained only for as long as reasonably needed for its stated purpose, account operation, dispute handling, security or legal obligations. A final retention schedule and verified deletion process have not yet been confirmed for this draft. You may request access, correction or deletion by contacting us; we may need to verify your identity and explain any lawful reason information cannot be deleted immediately.</> },
      { title: '8. Your choices and rights', body: <>Subject to applicable law, you may request access to personal information, correction of inaccurate information, deletion where appropriate, an explanation of processing, or withdrawal of consent where consent is the basis. You can also object to certain processing and complain to the relevant supervisory authority. Contact us using the email above and describe the request without sending unnecessary sensitive documents.</> },
      { title: '9. Cookies, analytics and third-party services', body: <>The use of cookies, analytics, embedded media and other third-party technologies must be checked against the live deployment. Third-party services may process information under their own terms and privacy notices. Links to other sites are not controlled by Makhanikhi.</> },
      { title: '10. Children and changes', body: <>The service is not designed to invite children to provide personal information without appropriate safeguards. If apprentices or other users under 18 may participate, age-related requirements and lawful authority must be assessed before enabling those flows. This notice may be updated as the product changes; material changes should be communicated in an appropriate way.</> },
      { title: '11. Complaints and regulator', body: <>You can first contact Makhanikhi using the contact details above. You may also approach the South African Information Regulator where applicable. The operator must confirm and publish the appropriate Information Officer and regulator contact details before final release.</> },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro: 'These draft terms describe the intended rules for using Makhanikhi while it is being developed and tested. They must be reviewed against the actual service and operating entity before being treated as final.',
    updated: 'Draft version 0.2 · 30 October 2026',
    sections: [
      { title: '1. About the service', body: <>Makhanikhi is being developed to help vehicle owners discover automotive service providers and to explore clearer service conversations and records. Features may be incomplete, changed, paused or unavailable. A demonstration screen is not proof that a service, booking, payment, verification or integration is operational.</> },
      { title: '2. Who may use it', body: <>You must provide information that is accurate to the best of your knowledge, keep your sign-in credentials secure, and use the service lawfully. Do not impersonate another person, create misleading profiles, bypass access controls or use another person’s information without authority. Additional safeguards may apply to minors.</> },
      { title: '3. Marketplace role and service contracts', body: <>Unless a specific written arrangement clearly says otherwise, users should not assume Makhanikhi is the mechanic, workshop, vehicle inspector, insurer, payment provider or guarantor of work. The platform’s role in introducing parties, arranging bookings, handling payments, warranties, refunds or disputes must be stated clearly for each feature before that feature is used. Users should agree the scope, price, parts, timing, payment terms and warranty directly with the responsible service provider where applicable.</> },
      { title: '4. Skills evidence, qualifications and recognition pathways', body: <>A profile, review, photograph, work log, customer acknowledgement or platform badge is not a formal trade qualification, licence, accreditation, identity check or guarantee of competence unless a specific verification process is described and evidence supports that claim. Makhanikhi may help users organise evidence of practical work and find information about Recognition of Prior Learning (RPL), Artisan Recognition of Prior Learning (ARPL), trade testing or other relevant assessment pathways. Makhanikhi does not itself award a trade certificate, conduct an official assessment, guarantee eligibility or promise recognition by an assessment centre, SETA, QCTO or other authority. Any pathway must be confirmed with the relevant authorised body. Users must not misrepresent credentials or claim official endorsement without authorisation.</> },
      { title: '5. Quotes, repairs and safety', body: <>Users should communicate clearly about diagnosis, scope, parts, labour, safety risks, permissions and changes to agreed work. Vehicle owners should not authorise work they do not understand. For safety-critical components, including suspension and shock absorbers, users should seek assessment by a suitably competent service provider and follow manufacturer guidance. A cheaper repair or refurbishment should not be assumed safe or suitable without a qualified assessment of the component and vehicle. Service providers remain responsible for work they perform and for applicable legal obligations. Makhanikhi is not an emergency or roadside recovery service and must not be used to encourage unsafe, unlawful or deceptive repair practices.</> },
      { title: '6. User content and records', body: <>You retain rights you have in content you submit. You give the platform only the limited permission reasonably needed to host, display and process that content to provide the feature you choose, subject to the Privacy Notice and any specific sharing choice. Do not upload content that is unlawful, defamatory, confidential without permission, infringing, or that exposes another person’s private information.</> },
      { title: '7. Reviews, reports and disputes', body: <>Feedback should be honest, relevant and based on genuine experience. Threats, harassment, discriminatory abuse, fabricated reviews, doxxing, fraud and retaliation are not permitted. Makhanikhi may review reports and restrict content or accounts where reasonably necessary, while aiming to provide a fair opportunity to respond when appropriate. The platform is not a substitute for emergency services, a court, a regulator or professional legal advice.</> },
      { title: '8. Availability, limits and liability', body: <>The service is provided in development and may contain errors or interruptions. To the extent permitted by law, Makhanikhi does not promise uninterrupted availability or guarantee a particular outcome from a user-to-user interaction. Nothing in these terms excludes rights or remedies that cannot lawfully be excluded, including applicable consumer protections. Any final liability wording must be reviewed by a South African legal professional.</> },
      { title: '9. Suspension and termination', body: <>Access may be limited or suspended to protect users, investigate suspected abuse, comply with law or maintain security. Users may stop using the service and may request account or data deletion, subject to verification, technical limits and lawful retention requirements.</> },
      { title: '10. Law, changes and contact', body: <>South African law is intended to be the starting point for these terms, subject to mandatory laws that apply to a user or transaction. The platform is developed and operated at this stage by <strong>Yellow Beast (Pty) Ltd</strong>. Contact person: <strong>Pontsho Moletsane</strong>. For app support, terms questions and privacy matters, email <a className="text-technic-yellow underline" href="mailto:yellowbeasttech@gmail.com">yellowbeasttech@gmail.com</a> or call <a className="text-technic-yellow underline" href="tel:+27826247571">+27 82 624 7571</a>. Business contact address: <strong>mLab Limpopo, Biccard Street, Polokwane, 0699, South Africa</strong>. Client-facing Makhanikhi communications use <a className="text-technic-yellow underline" href="mailto:makhanikhiwadikoloi@gmail.com">makhanikhiwadikoloi@gmail.com</a>. This address is provided for business correspondence and is not represented as the company’s registered office. The dispute process and effective date must be confirmed before these terms are finalised.</> },
    ],
  },
  community: {
    title: 'Community, Safety & Disputes',
    intro: 'Makhanikhi aims to support respectful, safer interactions between vehicle owners, mechanics, apprentices and automotive partners.',
    updated: 'Draft version 0.2 · 30 October 2026',
    sections: [
      { title: 'Treat people respectfully', body: <>No threats, harassment, hate, discrimination, intimidation, stalking or retaliation. Do not publish someone’s private address, phone number, documents or location to shame or threaten them.</> },
      { title: 'Be truthful about services and skills', body: <>Describe experience, qualifications, availability, prices and work accurately. Do not fabricate reviews, training records, customer acknowledgements, certificates, business registrations or platform verification.</> },
      { title: 'Protect vehicles, property and personal safety', body: <>Confirm the identity and role of the person you are dealing with, agree the scope and price before work begins, keep records of approvals, and avoid sharing unnecessary personal details. Meet in a safe location and do not use the platform to arrange illegal or dangerous activity.</> },
      { title: 'Raise a concern', body: <>For non-emergency concerns, email <a className="text-technic-yellow underline" href="mailto:yellowbeasttech@gmail.com">yellowbeasttech@gmail.com</a> with a concise description, relevant dates and any evidence you are entitled to share. Avoid sending full identity documents or unrelated sensitive information. Do not use this channel for emergencies; contact local emergency services where immediate danger exists.</> },
      { title: 'How reports may be handled', body: <>Reports may be reviewed, clarification may be requested, and content or access may be restricted while a concern is assessed. A formal response time, appeals process, evidence-retention period and escalation route still need to be defined before this policy is final.</> },
    ],
  },
  data: {
    title: 'Data Requests & Account Support',
    intro: 'Use this page to understand how to ask about information connected with your account or enquiry.',
    updated: 'Draft version 0.2 · 30 October 2026',
    sections: [
      { title: 'Request access or a copy', body: <>Email <a className="text-technic-yellow underline" href="mailto:yellowbeasttech@gmail.com">yellowbeasttech@gmail.com</a> with the subject “Personal information request”. Explain which account or information you mean. We may ask for proportionate information to verify your identity before disclosing records.</> },
      { title: 'Correct information', body: <>Tell us what appears inaccurate and what the correction should be. Where the information belongs to another user or is disputed, we may need to investigate rather than silently overwrite the record.</> },
      { title: 'Request deletion or close an account', body: <>Email the same address with the subject “Account deletion request”. We will need to verify the request and assess which records can be deleted, which may need to be retained for legal or legitimate operational reasons, and what technical steps are available. This draft does not promise instant or complete deletion from all backups or third-party systems.</> },
      { title: 'Withdraw optional consent or stop contact', body: <>You may ask us to stop optional marketing or pilot follow-up messages. This does not necessarily affect processing needed to provide a service you have requested or to comply with law.</> },
      { title: 'Response and escalation', body: <>A formal response target and escalation procedure still need to be confirmed. If your request concerns a privacy complaint, you may contact the South African Information Regulator where applicable.</> },
    ],
  },
};

export const LegalPages: React.FC = () => {
  const location = useLocation();
  const key = location.pathname === '/terms' ? 'terms' : location.pathname === '/community' ? 'community' : location.pathname === '/data-rights' ? 'data' : 'privacy';
  const page = policyContent[key];

  return (
    <main className="min-h-screen bg-industrial-charcoal px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/65 hover:text-technic-yellow"><ArrowLeft className="h-4 w-4" /> Back to Makhanikhi</Link>
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-2xl border border-technic-yellow/25 bg-technic-yellow/10 p-3 text-technic-yellow">
            {key === 'privacy' ? <ShieldCheck className="h-7 w-7" /> : key === 'terms' ? <FileText className="h-7 w-7" /> : key === 'community' ? <Users className="h-7 w-7" /> : <Database className="h-7 w-7" />}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-technic-yellow">Makhanikhi · Trust centre</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{page.title}</h1>
            <p className="mt-2 text-xs text-white/45">{page.updated}</p>
          </div>
        </div>

        <div role="note" className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>Draft for review — not yet a final legal policy.</strong><p className="mt-1">Before public adoption, confirm the legal operator, deployed data flows, retention periods, privacy contact, vendor arrangements and technical controls. These pages do not certify legal compliance or replace review by a South African legal professional.</p></div></div>
        </div>

        <p className="mb-6 text-base leading-7 text-white/75">{page.intro}</p>
        <div className="space-y-3">
          {page.sections.map((section, index) => (
            <details key={section.title} open={index === 0} className="group rounded-2xl border border-white/10 bg-white/[.025] open:border-technic-yellow/30">
              <summary className="cursor-pointer list-none px-5 py-4 font-bold text-white marker:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-technic-yellow">
                <span className="flex items-center justify-between gap-4">{section.title}<span className="text-xl text-technic-yellow transition-transform group-open:rotate-45">+</span></span>
              </summary>
              <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-white/70">{section.body}</div>
            </details>
          ))}
        </div>

        <nav aria-label="Other policies" className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
          <Link className="rounded-lg border border-white/15 px-3 py-2 hover:border-technic-yellow/50 hover:text-technic-yellow" to="/privacy">Privacy Notice</Link>
          <Link className="rounded-lg border border-white/15 px-3 py-2 hover:border-technic-yellow/50 hover:text-technic-yellow" to="/terms">Terms of Use</Link>
          <Link className="rounded-lg border border-white/15 px-3 py-2 hover:border-technic-yellow/50 hover:text-technic-yellow" to="/community">Community & Safety</Link>
          <Link className="rounded-lg border border-white/15 px-3 py-2 hover:border-technic-yellow/50 hover:text-technic-yellow" to="/data-rights">Data requests</Link>
        </nav>
        <p className="mt-6 text-xs leading-5 text-white/40">Contact: <a className="underline hover:text-technic-yellow" href="mailto:yellowbeasttech@gmail.com">yellowbeasttech@gmail.com</a>. Please do not email passwords, wallet recovery phrases or unnecessary identity documents.</p>
      </div>
    </main>
  );
};
