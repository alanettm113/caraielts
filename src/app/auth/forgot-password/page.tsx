'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ForgotPasswordSchema = z.object({
    email: z.string().email('Invalid email'),
    });

    type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

    export default function ForgotPasswordPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({ resolver: zodResolver(ForgotPasswordSchema) });

const onSubmit = async (data: ForgotPasswordData) => {
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
        setError(error.message);
        } else {
        setSuccess('Password reset link sent! Check your email.');
        setTimeout(() => router.push('/auth/login'), 3000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
            <Image src="/images/CARA_IELTS_Logo.jpg" alt="CARA IELTS Logo" width={64} height={64} />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
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
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-1">{success}</p>}
            <button
                type="submit"
                className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition"
            >
                Send Reset Link
            </button>
            </form>
            <div className="text-center text-sm mt-4">
            <Link href="/auth/login" className="text-amber-500 hover:underline">
                Back to Login
            </Link>
            </div>
        </div>
        </div>
    );
}