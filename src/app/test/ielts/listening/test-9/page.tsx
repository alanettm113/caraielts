'use client';

import { useRouter } from 'next/navigation';

export default function ReadingTestPage() {
    const router = useRouter();

    const handleClick = (testId: string) => {
        router.push(`/ielts/listening/${testId}`);
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Listening Tests</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['test-1', 'test-2', 'test-3', 
            'test-4', 'test-5', 'test-6',
            'test-7','test-8','test-9','test-10'
            ].map((id, index) => (
            <div
                key={id}
                onClick={() => handleClick(id)}
                className="cursor-pointer p-6 border rounded-lg shadow hover:bg-blue-100 transition"
            >
                <h2 className="text-xl font-semibold mb-2">Listening Test {index + 1}</h2>
                <p className="text-sm text-gray-600">
                Click to begin Listening Test {index + 1}
                </p>
            </div>
            ))}
        </div>
        </div>
    );
}