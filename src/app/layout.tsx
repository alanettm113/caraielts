'use client'


import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import "./globals.css";

  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });



  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!profile) {
            const role = session.user.email === 'alanettm113@gmail.com' ? 'teacher' : 'student'

            await supabase.from('profiles').insert([
              {
                id: session.user.id,
                username: session.user.email,
                role,
              },
            ])
          }
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );

}
