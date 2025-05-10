'use client';

import { useRouter } from 'next/navigation';
import { Home, User, FileText, BarChart2, Settings, LogOut, Menu } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SidebarProps {
    activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
    const router = useRouter();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleTransitionEnd = () => {
        if (sidebarRef.current && mainRef.current) {
            mainRef.current.style.marginLeft = sidebarRef.current.offsetWidth === 256 ? '256px' : '64px';
        }
        };

        const sidebar = sidebarRef.current;
        if (sidebar) {
        sidebar.addEventListener('transitionend', handleTransitionEnd);
        }

        mainRef.current = document.querySelector('main');

        return () => {
        if (sidebar) {
            sidebar.removeEventListener('transitionend', handleTransitionEnd);
        }
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
        { id: 'test', label: 'Test', icon: FileText, href: '/test' },
        { id: 'results', label: 'Results', icon: BarChart2, href: '/results' },
        { id: 'setting', label: 'Setting', icon: Settings, href: '/setting' },
        { id: 'auth', label: 'Log out', icon: LogOut, href: '/auth/login', onClick: handleLogout },
    ];

    return (
        <div className="sidebar-container">
        <aside className="sidebar" ref={sidebarRef}>
            <div className="toggle-icon">
            <Menu className="w-6 h-6" />
            </div>
            <nav>
            {navItems.map((item) => (
                <a
                key={item.id}
                href={item.href}
                className={`nav-link flex items-center p-2 rounded-md ${
                    activeSection === item.id ? 'active bg-[#fef3c7] text-[#d97706]' : ''
                }`}
                onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) {
                    item.onClick();
                    } else {
                    router.push(item.href);
                    }
                }}
                >
                <item.icon className="w-5 h-5 mr-2" />
                <span>{item.label}</span>
                </a>
            ))}
            </nav>
        </aside>
        </div>
    );
    };

export default Sidebar;

import { supabase } from '@/supabase';