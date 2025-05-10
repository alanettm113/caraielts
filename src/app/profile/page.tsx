'use client';

import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { User, Edit } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/auth/login');

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('fullname')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            console.error('Failed to load profile:', error);
            return;
        }

        setFullname(profile.fullname);
        setEmail(user.email || '');
        };

        fetchProfile();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="profile" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md">
            <div className="flex items-center mb-4">
                <div className="w-24 h-24 rounded-full bg-amber-200 flex items-center justify-center">
                <User className="w-12 h-12 text-amber-700" />
                </div>
                <div className="ml-4">
                <h2 className="text-xl font-semibold">{fullname || 'User'}</h2>
                <p className="text-sm text-gray-600">{email || 'No email'}</p>
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-sm">
                <span className="font-semibold">Target IELTS:</span> 7.0
                </p>
            </div>
            <Link href="/profile/edit">
                <button className="mt-4 flex items-center border border-amber-500 hover:bg-amber-100 text-amber-500 px-4 py-2 rounded-md">
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
                </button>
            </Link>
            </div>
            <div className="mt-8 flex justify-center">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={48} height={48} className="w-12 h-12" />
            <span className="ml-2 text-lg font-bold text-amber-500">CARA IELTS</span>
            </div>
        </main>
        </div>
    );
    }