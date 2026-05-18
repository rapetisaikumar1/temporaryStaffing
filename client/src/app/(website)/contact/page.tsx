'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import PageHero from '@/components/website/PageHero';
import InquiryForm from '@/components/website/InquiryForm';
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/constants';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let&apos;s staff your event.</>}
        description="Submit your staffing requirement and our team will respond with a tailored plan within 24 hours."
      />

      {/* Contact info row */}
      <section className="bg-[#f5f4f1] border-b border-black/[0.07]">
        <div className="container-page py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Phone, label: 'Call us',       value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}` },
            { icon: Mail,  label: 'Email us',      value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
            { icon: Clock, label: 'Response time', value: 'Within 24 hours' },
            { icon: MapPin, label: 'Head office',  value: 'Mumbai, India' },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="icon-tile-classic h-10 w-10 shrink-0"><Icon className="w-[17px] h-[17px]" /></div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#8491a3] font-semibold">{label}</p>
                {href ? (
                  <a href={href} className="text-[14px] font-medium text-[#0d1b2a] hover:text-[#b86b0a] transition-colors">{value}</a>
                ) : (
                  <p className="text-[14px] font-medium text-[#0d1b2a]">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="section bg-white">
        <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div {...fadeIn} className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="eyebrow-gold">Get a free proposal</p>
            <h2 className="mt-4 heading-2-classic">Tell us about your event.</h2>
            <div className="mt-6 gold-rule w-20" />
            <p className="mt-7 text-[16px] text-forest-900/65 leading-[1.65] max-w-md">
              We&apos;ll review your requirements and send a detailed proposal — completely free, no obligation.
            </p>
            <ul className="mt-8 space-y-3.5">
              {[
                'Response within 24 hours',
                'Dedicated account coordinator',
                'Transparent, itemised pricing',
                'Background-verified staff',
                'Scale up or down anytime',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14px] text-[#5a6478]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b86b0a]/70 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }} className="lg:col-span-7">
            <InquiryForm />
          </motion.div>
        </div>
      </section>
    </>
  );
}
