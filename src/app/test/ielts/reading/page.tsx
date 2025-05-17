'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useEffect } from 'react';
import { supabase } from '@/supabase';

export default function ReadingTestPage() {
    const router = useRouter();

    const handleClick = (testId: string) => {
        router.push(`/ielts/reading/${testId}`);
    };

    useEffect(() => {
    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) router.push('/auth/login');
        };
        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
        <Sidebar activeSection="test" />
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">Reading Tests</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                'test-1', 'test-2', 'test-3', 
                'test-4', 'test-5', 'test-6',
                'test-7', 'test-8', 'test-9', 'test-10'
                ].map((id, index) => (
                <div
                    key={id}
                    onClick={() => handleClick(id)}
                    className="cursor-pointer p-6 border rounded-lg shadow hover:bg-amber-100 transition"
                >
                    <h2 className="text-xl font-semibold mb-2 text-amber-500">Reading Test {index + 1}</h2>
                    <p className="text-sm text-gray-600">
                    Click to begin Reading Test {index + 1}
                    </p>
                </div>
                ))}
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
