import React from 'react';
import { Bot, Cloud, Coins } from 'lucide-react';
import Container from './Container';

const features = [
  {
    icon: <Bot />,
    title: "Unmatched Accuracy",
    description: "Our advanced AI models detect the finest details, delivering architectural-grade depth maps you can trust."
  },
  {
    icon: <Cloud />,
    title: "Seamless Workflow",
    description: "Keep all your projects and generated assets in one secure dashboard. Easy upload, easy access."
  },
  {
    icon: <Coins />,
    title: "Token-Based System",
    description: "Pay only for what you use. No hidden subscriptions. Get 100 free tokens on sign-up to test our power."
  }
];

const KeyFeatures = () => {
  return (
    <section id="features" className="bg-BG_dark dark:bg-Dark_BG_dark border-b border-BG_light dark:border-Dark_BG_light">
      <Container className="py-24">
        <h2 className="text-5xl xl:text-6xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-16 text-Text dark:text-Dark_Text">
          Key Features
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-5 items-center group">

              {/* Icon Box */}
              <div className="shrink-0 size-24 flex items-center justify-center rounded-2xl border-4 border-white/20 bg-transparent transition-colors">
                 {React.cloneElement(feature.icon as React.ReactElement<any>, {
                    className: "size-16 text-Text dark:text-Dark_Text transition-colors",
                    strokeWidth: 1.5
                 })}
              </div>

              {/* Text Content */}
              <div className="flex flex-col pt-1">
                <h3 className="text-xl mb-2 text-Text dark:text-Dark_Text leading-none">
                    {feature.title}
                </h3>
                <p className="text-sm text-subtext dark:text-Dark_subtext leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default KeyFeatures;