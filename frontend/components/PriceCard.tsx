'use client';

import React from 'react';
import { Coins, Baby, Handshake, ChessKing, Flame,Star } from 'lucide-react';
import { PricingTier } from '@/lib/constants'; // Import type from constants

interface PriceCardProps {
    tier: PricingTier;
    isSelected: boolean;
    onClick: () => void;
    className?: string; // Allow custom sizing from parent
}

const PriceCard = ({ tier, isSelected, onClick, className = "" }: PriceCardProps) => {

    const getIcon = () => {
        switch (tier.icon) {
            case 'coins': return <Coins size={20} />;
            case 'baby': return <Baby size={20} />;
            case 'handshake': return <Handshake size={20} />;
            case 'chessKing': return <ChessKing size={20} />;
            case 'flame': return <Flame size={20} />;
            case 'star': return <Star size={20} />;
            default: return <Coins size={20} />;
        }
    };

    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col justify-between p-4 rounded-2xl border hover:scale-105 transition-all duration-200 text-left group cursor-pointer
                ${isSelected 
                    ? 'bg-Main_BG dark:bg-Dark_Main_BG border-power dark:border-Dark_power' 
                    : 'bg-Main_BG dark:bg-Dark_Main_BG border-BG_light dark:border-Dark_BG_light'
                }
                ${className}
            `}
        >
            {/* Top Row: Icon/Name + Price Tag */}
            <div className="flex items-start justify-between w-full">

                {/* Name & Icon */}
                <div className="flex items-center gap-2 text-subtext dark:text-Dark_subtext">
                    <div className={`${isSelected ? 'text-power' : 'text-zinc-400'}`}>
                        {getIcon()}
                    </div>
                    <span className="font-medium text-xl text-Text dark:text-Dark_Text">
                        {tier.name}
                    </span>
                </div>

                {/* Price Tag (White Box style from Figma) */}
                <div className="flex flex-col items-end">
                    <div className="bg-white text-black font-bold px-3 py-1 rounded-lg text-xl mb-1">
                        ฿{tier.price}
                    </div>
                     <span className="text-[10px] text-zinc-500">
                        {tier.rate}
                    </span>
                </div>
            </div>

            {/* Bottom Row: Token Count */}
            <div className="flex items-center gap-2">
                <Coins size={30} className="text-power dark:text-Dark_power" />
                <span className="text-4xl font-bold text-Text dark:text-Dark_Text tracking-tight">
                    {tier.tokens.toLocaleString()}
                </span>
            </div>

        </button>
    );
};

export default PriceCard;