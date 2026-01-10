'use client';

import React from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { DUMMY_USER } from "@/lib/constants";

export default function SettingsPage() {
    return (
        <div className="w-full xl:max-w-9/10 mx-auto pt-4">

            {/* 1. Page Header */}
            <div className="mb-8 md:mb-14 xl:mb-16">
                <h1 className="text-4xl font-bold text-Text dark:text-Dark_Text mb-2">My Settings</h1>
                <p className="text-xs font-light text-subtext dark:text-Dark_subtext">Modify your account</p>
            </div>

            {/* 2. Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12">
                {/* Left Column: Section Title (Matches "Profile" in Figma) */}
                <div className="lg:col-span-4">
                    <h2 className="text-xl font-bold text-Text dark:text-Dark_Text mb-2">Profile</h2>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext leading-relaxed">
                        Your personal information and account security settings.
                    </p>
                </div>

                {/* Right Column: Content (Matches Avatar + Form in Figma) */}
                <div className="lg:col-span-8 ">
                    {/* Avatar Section */}
                    <div className="mb-5">
                        <span className="text-xl font-bold text-Text dark:text-Dark_Text">Avatar</span>
                        <div className="flex items-center gap-4 mt-4">
                            {/* Circle Avatar */}
                            <div className="size-24 rounded-full border border-BG_light dark:border-Dark_BG_light flex items-center justify-center bg-transparent">
                                <User className="size-18 dark:text-BG_light text-Dark_BG_light" strokeWidth={1} />
                            </div>
                            {/* Name below avatar */}
                            <span className="text-xl font-medium text-Text dark:text-Dark_Text">
                                {DUMMY_USER.username}
                            </span>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">Full name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    defaultValue={DUMMY_USER.username}
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">Email</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    defaultValue={DUMMY_USER.email}
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Old Password */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">Old Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter Old Password"
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">New Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter New Password"
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Save Button (Aligned Right, Grey Style) */}
                        <div className="pt-6 flex justify-end">
                            <button className="cursor-pointer px-8 py-2.5 bg-subtext dark:bg-Dark_subtext hover:scale-105 transition-transform dark:text-Text text-Dark_Text rounded-lg transition-colors font-medium text-sm">
                                Saved
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}