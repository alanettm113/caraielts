"use client";
import { useEffect } from "react";
import { supabase } from "@/supabase";// adjust to your path

export default function AuthHandler() {
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", session.user.id)
                .single();

            if (!profile) {
                const role =
                session.user.email === "alanettm113@gmail.com"
                    ? "teacher"
                    : "student";

                await supabase.from("profiles").insert([
                {
                    id: session.user.id,
                    username: session.user.email,
                    role,
                },
                ]);
            }
            }
        }
        );

        return () => {
        authListener.subscription.unsubscribe();
        };
    }, []);

    return null;
    }
