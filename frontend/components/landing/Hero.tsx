'use client';

import React from 'react';
import Image from 'next/image';
import Container from './Container';
import { useAuth } from '@/components/landing/AuthContext';

const Hero = () => {
  // Get the function from the bridge
  const { openSignup } = useAuth();

  return (
    <section className="overflow-hidden bg-BG_dark dark:bg-Dark_BG_dark border-b border-BG_light dark:border-Dark_BG_light">
      <Container className="pt-20 pb-14 md:pt-32 md:pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* ... Left Side Content ... */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-8 xl:space-y-16">
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-7xl font-extrabold tracking-tighter text-Text dark:text-Dark_Text">
                Depth perception <br />
                for digital minds.
              </h1>
              <p className="max-w-[600px] text-xs sm:text-sm xl:text-xl text-subtext dark:text-Dark_subtext md:text-xl">
                Instantly generate high-precision depth maps from 2D images.
                Perfect for architects, autonomous cars, and designers.
                Accurate, and token-based.
              </p>
            </div>

            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <button
                onClick={openSignup}
                className="cursor-pointer bg-power dark:bg-Dark_power hover:scale-105 text-black font-bold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                Start for Free & Get 100 Tokens
              </button>

            </div>
            <p className="text-xs text-subtext dark:text-Dark_subtext">
              created by phongphat bangkha
            </p>
          </div>

          {/* ... Right Side Image ... */}
          <div className="mx-auto lg:mr-0 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 w-full max-w-[650px]">
             <div className="aspect-4/3 relative bg-zinc-800">
                <Image
                  src="/images/hero_placeholder.jpg"
                  alt="Depth Map Comparison"
                  fill
                  className="object-cover"
                />
             </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Hero;