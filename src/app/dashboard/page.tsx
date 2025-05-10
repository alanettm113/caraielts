'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { Home, User, FileText, BarChart2, Settings, LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import DashboardCard from '@/components/DashboardCard';

export default function DashboardPage() {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('No user found, redirecting to login');
            setLoading(false);
            return router.push('/auth/login');
        }

        console.log('User ID:', user.id);

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('fullname') // Removed 'role' since it doesn't exist
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error.message);
            setLoading(false);
            return;
        }

        if (!profile) {
            console.error('No profile found for user ID:', user.id);
            setLoading(false);
            return;
        }

        console.log('Profile data:', profile);
        setFullname(profile.fullname || 'User');
        setEmail(user.email || '');
        setLoading(false);
        };

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };



    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="dashboard" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-amber-500">
            Welcome {fullname}, ready to study today?
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard type="progress" />
            <DashboardCard type="score" />
            <DashboardCard type="suggestion" />
            </div>
            <div className="mt-8 flex justify-center">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={48} height={48} className="w-12 h-12" />
            <span className="ml-2 text-lg font-bold text-amber-500">CARA IELTS</span>
            </div>
        </main>
        </div>
    );
}