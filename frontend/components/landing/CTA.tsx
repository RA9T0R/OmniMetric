'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Container from './Container';
import { useAuth } from '@/components/landing/AuthContext';


const CTA = () => {
  const { openSignup } = useAuth();

  return (
    <section className="bg-BG_dark dark:bg-Dark_BG_dark border-b border-BG_light dark:border-Dark_BG_light">
      <Container className="pb-24">
        <div className="max-w-6xl mx-auto space-y-8 text-center border rounded-2xl py-10 border-BG_light dark:border-Dark_BG_light">
          <div className="flex items-center justify-center gap-2 text-power dark:text-Dark_power">
            <Sparkles className="size-14 xl:size-20" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-Text dark:text-Dark_Text">
            Ready to integrate depth?
          </h2>
          <p className="text-subtext dark:text-Dark_subtext md:text-xl">
            Get 100 free processing tokens when you create a developer account.
          </p>
          <div className="pt-4">
            <button
                onClick={openSignup}
                className="cursor-pointer bg-power dark:bg-Dark_power hover:scale-105 text-black font-bold py-4 px-10 rounded-lg transition-all transform shadow-lg shadow-yellow-400/20">
              Create Free Account Now
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;