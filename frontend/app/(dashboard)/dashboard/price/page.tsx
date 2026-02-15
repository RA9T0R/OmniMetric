'use client';

import React, { useState } from 'react';
import PriceCard from '@/components/PriceCard';
import { PRICING_TIERS } from '@/lib/constants';
import { Loader2, CreditCard } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

const PricePage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { createCheckoutSession, isLoading } = usePayment();
    const selectedTier = PRICING_TIERS.find(t => t.id === selectedId);

    const handleCardClick = (id: string) => {
        if (isLoading) return;
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    };

    const handleCheckout = () => {
        if (selectedId) {
            createCheckoutSession(selectedId);
        }
    };

    return (
        <div className="w-full min-h-full flex flex-col relative">

            {/* Scrollable Content Container */}
            <div className="w-full gap-6 xl:max-w-9/10 mx-auto pb-12 flex-1">

                <div className="mb-8 px-2 md:px-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">Buy Token</h1>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext mt-1">All Price and package</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-4">
                    {PRICING_TIERS.map((tier) => (
                        <PriceCard
                            key={tier.id}
                            tier={tier}
                            isSelected={selectedId === tier.id}
                            onClick={() => handleCardClick(tier.id)}
                            className={`w-full transition-opacity ${isLoading && selectedId !== tier.id ? 'opacity-50 pointer-events-none' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="sticky bottom-0 left-0 right-0 p-4 md:p-6 backdrop-blur-md z-40 flex justify-center">
                 <button
                    onClick={handleCheckout}
                    disabled={!selectedId || isLoading}
                    className={`
                        cursor-pointer w-full xl:max-w-9/10 h-16 md:h-20 rounded-xl font-bold text-2xl md:text-4xl transition-all shadow-2xl flex items-center justify-center border-2 gap-3
                        ${selectedId 
                            ? 'bg-power dark:bg-Dark_power border-power hover:scale-[1.01] text-black opacity-100 shadow-power/20' 
                            : 'bg-BG_light dark:bg-Dark_BG_light border-transparent text-subtext dark:text-Dark_subtext cursor-not-allowed opacity-80'
                        }
                    `}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin w-8 h-8 md:w-10 md:h-10" />
                            <span>Processing...</span>
                        </>
                    ) : selectedId ? (
                        <>
                            <CreditCard className="w-6 h-6 md:w-9 md:h-9" />
                            <span>Pay ฿{selectedTier?.price}</span>
                        </>
                    ) : (
                        "Choose Package"
                    )}
                </button>
            </div>

        </div>
    );
}

export default PricePage;