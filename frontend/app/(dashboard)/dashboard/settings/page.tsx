'use client';

import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Lock, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Cookies from 'js-cookie';
import Image from "next/image";

interface UserUpdatePayload {
    username?: string;
    email?: string;
    old_password?: string;
    new_password?: string;
}

interface StatusState {
    type: 'success' | 'error' | '';
    message: string;
}

const SettingsPage = () => {
    const { user, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<StatusState>({ type: '', message: '' });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        old_password: '',
        new_password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username,
                email: user.email
            }));
            if (user.profile_picture_url) {
                setPreviewUrl(user.profile_picture_url);
            }
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        const token = Cookies.get('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        try {
            if (selectedFile) {
                const formDataImage = new FormData();
                formDataImage.append('file', selectedFile);

                const resImg = await fetch(`${API_URL}/api/v1/users/me/avatar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataImage
                });

                if (!resImg.ok) throw new Error('Failed to upload avatar');
            }

            // --- STEP B: Update Text ---
            const payload: UserUpdatePayload = {};
            if (formData.username !== user?.username) payload.username = formData.username;
            if (formData.email !== user?.email) payload.email = formData.email;

            if (formData.new_password) {
                if (!formData.old_password) {
                    throw new Error('Old password is required to change password.');
                }
                payload.old_password = formData.old_password;
                payload.new_password = formData.new_password;
            }

            if (!selectedFile && Object.keys(payload).length === 0) {
                setIsLoading(false);
                return;
            }

            if (Object.keys(payload).length > 0) {
                const resText = await fetch(`${API_URL}/api/v1/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const dataText = await resText.json();
                if (!resText.ok) throw new Error(dataText.detail || 'Failed to update profile info');
            }

            // --- STEP C: Success ---
            setStatus({ type: 'success', message: 'Changes saved successfully!' });
            setFormData(prev => ({ ...prev, old_password: '', new_password: '' }));
            setSelectedFile(null);
            await refreshUser();
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = 'Something went wrong';

            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full xl:max-w-9/10 mx-auto pt-4">
            <div className="mb-8 md:mb-14 xl:mb-16">
                <h1 className="text-4xl font-bold text-Text dark:text-Dark_Text mb-2">My Settings</h1>
                <p className="text-xs font-light text-subtext dark:text-Dark_subtext">Modify your account</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12">
                <div className="lg:col-span-4">
                    <h2 className="text-xl font-bold text-Text dark:text-Dark_Text mb-2">Profile</h2>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext leading-relaxed">
                        Your personal information and account security settings.
                    </p>
                </div>

                <div className="lg:col-span-8 ">

                    {/* --- Avatar Section --- */}
                    <div className="mb-8">
                        <span className="text-xl font-bold text-Text dark:text-Dark_Text">Avatar</span>
                        <div className="flex items-center gap-6 mt-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div onClick={handleAvatarClick} className="group relative size-24 rounded-full border border-BG_light dark:border-Dark_BG_light flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-pointer overflow-hidden transition-all hover:border-power">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Avatar Preview" width={16} height={16}
                                        className="w-full h-full object-cover" unoptimized
                                    />
                                ) : (
                                     <div className="size-24 rounded-full border border-BG_light dark:border-Dark_BG_light flex items-center justify-center bg-transparent">
                                        <User className="size-18 dark:text-BG_light text-Dark_BG_light" strokeWidth={1} />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xl font-medium text-Text dark:text-Dark_Text">
                                    {formData.username || 'Username'}
                                </span>
                                <button
                                    onClick={handleAvatarClick}
                                    type="button"
                                    className="text-xs text-subtext hover:text-power transition-colors text-left"
                                >
                                    Change profile photo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- Alert --- */}
                    {status.message && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm mb-6 ${
                            status.type === 'success' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                            {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                            {status.message}
                        </div>
                    )}

                    {/* --- Form --- */}
                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">Full name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-power transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-power/50 transition-colors placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-power transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-power/50 transition-colors placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Old Password */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">Old Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-power transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    name="old_password"
                                    type="password"
                                    placeholder="Required to set new password"
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-power/50 transition-colors placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-subtext dark:text-Dark_subtext text-sm">New Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-power transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    name="new_password"
                                    type="password"
                                    placeholder="Enter New Password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border border-BG_light dark:border-Dark_BG_light rounded-xl py-3 pl-12 pr-4 text-Text dark:text-Dark_Text focus:outline-none focus:border-power/50 transition-colors placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button disabled={isLoading} className="flex items-center gap-2 cursor-pointer px-8 py-2.5 bg-subtext dark:bg-Dark_subtext hover:scale-105 transition-transform dark:text-Text text-Dark_Text rounded-lg font-medium text-sm disabled:opacity-50 disabled:hover:scale-100">
                                {isLoading && <Loader2 className="animate-spin" size={16} />}
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;