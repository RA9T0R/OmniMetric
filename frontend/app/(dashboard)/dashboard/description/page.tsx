'use client';

import React from 'react';
import { 
    BookOpen, 
    Cpu, 
    Zap, 
    Crown, 
    Globe, 
    Image as ImageIcon, 
    ScanEye, 
    Box, 
    Info 
} from 'lucide-react';

const DescriptionPage = () => {
    return (
        <div className="w-full flex flex-col gap-8 xl:max-w-9/10 mx-auto pb-12">

            {/* 1. Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold text-Text dark:text-Dark_Text">Platform Description</h1>
                <p className="text-sm font-light text-subtext dark:text-Dark_subtext max-w-2xl">
                    Understand how OmniMetric uses artificial intelligence to transform 2D images into spatial data, detecting objects and estimating depth with high precision.
                </p>
            </div>

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Main Info (Span 2) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* A. Workflow Section */}
                    <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <ScanEye size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-Text dark:text-Dark_Text">How It Works</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <p className="text-subtext dark:text-zinc-400 leading-relaxed">
                                OmniMetric processes uploaded images through a multi-stage AI pipeline. First, our <strong>Object Detection Engine (YOLO)</strong> identifies and labels distinct items within the scene. Simultaneously, the <strong>Depth Estimation Model</strong> analyzes pixel disparity to generate a metric depth map, calculating the real-world distance of every object from the camera lens.
                            </p>
                            
                            {/* Steps Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="p-4 rounded-2xl bg-BG_light dark:bg-black/20 border border-black/5 dark:border-white/5">
                                    <div className="size-8 rounded-full bg-power text-black font-bold flex items-center justify-center mb-3">1</div>
                                    <h4 className="font-bold text-Text dark:text-white mb-1">Upload</h4>
                                    <p className="text-xs text-subtext dark:text-zinc-500">Submit Normal or 360° equirectangular images.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-BG_light dark:bg-black/20 border border-black/5 dark:border-white/5">
                                    <div className="size-8 rounded-full bg-power text-black font-bold flex items-center justify-center mb-3">2</div>
                                    <h4 className="font-bold text-Text dark:text-white mb-1">AI Process</h4>
                                    <p className="text-xs text-subtext dark:text-zinc-500">Models detect objects and calculate metric depth.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-BG_light dark:bg-black/20 border border-black/5 dark:border-white/5">
                                    <div className="size-8 rounded-full bg-power text-black font-bold flex items-center justify-center mb-3">3</div>
                                    <h4 className="font-bold text-Text dark:text-white mb-1">Analyze</h4>
                                    <p className="text-xs text-subtext dark:text-zinc-500">View interactive results and export data.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* B. AI Models Comparison */}
                    <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                <Cpu size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-Text dark:text-Dark_Text">Available Models</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fast Model Card */}
                            <div className="p-6 rounded-2xl border border-BG_light dark:border-white/10 hover:border-power dark:hover:border-Dark_power transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                                        <Zap size={24} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-subtext dark:text-zinc-400">5 Tokens</span>
                                </div>
                                <h3 className="text-xl font-bold text-Text dark:text-white mb-2">FastTypeModel</h3>
                                <p className="text-sm text-subtext dark:text-zinc-500 mb-4">
                                    Optimized for speed. Best for real-time applications or large datasets where approximate detection is sufficient.
                                </p>
                                <ul className="text-xs text-subtext dark:text-zinc-400 space-y-2">
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-green-500"/>Process time: ~2s</li>
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-yellow-500"/>Accuracy: Standard</li>
                                </ul>
                            </div>

                            {/* Pro Model Card */}
                            <div className="p-6 rounded-2xl border border-BG_light dark:border-white/10 bg-linear-to-br from-transparent to-power/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Crown size={100} />
                                </div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-2 bg-power/10 text-power rounded-lg">
                                        <Crown size={24} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-power text-black rounded">10 Tokens</span>
                                </div>
                                <h3 className="text-xl font-bold text-Text dark:text-white mb-2 relative z-10">ProTypeModel</h3>
                                <p className="text-sm text-subtext dark:text-zinc-500 mb-4 relative z-10">
                                    High-precision architecture. Uses complex layers to detect small objects and provide the most accurate depth readings.
                                </p>
                                <ul className="text-xs text-subtext dark:text-zinc-400 space-y-2 relative z-10">
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-yellow-500"/>Process time: ~8s</li>
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-green-500"/>Accuracy: Ultra High</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Secondary Info (Span 1) */}
                <div className="flex flex-col gap-6">

                    {/* C. Supported Inputs */}
                    <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen size={20} className="text-subtext dark:text-zinc-400"/>
                            <h3 className="text-lg font-bold text-Text dark:text-Dark_Text">Input Support</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <ImageIcon size={24} className="text-subtext dark:text-zinc-500 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sm text-Text dark:text-white">Normal Image</h4>
                                    <p className="text-xs text-subtext dark:text-zinc-500 mt-1">Standard JPEG/PNG photos taken from any smartphone or DSLR.</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-black/5 dark:bg-white/5" />
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <Globe size={24} className="text-subtext dark:text-zinc-500 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sm text-Text dark:text-white">360° Equirectangular</h4>
                                    <p className="text-xs text-subtext dark:text-zinc-500 mt-1">Full panoramic scans. The AI will unwrap and analyze the entire environment.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* D. FAQ / Info Box */}
                    <section className="bg-linear-to-b from-blue-900/20 to-Main_BG dark:to-Dark_Main_BG border border-blue-500/20 p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <Info size={20} />
                            <h3 className="text-lg font-bold">Did you know?</h3>
                        </div>
                        <p className="text-sm text-subtext dark:text-zinc-400 leading-relaxed mb-4">
                            Detected objects retain their bounding box metadata even if you export the image. This data is JSON-formatted and compatible with standard GIS tools.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/20">
                            View Documentation
                        </button>
                    </section>

                    {/* E. Token Balance Summary */}
                    <section className="bg-zinc-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center text-center">
                        <Box size={32} className="text-power mb-3" />
                        <h3 className="text-white font-bold text-lg">Your Balance</h3>
                        <p className="text-zinc-500 text-xs mb-4">Credits are deducted per image analysis.</p>
                        <div className="text-3xl font-bold text-white mb-1">100 <span className="text-base text-power font-normal">Tokens</span></div>
                    </section>

                </div>

            </div>
        </div>
    );
}

export default DescriptionPage;