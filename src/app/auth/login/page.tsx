// src/app/auth/login/page.tsx
'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'



const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginData = z.infer<typeof LoginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(LoginSchema),
    })
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
    
    const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
            })
        
            if (error) {
            setError(error.message)
            } else {
            router.push('/dashboard') // or wherever your app goes post-login
            }
        }


    const onSubmit = async (data: LoginData) => {
        setError('')
        const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        })

        if (error) {
        setError(error.message)
        } else {
        router.push('/dashboard')
        }
    }

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
        provider: 'google',
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white">
            <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <input
                type="email"
                placeholder="Email"
                {...register('email')}
                className="w-full px-4 py-2 border rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
                <input
                type="password"
                placeholder="Password"
                {...register('password')}
                className="w-full px-4 py-2 border rounded-xl"
                onChange={(e) => setPassword(e.target.value)}
                required/>
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition">
                Sign In
            </button>
            </form>

            <div className="my-4 text-center">or</div>

            <button
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 py-2 rounded-xl hover:bg-gray-100 transition"
            >
            Continue with Google
            </button>
            {/* your login form here */}
            <p className="mt-4">
            Don’t have an account?{' '}
            <Link href="/auth/register" className="text-blue-500 underline">                Register here!
                </Link>
            </p>
        </div>
        </div>
        
    )
}
