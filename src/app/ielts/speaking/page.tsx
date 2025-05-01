'use client'

import { useState } from 'react'
import { supabase } from "@/supabase"
import { useRouter } from 'next/navigation'

export default function SpeakingPage() {
    const [responses, setResponses] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const questions = [
        { id: 'q1', prompt: 'Describe your hometown.' },
        { id: 'q2', prompt: 'What are your hobbies and why do you enjoy them?' },
        { id: 'q3', prompt: 'Talk about a recent holiday or trip you went on.' },
    ]

    const handleChange = (id: string, value: string) => {
        setResponses((prev) => ({
        ...prev,
        [id]: value,
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user?.id) return alert('Not logged in')

        const { error } = await supabase.from('submissions').insert({
        user_id: userData.user.id,
        test_id: 'speaking-test-01',
        answers: responses,
        score: null,
        })

        setLoading(false)
        if (error) return alert('Failed to submit speaking test')
        alert('Speaking test submitted!')
        router.push('/dashboard')
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">IELTS Speaking Test</h1>

        {questions.map((q) => (
            <div key={q.id} className="mb-6">
            <p className="font-semibold mb-2">{q.prompt}</p>
            <textarea
                rows={5}
                className="w-full border rounded p-3"
                value={responses[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
            />
            </div>
        ))}

        <div className="text-center">
            <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
            {loading ? 'Submitting...' : 'Submit Speaking'}
            </button>
        </div>
        </div>
    )
}
