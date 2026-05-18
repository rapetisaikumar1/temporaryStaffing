'use client';

import { motion } from 'framer-motion';

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
}

export default function PageHero({ eyebrow, title, description, align = 'left' }: Props) {
  const alignCls = align === 'center' ? 'text-center mx-auto items-center' : 'text-left';
  return (
    <section className="relative pt-36 pb-24 md:pt-44 md:pb-28 bg-[#f5f4f1] overflow-hidden">
      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`flex flex-col ${alignCls} max-w-3xl`}
        >
          <p className="eyebrow-gold">{eyebrow}</p>
          <h1 className="mt-5 heading-1-classic">{title}</h1>
          {description && <p className="mt-6 text-[17px] md:text-[18px] text-[#5a6478] leading-[1.65] max-w-2xl">{description}</p>}
          {align === 'center' && <div className="mt-8 gold-rule w-32 mx-auto" />}
        </motion.div>
      </div>
    </section>
  );
}
