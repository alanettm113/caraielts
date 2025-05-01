'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'

const RegisterSchema = z
    .object({
        fullname: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

    type RegisterData = z.infer<typeof RegisterSchema>

    export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState('')


    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterData>({
        resolver: zodResolver(RegisterSchema),
    })

    const onSubmit = async (data: RegisterData) => {
        setError('') // clear any previous errors
        
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            })
        
        if (signUpError) {
            setError(signUpError.message)
        return
            }
        
            // If email confirmation is required, session will be null
        if (!signUpData.session) {
            router.push('/auth/login')
        return
            }
        
            // Add username to 'profiles' table
            if (!signUpData.user) {
                console.error("Sign up failed, user object is null");
                return;
                }
                
            const { error: profileError } = await supabase.from("profiles").upsert({
                id: signUpData.user.id,
                fullname: data.fullname,
                });
        
        if (profileError) {
            setError(profileError.message)
        return
            }
        
            router.push('/dashboard')
        }

    const handleGoogleSignUp = async () => {
        await supabase.auth.signInWithOAuth({
        provider: 'google',
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white">
            <h1 className="text-3xl font-bold mb-4 text-center">Register</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <input
                type="text"
                placeholder="Full name"
                {...register('fullname')}
                className="w-full px-4 py-2 border rounded-xl"
                />
                {errors.fullname && (
                <p className="text-red-500 text-sm">{errors.fullname.message}</p>
                )}
            </div>
            <div>
                <input
                type="email"
                placeholder="Email"
                {...register('email')}
                className="w-full px-4 py-2 border rounded-xl"
                />
                {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
            </div>
            <div>
                <input
                type="password"
                placeholder="Password"
                {...register('password')}
                className="w-full px-4 py-2 border rounded-xl"
                />
                {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
            </div>
            <div>
                <input
                type="password"
                placeholder="Confirm Password"
                {...register('confirmPassword')}
                className="w-full px-4 py-2 border rounded-xl"
                />
                {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                </p>
                )}
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition"
            >
                Sign Up
            </button>
            </form>

            <div className="my-4 text-center">or</div>

            <button
            onClick={handleGoogleSignUp}
            className="w-full border border-gray-300 py-2 rounded-xl hover:bg-gray-100 transition"
            >
            Sign Up with Google
            </button>

            <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-500 hover:underline">
                Login here
            </a>
            </p>
        </div>
        </div>
    )
}
