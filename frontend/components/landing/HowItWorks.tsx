import React from 'react';
import { Upload, Terminal, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Container from './Container';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-BG_dark dark:bg-Dark_BG_dark ">
      <Container className="pt-20 pb-14 md:pt-32 md:pb-20">
        <h2 className="text-5xl xl:text-6xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-20 text-Text dark:text-Dark_Text">
          How It Works
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto relative">

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-6 z-10">
            <div className="size-32 rounded-2xl border-2 border-dashed border-zinc-700 flex items-center justify-center bg-BG_light dark:bg-Dark_BG_light">
                <Upload className="size-16 text-Text dark:text-Dark_Text" />
            </div>
            <div>
                <h3 className="sm:text-xl xl:text-3xl font-bold text-Text dark:text-Dark_Text mb-2">Upload</h3>
                <p className="text-sm text-subtext dark:text-Dark_subtext max-w-[150px]">Upload your image formats (JPG, PNG)</p>
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="hidden md:block size-16 text-Text dark:text-Dark_Text" />
          <ArrowRight className="hidden md:block size-16 text-Text dark:text-Dark_Text" />

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-6 z-10">
            <div className="size-32 rounded-2xl border border-zinc-700 flex items-center justify-center bg-BG_light dark:bg-Dark_BG_light">
                <Terminal className="size-16 text-Text dark:text-Dark_Text" />
            </div>
            <div>
                <h3 className="sm:text-xl xl:text-3xl  font-bold text-Text dark:text-Dark_Text mb-2">Process</h3>
                <p className="text-sm text-subtext dark:text-Dark_subtext max-w-[150px]">Our AI calculates depth vectors instantly</p>
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="hidden md:block size-16 text-Text dark:text-Dark_Text" />
          <ArrowRight className="hidden md:block size-16 text-Text dark:text-Dark_Text" />

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-6 z-10">
            <div className="size-32 rounded-2xl overflow-hidden border border-yellow-400 relative shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                <Image
                    src="/images/hero_placeholder.jpg"
                    alt="Analyze"
                    fill
                    className="object-cover"
                />
            </div>
            <div>
                <h3 className="sm:text-xl xl:text-3xl  font-bold text-Text dark:text-Dark_Text mb-2">Analyze</h3>
                <p className="text-sm text-subtext dark:text-Dark_subtext max-w-[150px]">Download depth map or 3D point cloud</p>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;