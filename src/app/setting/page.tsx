'use client';

import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/supabase';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

const SettingSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    });

    type SettingData = z.infer<typeof SettingSchema>;

export default function SettingPage() {
    const [notifications, setNotifications] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SettingData>({ resolver: zodResolver(SettingSchema) });

    useEffect(() => {
        const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) router.push('/auth/login');
        };
        checkAuth();
    }, [router]);

    const onSubmit = async (data: SettingData) => {
        setError('');
        if (data.password) {
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) {
            setError(error.message);
            return;
        }
        }
        // Save notification preference (placeholder, as no backend field exists)
        console.log('Notifications:', notifications);
        router.push('/dashboard'); // Redirect after save
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="setting" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input
                    type="password"
                    placeholder="Enter new password"
                    {...register('password')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
                <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Receive Notifications</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                    type="checkbox"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    />
                    <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        notifications ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                    ></label>
                </div>
                </div>
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                <button
                type="submit"
                className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
                >
                Save
                </button>
            </form>
            </div>
            <div className="mt-8 flex justify-center">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={48} height={48} className="w-12 h-12" />
            <span className="ml-2 text-lg font-bold text-amber-500">CARA IELTS</span>
            </div>
        </main>
        </div>
    );
}