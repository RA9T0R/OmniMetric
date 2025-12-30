import React from 'react';
import Container from './Container';

const Footer = () => {
  return (
    <footer className="bg-BG_dark dark:bg-Dark_BG_dark border-b border-BG_light dark:border-Dark_BG_light">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-subtext dark:text-Dark_subtext">
                    © 2025 OmniMetric Inc.
                </span>
            </div>

            <div className="flex gap-6 text-sm text-subtext dark:text-Dark_subtext">
                <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-zinc-300 transition-colors">Contact</a>
            </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;