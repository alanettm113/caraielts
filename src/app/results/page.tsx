'use client';

import Sidebar from '@/components/Sidebar';
import ResultChart from '@/components/ResultChart';
import Image from 'next/image';
import { useEffect } from 'react';
import { supabase } from '@/supabase';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) router.push('/auth/login');
        };
        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="results" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">Test Results</h1>
            <ResultChart />
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Listening</th>
                    <th className="p-4 text-left">Overall</th>
                </tr>
                </thead>
                <tbody>
                <tr className="border-t border-gray-200">
                    <td className="p-4">29/04/2025</td>
                    <td className="p-4">7.0</td>
                    <td className="p-4 font-semibold text-amber-500">6.5</td>
                </tr>
                <tr className="border-t border-gray-200">
                    <td className="p-4">28/04/2025</td>
                    <td className="p-4">6.5</td>
                    <td className="p-4 font-semibold text-amber-500">6.0</td>
                </tr>
                </tbody>
            </table>
            </div>
            <div className="mt-8 flex justify-center">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={48} height={48} className="w-12 h-12" />
            <span className="ml-2 text-lg font-bold text-amber-500">CARA IELTS</span>
            </div>
        </main>
        </div>
    );
}