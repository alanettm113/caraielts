'use client';

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/supabase"
import {
    BookOpen,
    Headphones,
    Mic,
    Pen,
    Upload,
    Edit,
    FileText
} from 'lucide-react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Button } from '@/components/ui/button';


export default function DashboardPage() {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<'teacher' | 'student' | ''>('');
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return router.push('/auth/login');

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, role')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            console.error('Error fetching profile:', error);
            return;
        }

        setUsername(profile.username || 'Guest');
        setRole(profile.role || '');
        };

        getUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };


    const skillMenus = [
        { label: 'Reading', icon: <BookOpen className="w-5 h-5" />, slug: 'reading' },
        { label: 'Listening', icon: <Headphones className="w-5 h-5" />, slug: 'listening' },
        { label: 'Speaking', icon: <Mic className="w-5 h-5" />, slug: 'speaking' },
        { label: 'Writing', icon: <Pen  className="w-5 h-5" />, slug: 'writing' },
        ];

    const studentDashboard = (
        <div className="max-w-5xl mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">COMPUTER-DELIVERED BY MS CARA</h1>
        <div className="text-lg mb-6">Welcome: <span className="font-semibold">{username}</span></div>

        {/* buttons here */}
        {/*grid grid-cols-2 gap-8*/}
        <div className="flex justify-center gap-10 mt-10">
            {skillMenus.map(({ label, icon, slug }) => (
            <a href={`/ielts/${slug}`} key={label} className="border rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex flex-col items-center justify-center w-32 h-32 text-xl font-semibold transition "> 
                {icon}
                <span>{label}</span>
                </div>
            </a>
            ))}
        </div>

        <button
            onClick={handleLogout}
            className="mt-10 px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
        >
            Logout
        </button>
        </div>
    );

    const teacherDashboard = (
        <div className="max-w-5xl mx-auto py-10 text-center">
            <h1 className="text-3xl font-bold mb-6">COMPUTER-DELIVERED BY MS CARA</h1>
            <div className="text-lg mb-6">Welcome: <span className="font-semibold">{username}</span></div>
            <div className="gflex justify-center gap-10 mt-10">
                {skillMenus.map(({ label, icon, slug }) => (
                <NavigationMenu.Root key={label} className="relative">
                    <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenu.Trigger className="w-full py-6 px-4 border rounded-xl text-xl font-semibold flex items-center justify-center gap-2">
                        {icon}
                        {label}
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white shadow-md rounded-md w-48 z-50 text-left p-2 space-y-1">
                        <NavigationMenu.Link asChild>
                            <a href={`/teacher/${slug}/results`} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded">
                            <FileText className="w-4 h-4" /> Test Results
                            </a>
                        </NavigationMenu.Link>
                        <NavigationMenu.Link asChild>
                            <a href={`/teacher/${slug}/upload`} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded">
                            <Upload className="w-4 h-4" /> Upload
                            </a>
                        </NavigationMenu.Link>
                        <NavigationMenu.Link asChild>
                            <a href={`/teacher/${slug}/edit`} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded">
                            <Edit className="w-4 h-4" /> Edit
                            </a>
                        </NavigationMenu.Link>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
                ))}
            </div>
            <Button
                onClick={handleLogout}
                className="mt-10 bg-red-500 hover:bg-red-600 text-white"
            >
                Logout
            </Button>
            </div>
        );

    return role === 'teacher' ? teacherDashboard : studentDashboard;
    }
