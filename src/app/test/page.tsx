'use client';

import Sidebar from '@/components/Sidebar';
import TestItem from '@/components/TestItem';
import Image from 'next/image';
import { BookOpen, Headphones, Mic, Pen } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { supabase } from '@/supabase';
import { useRouter } from 'next/navigation';

export default function TestPage() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) router.push('/auth/login');
        };
        checkAuth();
    }, [router]);

    const skillMenus = [
        { label: 'Reading', icon: <BookOpen className="w-5 h-5" />, slug: 'reading' },
        { label: 'Listening', icon: <Headphones className="w-5 h-5" />, slug: 'listening' },
        { label: 'Speaking', icon: <Mic className="w-5 h-5" />, slug: 'speaking' },
        { label: 'Writing', icon: <Pen className="w-5 h-5" />, slug: 'writing' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="test" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">Tests</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Select a Skill</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillMenus.map(({ label, icon, slug }) => (
                    <Link
                    key={slug}
                    href={`/test/ielts/${slug}`} // Updated route
                    className="bg-white p-6 rounded-lg shadow-sm border hover:bg-amber-100 flex flex-col items-center"
                    >
                    {icon}
                    <span className="mt-2 font-semibold">{label}</span>
                    </Link>
                ))}
                </div>
            </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Available Tests</h2>
                <input
                type="text"
                placeholder="Search for tests..."
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <TestItem title="Listening Test 1" duration="30 mins" />
                <TestItem title="Reading Test 1" duration="60 mins" />
                <TestItem title="Writing Test 1" duration="60 mins" />
            </div>
            </div>
            <div className="mt-8 flex justify-center">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={48} height={48} className="w-12 h-12" />
            <span className="ml-2 text-lg font-bold text-amber-500">CARA IELTS</span>
            </div>
        </main>
        </div>
    );
}