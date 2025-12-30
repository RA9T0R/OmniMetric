import React from 'react';
import Hero from '@/components/landing/Hero';
import KeyFeatures from '@/components/landing/KeyFeatures';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

const Landing = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Main Sections */}
            <main className="flex-1">
                <Hero />
                <KeyFeatures />
                <HowItWorks />
                <CTA />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default Landing;