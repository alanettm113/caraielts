'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';

const LoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    });

type LoginData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({ resolver: zodResolver(LoginSchema) });

    const onSubmit = async (data: LoginData) => {
        setError('');
        const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        });

        if (error) {
        if (error.message.includes('Invalid login credentials')) {
            setError('Password is incorrect');
        } else if (error.message.includes('User not found')) {
            setError('User not found');
        } else {
            setError(error.message);
        }
        } else {
        router.push('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={64} height={64} />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-1 text-gray-700">
                Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className="w-full outline-none"
                />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-1 text-gray-700">
                Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <Lock className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register('password')}
                    className="w-full outline-none"
                />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            <button
                type="submit"
                className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition"
            >
                Sign In
            </button>
            </form>
            {/*Forgot Password? & Register*/}
            {/*<div className="text-center text-sm mt-4">
            <Link href="/auth/forgot-password" className="text-amber-500 hover:underline">
                Forgot Password?
            </Link>
            <span className="mx-2">|</span>
            <Link href="/auth/register" className="text-amber-500 hover:underline">
                Register
            </Link>
            </div>*/}
        </div>
        </div>
    );
}