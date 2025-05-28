'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Clock as ClockIcon,
    Volume2,
    Volume1,
    VolumeX,
    Expand,
    SendHorizontal,
    Loader2,
    SquarePen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField'
import Image from 'next/image'
import dayjs from 'dayjs';
import jsPDF from 'jspdf'

// Correct Answers
const correctAnswers = [
    "614381997", "post.com", "chemist", "garden", "balcony", "fridge", "400", "beach", "parking", "electricity", // Q1–10
    "A", "B", "A", "B", "F", "A", "B", "H", "G", "I", // Q11–20 (updated to single letters as they are now text inputs)
    "A", "C", "B", "A", "B", "B", "G", "E", "D", "B", // Q21–30
    "extinct", "education", "broken", "plantation", "city", "developed", "meanings", "French", "culture", "preposition" // Q31–40
]

type Question = {
    number: number;
    answer?: string;
}

type TestData = {
    title: string;
    questions: Question[];
}

export default function ListeningTestPage() {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement>(null)
    const testId = 2;
    
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [volume, setVolume] = useState(1)
    const [highlighted] = useState<Set<number>>(new Set()) // Removed setHighlighted since it's unused, kept highlighted for UI
    const [testData, setTestData] = useState<TestData | null>(null)
    const [muted, setMuted] = useState(false)
    const [started, setStarted] = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(true)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')
    const [submittingTest, setSubmittingTest] = useState(false)
    const [timeLeft, setTimeLeft] = useState(32 * 60) // 32 minutes
    const [audioError, setAudioError] = useState<string | null>(null)
    const [selRect, setSelRect] = useState<{ top: number; left: number } | null>(null)
    
    // Simplified handleAnswerChange for text inputs only
    const handleAnswerChange = (qnum: number, val: string) => {
        setAnswers(prev => {
            const updated = {
                ...prev,
                [qnum]: val
            };
            console.log(`Updated answers for qnum ${qnum}:`, updated);
            return updated;
        });
    }

    useEffect(() => {
        // Simulate loading test data
        const initialTestData: TestData = {
            title: "IELTS Listening Test 2",
            questions: Array.from({ length: 40 }, (_, i) => ({
                number: i + 1,
                answer: "",
            })),
        };
        setTestData(initialTestData);
    }, []);

    // Auto countdown + auto submit
    useEffect(() => {
        if (!started || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setShowSubmitDialog(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, timeLeft]);

    // Timer display format
    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }

    useEffect(() => {
        if (started && audioRef.current) {
            audioRef.current.play()
                .catch((error) => {
                    console.error('Audio playback failed:', error);
                    setAudioError('Failed to play the audio. Please check the audio file or browser permissions.');
                });
        }
    }, [started])

    useEffect(() => {
        if (started && audioRef.current) {
            audioRef.current.play().catch(console.error)
        }
    }, [started])
    
    // Timer logic in handlePlay
    const handlePlay = () => {
        if (audioRef.current) {
            const duration = 32 * 60 // 32 minutes (1920 seconds)
            setTimeLeft(duration)
            audioRef.current.play()
                .catch((error) => {
                    console.error('Audio playback failed:', error);
                    setAudioError('Failed to play the audio. Please check the audio file or browser permissions.');
                });
            setStarted(true)
        }
    }

    // Audio duration setup
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onloadedmetadata = () => {
                const final = 32 * 60 // 32 minutes
                setTimeLeft(final)
            }
        }
    }, [audioRef])

    // Lock Scroll When Blurred
    useEffect(() => {
        document.body.style.overflow = started ? 'auto' : 'hidden'
    }, [started])

    // Toggle Full Screen
    const toggleFull = () => {
        const elem = document.documentElement
        if (!document.fullscreenElement) {
            elem.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }
    
    // Submit dialog handler
    const handleOpenSubmitDialog = () => setShowSubmitDialog(true)
    
    // Utility to load image as base64
    const loadImageAsBase64 = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Final submit handler
    const handleFinalSubmit = async () => {
        if (!studentName.trim() || !studentDatetime.trim()) {
            alert('Please fill Full Name and Datetime!');
            return;
        }

        try {
            setSubmittingTest(true);

            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            doc.setFont('helvetica', 'normal');
            const margin = 40;
            const maxWidth = 515;
            let y = 40;

            // Load and add the CARA IELTS logo
            const logoUrl = '/images/CARA_IELTS_Logo.jpg';
            try {
                const logoBase64 = await loadImageAsBase64(logoUrl);
                doc.addImage(logoBase64, 'JPEG', 490, 5, 100, 100);
            } catch (error) {
                console.error('Failed to load logo:', error);
            }

            const testId = testData?.title?.split(' ').pop() || '1';
            const testTitle = `IELTS LISTENING TEST ${testId}`;

            doc.setFontSize(14);
            doc.text(testTitle, 290, y, { align: 'center' });
            y += 30;

            doc.setFontSize(12);
            doc.text(`Student: ${studentName}`, margin, y);
            y += 20;
            doc.text(`Date: ${studentDatetime}`, margin, y);
            y += 20;
            doc.line(margin, y, 555, y);
            y += 20;

            // Score calculation
            const sortedQs = testData!.questions.sort((a, b) => a.number - b.number);
            let correctCount = 0;
            sortedQs.forEach((q, index) => {
                let userAns = answers[q.number];
                let correctAns = correctAnswers[index];
    
                // Skip unanswered questions
                if (userAns === undefined) return;

                // Since Q17–20 are now text inputs, treat all answers as strings
                userAns = String(userAns || '').replace(/^!['’]?\s*/, '').trim();

                // Skip if user answer is empty after trimming
                if (!userAns) return;
    
                if (Array.isArray(correctAns)) {
                    correctAns = correctAns.join(', ').trim();
                } else {
                    correctAns = String(correctAns || '').trim();
                }
    
                if (userAns.toLowerCase() === correctAns.toLowerCase()) {
                    correctCount++;
                }
            });

            let band = 0;
            if (correctCount >= 39) band = 9.0;
            else if (correctCount >= 37) band = 8.5;
            else if (correctCount >= 35) band = 8.0;
            else if (correctCount >= 33) band = 7.5;
            else if (correctCount >= 30) band = 7.0;
            else if (correctCount >= 27) band = 6.5;
            else if (correctCount >= 23) band = 6.0;
            else if (correctCount >= 19) band = 5.5;
            else if (correctCount >= 15) band = 5.0;
            else if (correctCount >= 13) band = 4.5;
            else if (correctCount >= 10) band = 4.0;
            else if (correctCount >= 7) band = 3.5;
            else if (correctCount >= 5) band = 3.0;
            else band = 2.5;

            // Print answers (simplified since Q17–20 are now text inputs)
            sortedQs.forEach((q) => {
                const qnum = q.number;
                const rawAnswer = answers[qnum] ?? '[No Answer]';
                const clean = (txt: string) => txt.replace(/^!['’]?\s*/g, '').trim();
                const formattedAnswer = clean(String(rawAnswer));
                const line = `${qnum}. ${formattedAnswer}`;
                const wrappedLines = doc.splitTextToSize(line, maxWidth);
                if (y + wrappedLines.length * 16 > 780) {
                    doc.addPage();
                    y = 40;
                }
                doc.text(wrappedLines, margin, y);
                y += wrappedLines.length * 16 + 6;
            });

            // Watermark on every page
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setTextColor(200);
                doc.setFontSize(60);
            }

            doc.save(`Listening_${studentName.replace(/\s+/g, '_')}.pdf`);
            alert('✅ PDF download started!');
            router.push('/dashboard');
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('❌ Failed to submit test.');
        } finally {
            setSubmittingTest(false);
        }
    }
    
    // Highlight event
    const highlight = (color: string) => {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) return;
    
        const range = sel.getRangeAt(0);
        if (!range) return;
    
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.className = 'highlighted';
    
        try {
            const contents = range.cloneContents();
            const nodes = contents.childNodes;
    
            let canSurround = true;
            nodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    const tagName = element.tagName.toLowerCase();
                    if (['div', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        canSurround = false;
                    }
                }
            });

            if (canSurround) {
                range.surroundContents(span);
            } else {
                const fragment = document.createDocumentFragment();
                nodes.forEach(node => {
                    const wrapper = document.createElement('span');
                    wrapper.style.backgroundColor = color;
                    wrapper.className = 'highlighted';
                    wrapper.appendChild(node.cloneNode(true));
                    fragment.appendChild(wrapper);
                });
                range.deleteContents();
                range.insertNode(fragment);
            }
        } catch (error) {
            console.error('Highlight error:', error);
            const text = sel.toString();
            if (text) {
                range.deleteContents();
                span.textContent = text;
                range.insertNode(span);
            }
        } finally {
            sel.removeAllRanges();
            setSelRect(null);
        }
    }
        
    const removeHighlight = () => {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) return;
        
        const range = sel.getRangeAt(0);
        const startContainer = range.startContainer;
        const parent = startContainer.nodeType === Node.ELEMENT_NODE 
            ? startContainer 
            : startContainer.parentElement;
        
        if (parent instanceof Element) {
            if (parent.classList.contains('highlighted')) {
                const grandParent = parent.parentElement;
                if (grandParent) {
                    while (parent.firstChild) {
                        grandParent.insertBefore(parent.firstChild, parent);
                    }
                    grandParent.removeChild(parent);
                    grandParent.normalize();
                }
            } else {
                const contents = range.cloneContents();
                const highlightedSpans = contents.querySelectorAll('.highlighted');
                if (highlightedSpans.length > 0) {
                    const fragment = document.createDocumentFragment();
                    contents.childNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).classList.contains('highlighted')) {
                            fragment.appendChild(document.createTextNode(node.textContent || ''));
                        } else {
                            fragment.appendChild(node.cloneNode(true));
                        }
                    });
                    range.deleteContents();
                    range.insertNode(fragment);
                }
            }
        }
        
        sel.removeAllRanges();
        setSelRect(null);
    }

    const onMouseUp = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount || sel.toString().length === 0) {
            setSelRect(null);
            return;
        }
        
        const range = sel.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        
        const isWithinInput = (container: Node) => {
            const parent = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
            if (parent instanceof Element) {
                const tagName = parent.tagName.toLowerCase();
                return tagName === 'input' || tagName === 'textarea';
            }
            return false;
        };
        
        if (isWithinInput(startContainer) || isWithinInput(endContainer)) {
            setSelRect(null);
            return;
        }
        
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            setSelRect({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
            });
        } else {
            setSelRect(null);
        }
    }

    return (
        <div className="relative w-full h-full" onMouseUp={onMouseUp}>
        {!started && <div className="absolute inset-0 backdrop-blur-sm z-10" />}
        {/* START AUDIO */}
        {started && (
            <audio ref={audioRef} src="/audio/listeningtest_2.mp3" preload="auto" hidden />
        )}
        {audioError && <p className="text-red-500 text-sm">{audioError}</p>}
        {/* START DIALOG */}
        {showStartDialog && (
            <div className="fixed inset-0 flex items-center justify-center z-20">
            <div className="bg-orange-50 p-8 rounded shadow-md text-center space-y-4">
                <h2 className="text-2xl font-semibold">Ready to Start?</h2>
                <p className="text-lg">
                Click{' '}
                <span
                    className="text-red-500 underline cursor-pointer"
                    onClick={() => {
                        setStarted(true)
                        setShowStartDialog(false)
                        handlePlay()
                    }}
                >
                    here
                </span>{' '}to start the test.
                </p>
            </div>
            </div>
        )}
        
        {/* Highlight Toolbar */}
        {selRect && (
            <div
                className="highlight-toolbar absolute z-50 flex items-center gap-1 p-1 bg-white border rounded shadow"
                style={{
                    top: selRect.top - 40,
                    left: selRect.left,
                }}
            >
                {['yellow', 'lightgreen', 'pink', 'aqua', 'orange'].map((color) => (
                    <button
                        key={color}
                        className="w-5 h-5 border"
                        style={{ backgroundColor: color }}
                        onClick={() => highlight(color)}
                    />
                ))}
                <button
                    className="w-6 h-6 rounded border flex items-center justify-center text-amber-700"
                    onClick={removeHighlight}
                >
                    <SquarePen size={20} />
                </button>
            </div>
        )}

        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full bg-amber-50 py-2 px-4 z-50 flex items-center justify-between border">
            <h1 className="text-lg font-bold">IELTS Listening Test {testId}</h1>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                <ClockIcon className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold text-orange-500">
                    {formatTime(timeLeft)}
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <Button size="icon" variant="ghost" onClick={() => {
                    const newVol = volume === 0 ? 1 : 0
                    setVolume(newVol)
                    setMuted(newVol === 0)
                    if (audioRef.current) audioRef.current.volume = newVol
                }}>
                    {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume === 1 ? <Volume2 className="w-5 h-5" /> : <Volume1 className="w-5 h-5" />}
                </Button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        setVolume(v)
                        setMuted(v === 0)
                        if (audioRef.current) audioRef.current.volume = v
                    }}
                    className="w-32"
                />
                <button onClick={toggleFull} className="p-2">
                    <Expand className="w-5 h-5 text-gray-600" />
                </button>
                <Button
                    onClick={handleOpenSubmitDialog}
                    disabled={submittingTest}
                    className="bg-amber-300 hover:bg-amber-400 text-white flex items-center gap-1"
                >
                    {submittingTest ? <Loader2 className="animate-spin w-5 h-5" /> : <><span>Submit</span><SendHorizontal className="w-5 h-5" /></>}
                </Button>
            </div>
        </header>

        {/* QUESTIONS */}
        <div className="overflow-y-auto pt-10 p-4 pb-10" onMouseUp={onMouseUp}>
        {/* SECTION 1: Questions 1–10 */}
        <section className="bg-white p-4 rounded shadow space-y-1 mt-1 text-[15px]" onMouseUp={onMouseUp}>
        <h2 className="text-lg font-semibold">SECTION 1. QUESTIONS 1-10</h2>
        <h4 className="font-semibold mt-3">Questions 1–4</h4>
        <p>Complete the notes below.<span className="font-bold"> Write <span className="text-red-600">NO MORE THAN TWO WORDS AND/OR A NUMBER</span> for each answer.</span></p>
        <h5 className="font-bold ml-25 mt-2">Rental Property Application Form</h5>
        <ul className="list-disc pl-5 space-y-2">
            <p className='ml-8'>
            <span className='font-bold'>Phone number: </span>{' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="1"
                value={answers[1] as string || ''}
                onChange={(e) => handleAnswerChange(1, e.target.value)}
            />{' '} (mobile)
            </p>
            <p className='ml-8'>
            <span className='font-bold'>Email address: </span>Susansmith@ {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="2"
                value={answers[2] as string || ''}
                onChange={(e) => handleAnswerChange(2, e.target.value)}
            />{' '}
            </p>
            <p className="ml-8"><span className="font-bold">Current address: </span>234 Becketts Road, Brisbane, 4054</p>
            <p className="ml-8"><span className="font-bold"> New Zealand Employer: </span> Auckland Hospital</p>
            <p className='ml-8'>
            <span className='font-bold'>Occupation: </span>a {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="3"
                value={answers[3] as string || ''}
                onChange={(e) => handleAnswerChange(3, e.target.value)}
            />{' '}
            </p>
            <p className="ml-8"><span className="font-bold"> Rental start date: </span> 8th February</p>
            <p className="ml-8 font-bold">Preferred property type:</p>
            <li className='ml-18'>
            First preference: a house with a {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="4"
                value={answers[4] as string || ''}
                onChange={(e) => handleAnswerChange(4, e.target.value)}
            />.
            </li>
            <li className='ml-18'>
            Second preference: an apartment with a big {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="5"
                value={answers[5] as string || ''}
                onChange={(e) => handleAnswerChange(5, e.target.value)}
            />.
            </li>
            <p className="ml-8"><span className="font-bold"> Bedrooms: </span> two</p>
            <p className='ml-8'>
            <span className='font-bold'>Furnishings: </span>a {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="6"
                value={answers[6] as string || ''}
                onChange={(e) => handleAnswerChange(6, e.target.value)}
            />{' '} is required
            </p>
            <p className='ml-8'>
            <span className='font-bold'>Maximum rent: </span>a {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="7"
                value={answers[7] as string || ''}
                onChange={(e) => handleAnswerChange(7, e.target.value)}
            />{' '} $ per week
            </p>
            <p className='ml-8'>
            <span className='font-bold'>Preferred location: </span>near the {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="8"
                value={answers[8] as string || ''}
                onChange={(e) => handleAnswerChange(8, e.target.value)}
            />{' '} 
            </p>
            <p className="ml-8 font-bold">Other requirements:</p>
            <li className='ml-18'>
            Must have {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="9"
                value={answers[9] as string || ''}
                onChange={(e) => handleAnswerChange(9, e.target.value)}
            /> nearby.
            </li>
            <li className='ml-18'>
            Would like  {' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="10"
                value={answers[10] as string || ''}
                onChange={(e) => handleAnswerChange(10, e.target.value)}
            />included in the rent.
            </li>
        </ul>
        </section>

        {/* SECTION 2: Questions 11–20 */}
        <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
        <h2 className="font-semibold">SECTION 2. QUESTIONS 11-20</h2>
        <h4 className="font-semibold mt-3">Questions 11–14</h4>
        <p>Choose the correct letter, A, B, or C.</p>
        <p className="text-lg font-semibold mt-2 ml-15">Bridge to Brisbane Fun Run</p>
        {[
            {
                qnum: 11,
                text: 'On the day of the race the speaker recommends parking',
                options: [
                    'A. in the sports ground.',
                    'B. by the river.',
                    'C. in the shopping centre.'
                ]
            },
            {
                qnum: 12,
                text: 'The timing Chip should be attached to',
                options: [
                    'A. the shirt or singlet.',
                    'B. a shoe.',
                    'C. the wristband'
                ]
            },
            {
                qnum: 13,
                text: 'Which group will run first?',
                options: [
                    'A. yellow',
                    'B. red',
                    'C. purple'
                ]
            },
            {
                qnum: 14,
                text: 'The race organisers still need to find volunteers to help with.',
                options: [
                    'A. giving first aid.',
                    'B. handing out water.',
                    'C. starting the race. '
                ]
            },
        ].map(({ qnum, text, options }) => (
            <div key={qnum} className="space-y-2">
                <p className="font-bold">{qnum}. {text}</p>
                {options.map((option, idx) => (
                    <label key={idx} className="block pl-6 relative cursor-pointer" data-qnum={qnum}>
                        <input
                            type="radio"
                            name={`q${qnum}`}
                            className="absolute left-0 top-0 mt-[2px]"
                            checked={answers[qnum] === option}
                            onChange={() => handleAnswerChange(qnum, option)}
                        />
                        <span 
                            onMouseUp={onMouseUp}
                            className={highlighted.has(qnum) ? 'highlighted bg-yellow-200' : ''}
                        >
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        ))}

        <h4 className="font-semibold mt-6">Questions 15–20</h4>
        <p><strong>Label the map below.</strong><span className="italic"> Write the correct letter, A–I, next to questions 15–20.</span></p>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <ul className="list-none space-y-4 mt-3">
                {([
                    ['15. Stage', 15],
                    ['16. T-shirt Stand', 16],
                    ['17. Bag Collection Area', 17],
                    ['18. Information Centre', 18],
                    ['19. Prize Draw Box', 19],
                    ['20. Water Station', 20]
                    ] as [string, number][]).map(([label, qnum], i) => (
                    <li key={i} className="flex items-center gap-2 ml-8">
                        <span className="min-w-[210px] items-center">{label}</span>
                        <input
                            type="text"
                            placeholder={`${qnum}`}
                            className="border border-gray-200 rounded-full py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                            value={answers[qnum] as string || ''}
                            onChange={(e) => handleAnswerChange(qnum, e.target.value.toUpperCase())}
                        />
                    </li>
                ))}
                </ul>
            </div>
            <div className="flex-1 -mt-40">
                <Image
                src="/images/Listening_Test2_Q15-20.png"
                alt="Map of Race Village"
                width={1080}
                height={720}
                className="w-full max-w-lg mx-auto"
                />
            </div>
        </div>
        </section>

        {/* SECTION 3: Questions 21–30 */}
        <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
        <h2 className="font-semibold">SECTION 3. QUESTIONS 21-30</h2>
        <h4 className="font-semibold mt-3">Questions 21–26</h4>
        <p>Choose the correct letter, A, B, or C.</p>
        <p className="text-lg font-semibold mt-2 ml-8">Farmers’ attitudes to new developments in agriculture</p>
        {[
            {
                qnum: 21,
                text: 'What does Dr Owen advise Joel to include in the title of his project?',
                options: [
                'A. the location of the farms',
                'B. the number of farmers',
                'C. the types of farming'
                ]
            },
            {
                qnum: 22,
                text: 'Why has Joel decided to do face-to-face interviews?',
                options: [
                'A. to see the farmers’ workplaces',
                'B. to limit the time he spends on the project',
                'C. to get fuller answers'
                ]
            },
            {
                qnum: 23,
                text: 'Joel agrees to investigate how farmers get information on new developments',
                options: [
                'A. by showing them a series of pictures.',
                'B. by asking them open questions.',
                'C. by sending them a checklist in advance.'
                ]
            },
            {
                qnum: 24,
                text: 'Concerning government communication with farmers, the speakers agree that',
                options: [
                'A. much of it is irrelevant.',
                'B. it is often insufficient for farmers’ needs.',
                'C. the wording is sometimes unclear.'
                ]
            },
            {
                qnum: 25,
                text: 'According to Joel’s reading about the cost of making changes, many British farmers',
                options: [
                'A. leave investment decisions to their accountants.',
                'B. have too little time to calculate the costs of new methods.',
                'C. are reluctant to spend money on improvements.'
                ]
            },
            {
                qnum: 26,
                text: 'A survey of Australian sheep farmers found that most of them',
                options: [
                'A. are usually reluctant to make changes.',
                'B. make changes based on limited research.',
                'C. want plenty of evidence before they make changes.'
                ]
            }
        ].map(({ qnum, text, options }) => (
            <div key={qnum} className="space-y-2">
                <p className="font-bold">{qnum}. {text}</p>
                {options.map((option, idx) => (
                    <label key={idx} className="block pl-6 relative cursor-pointer" data-qnum={qnum}>
                        <input
                            type="radio"
                            name={`q${qnum}`}
                            className="absolute left-0 top-0 mt-[2px]"
                            checked={answers[qnum] === option}
                            onChange={() => handleAnswerChange(qnum, option)}
                        />
                        <span 
                            onMouseUp={onMouseUp}
                            className={highlighted.has(qnum) ? 'highlighted bg-yellow-200' : ''}
                        >
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        ))}

        {/* Drag and Drop: Questions 27–30 */}
        <h4 className="font-semibold mt-3">Questions 27–30</h4>
        <p><strong>What opinion is expressed about each of the following books?</strong></p>
        <p className="italic">Choose<span className="text-red-600 font-bold"> FOUR </span>answers from the box and write the correct letter, A–G, next to questions 27–30.</p>
        <div className="max-w-3xl">
        <table className="border-collapse w-full md:w-auto">
            <thead>
            <tr>
                <th className="text-left font-semibold p-2 w-2/3">Opinions</th>
                <th className="text-left font-semibold p-2">Books</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td className="align-top p-2 border-r border-gray-200">
                <ul className="list-none space-y-2 text-justify">
                    {[
                    'A. It’s badly organised.',
                    'B. It’s out of date.',
                    'C. It’s clear.',
                    'D. It’s essential reading.',
                    'E. It’s inaccurate.',
                    'F. It’s well illustrated.',
                    'G. It’s boring.'
                    ].map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx); // A, B, C, ..., G
                    return (
                        <li
                        key={optionLetter}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', optionLetter);
                        }}
                        className="cursor-move px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 hover:bg-amber-300"
                        >
                        {option}
                        </li>
                    );
                    })}
                </ul>
                </td>
                <td className="align-top p-2 bg-white rounded shadow">
                <ul className="space-y-6">
                    {([
                    ['27. Contemporary Farming Manual', 27],
                    ['28. Running a Small Farm', 28],
                    ['29. Agriculture and Economics', 29],
                    ['30. How to Survive in Farming', 30]
                    ] as [string, number][]).map(([label, qnum]) => (
                    <li
                        key={qnum}
                        className="flex justify-between items-center border px-4 py-2 rounded-md"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                        e.preventDefault();
                        const droppedLetter = e.dataTransfer.getData('text/plain');
                        handleAnswerChange(qnum, droppedLetter);
                        }}
                    >
                        <span className="min-w-[250px]">{label}</span>
                        <div    
                        className="rounded-full py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 h-8 border flex items-center justify-center"
                        >
                        {typeof answers[qnum] === 'string' && answers[qnum] ? (
                            <span className="text-black">{answers[qnum]}</span>
                        ) : (
                            <span className="text-gray-500">{qnum}</span>
                        )}
                        </div>
                    </li>
                    ))}
                </ul>
                </td>
            </tr>
            </tbody>
        </table>
        </div>
        </section>

        {/* SECTION 4: Questions 31–40 */}
        <section className="bg-white p-4 rounded shadow space-y-2" onMouseUp={onMouseUp}>
        <h2 className="font-semibold">SECTION 4. QUESTIONS 31-40</h2>
        <h4 className="font-semibold mt-3">Questions 31–40</h4>
        <p>Complete the notes below. <span className= "font-bold italic" >Write <span className="font-bold text-red-600">ONE WORD ONLY</span> for each answer.</span></p> 

        <h4 className="font-semibold mt-2 ml-40">Bislama - The Pidgin English Language of Vanuatu</h4>
        <p className="font-bold">Languages in Vanuatu.</p>

            <h5 className="font-bold">Local languages</h5>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">Actively spoken language:<span className="font-bold"> 81</span></li>
            <li className="ml-8">Declining languages: <span className="font-bold"> 17</span></li>
            <li className="ml-8">
                {' '}
                <input
                type="text"
                placeholder="31"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[31] as string || ''}
                onChange={(e) => handleAnswerChange(31, e.target.value)}
                />{' '}
                languages: 8
            </li>
            <li className="ml-8">Total: <span className="font-bold">106</span></li>
            </ul>

            <h5 className="font-bold mt-2">Foreign languages</h5>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">
                English is used in the {' '}
                <input
                type="text"
                placeholder="32"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[32] as string || ''}
                onChange={(e) => handleAnswerChange(32, e.target.value)}
                />{' '}
                system
            </li>
            </ul>

            <h5 className="font-bold mt-2">Bislama</h5>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">It is spoken by 90% of the population today.</li>
            <li className="ml-8">
                In the past this language was described as {' '}
                <input
                type="text"
                placeholder="33"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[33] as string || ''}
                onChange={(e) => handleAnswerChange(33, e.target.value)}
                />
            </li>
            </ul>

            <h5 className="font-bold mt-2">History of Bislama</h5>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">Around <span className="font-bold">1800</span>, it was used as a common language on many ships.</li>
            <li className="ml-8">
                After <span className="font-bold">1860</span>, Vanuatu people worked in Australian {' '}
                <input
                type="text"
                placeholder="34"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[34] as string || ''}
                onChange={(e) => handleAnswerChange(34, e.target.value)}
                />
            </li>
            <li className="ml-8">
                After <span className="font-bold">1950</span>, people moved to the {' '}
                <input
                type="text"
                placeholder="35"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[35] as string || ''}
                onChange={(e) => handleAnswerChange(35, e.target.value)}
                />
            </li>
            </ul>

            <h5 className="font-bold mt-2">Description of Bislama</h5>
            <h6 className="font-bold mt-2">General</h6>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">
                Bislama should be called a {' '}
                <input
                type="text"
                placeholder="36"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[36] as string || ''}
                onChange={(e) => handleAnswerChange(36, e.target.value)}
                />{' '}
                pidgin.
            </li>
            </ul>

            <h6 className="font-bold mt-2">Vocabulary</h6>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">Most words come from English.</li>
            <li className="ml-8">
                Words such as “from” may have more {' '}
                <input
                type="text"
                placeholder="37"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[37] as string || ''}
                onChange={(e) => handleAnswerChange(37, e.target.value)}
                />{' '}
                in Bislama.
            </li>
            <li className="ml-8">
                Less than <span className="font-bold">10%</span> of words are of {' '}
                <input
                type="text"
                placeholder="38"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[38] as string || ''}
                onChange={(e) => handleAnswerChange(38, e.target.value)}
                />{' '}
                origin.
            </li>
            <li className="ml-8">
                Pacific words describe the natural world and also local {' '}
                <input
                type="text"
                placeholder="39"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[39] as string || ''}
                onChange={(e) => handleAnswerChange(39, e.target.value)}
                />
            </li>
            </ul>

            <h6 className="font-bold mt-2">Grammar</h6>
            <ul className="list-disc pl-5 space-y-1">
            <li className="ml-8">It is based on Vanuatu languages.</li>
            <li className="ml-8">
                The word “long” acts as an important {' '}
                <input
                type="text"
                placeholder="40"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={answers[40] as string || ''}
                onChange={(e) => handleAnswerChange(40, e.target.value)}
                />{' '}
                in Bislama.
            </li>
            </ul>
        </section>
        </div>

        {/* Sticky Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full bg-orange-50 border-t z-40 py-2 shadow overflow-x-auto">
        <div className="flex flex-nowrap gap-1 justify-center px-2 min-w-max">
            {Array.from({ length: 40 }, (_, i) => i + 1).map((qnum) => {
            const answerData = answers[qnum];
            const isAnswered = answerData && typeof answerData === 'string' && answerData.length > 0;

            return (
                <button
                key={qnum}
                onClick={() => {
                    const el = document.querySelector(`[data-qnum='${qnum}']`) || document.querySelector(`[placeholder='${qnum}']`);
                    if (el instanceof HTMLElement) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (el.tagName.toLowerCase() === 'input') {
                        (el as HTMLInputElement).focus();
                    }
                    } else {
                    console.warn(`Element with data-qnum or placeholder '${qnum}' not found`);
                    }
                }}
                className={`w-7 h-7 border rounded-full text-sm font-medium transition-all duration-150 ${
                    isAnswered ? 'bg-amber-500 text-white' : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-100'
                }`}
                >
                {qnum}
                </button>
            );
            })}
        </div>
        </div>

        {/* Submit Dialog */}
        {showSubmitDialog && (
            <div className="fixed inset-0 bg-amber-100 bg-opacity-80 flex items-center justify-center z-40">
                <div className="bg-white p-8 rounded-md shadow-md w-96 space-y-4">
                    <h2 className="text-xl font-semibold text-center text-orange-500">Submit Your Test</h2>
            
                    <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="student-name">
                        Full Name
                        </label>
                        <input
                        id="student-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full border p-2 rounded mt-1"
                        aria-required="true"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="test-datetime">
                        Test Date & Time
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimeField
                            format="DD-MM-YYYY HH:mm"
                            value={studentDatetime ? dayjs(studentDatetime, 'DD-MM-YYYY HH:mm') : null}
                            onChange={(newValue) => {
                            if (newValue && newValue.isValid()) {
                                setStudentDatetime(newValue.format('DD-MM-YYYY HH:mm'));
                            }
                            }}
                            className="w-full"
                            slotProps={{
                            textField: {
                                id: 'test-datetime',
                                'aria-required': 'true',
                            },
                            }}
                        />
                        </LocalizationProvider>
                    </div>
                    </div>
            
                    <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setShowSubmitDialog(false)}
                        disabled={timeLeft <= 0} // Disable cancel when time is up
                        aria-label="Cancel submission"
                        className={timeLeft <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleFinalSubmit}
                        disabled={submittingTest}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        aria-label="Submit test"
                    >
                        {submittingTest ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit'}
                    </Button>
                    </div>
                </div>
                </div>
            )}
        </div>
    )
}