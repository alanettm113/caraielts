'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const RegisterSchema = z
    .object({
        fullname: z.string().min(3, 'Full name must be at least 3 characters'),
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

    type RegisterData = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterData>({ resolver: zodResolver(RegisterSchema) });

    const onSubmit = async (data: RegisterData) => {
        setError('');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        });

        if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
            setError('User already exists');
        } else {
            setError(signUpError.message);
        }
        return;
        }

        if (!signUpData.user) {
        setError('User registration failed.');
        return;
        }

        const { error: profileError } = await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        fullname: data.fullname,
        });

        if (profileError) {
        setError(profileError.message);
        return;
        }

        router.push('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={64} height={64} />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="fullname" className="block text-sm font-semibold mb-1 text-gray-700">
                Full Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    id="fullname"
                    type="text"
                    placeholder="Enter your full name"
                    {...register('fullname')}
                    className="w-full outline-none"
                />
                </div>
                {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>}
            </div>
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
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1 text-gray-700">
                Confirm Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <Lock className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    className="w-full outline-none"
                />
                </div>
                {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            <button
                type="submit"
                className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition"
            >
                Sign Up
            </button>
            </form>
            <div className="text-center text-sm mt-4">
            <Link href="/auth/login" className="text-amber-500 hover:underline">
                Already have an account? Sign In
            </Link>
            </div>
        </div>
        </div>
    );
}