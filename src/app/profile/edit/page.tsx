'use client';

import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const EditProfileSchema = z.object({
    fullname: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email'),
    ieltsGoal: z.number().min(0).max(9, 'IELTS goal must be between 0 and 9').step(0.5),
});

    type EditProfileData = z.infer<typeof EditProfileSchema>;

export default function EditProfilePage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<EditProfileData>({ resolver: zodResolver(EditProfileSchema) });

    useEffect(() => {
        const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/auth/login');

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('fullname, ielts_goal')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            console.error('Failed to load profile:', error);
            return;
        }

        setValue('fullname', profile.fullname || 'User');
        setValue('email', user.email || '');
        setValue('ieltsGoal', profile.ielts_goal || 7.0);
        };

        fetchProfile();
    }, [router, setValue]);

    const onSubmit = async (data: EditProfileData) => {
        setError('');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: profileError } = await supabase
        .from('profiles')
        .update({
            fullname: data.fullname,
            ielts_goal: data.ieltsGoal,
        })
        .eq('id', user.id);

        if (profileError) {
        setError(profileError.message);
        return;
        }

        router.push('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="profile" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input
                    type="text"
                    {...register('fullname')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>}
                </div>
                <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                    type="email"
                    {...register('email')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                <label className="block text-sm font-semibold mb-1">Target IELTS</label>
                <input
                    type="number"
                    step="0.5"
                    {...register('ieltsGoal', { valueAsNumber: true })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.ieltsGoal && <p className="text-red-500 text-sm mt-1">{errors.ieltsGoal.message}</p>}
                </div>
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                <div className="flex space-x-4">
                <button
                    type="submit"
                    className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
                >
                    Save
                </button>
                <button
                    type="button"
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => router.push('/profile')}
                >
                    Cancel
                </button>
                </div>
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