'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Timer } from 'lucide-react'

// Create client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    type ReadingTest = {
    id: string
    title: string
    }

    export default function ReadingTestListPage() {
    const [tests, setTests] = useState<ReadingTest[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchTests = async () => {
        const { data, error } = await supabase
            .from('reading_tests')
            .select('id, title')
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Failed to fetch tests:', error)
        } else {
            setTests(data || [])
        }
        setLoading(false)
        }

        fetchTests()
    }, [])

    if (loading) return <p className="text-center mt-10">Loading Reading tests...</p>

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Reading Tests</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {tests.map((test, index) => (
            <button
                key={test.id}
                onClick={() => router.push(`/ielts/reading/${test.id}`)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm"
            >
                {test.title || `Test ${index + 1}`}
            </button>
            ))}
        </div>
        </div>
    )
}
