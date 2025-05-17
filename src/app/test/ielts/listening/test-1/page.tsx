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
import dayjs from 'dayjs';
import jsPDF from 'jspdf'

// Correct Answers
const correctAnswers = [
    "19", "40 minutes", "Balcony", "Tennis courts", "Fish dishes", "Piano", "Helicopter", "Cretan garden", "Fireworks", "Cable car", // Q1–10
    ["F"], ["D"], ["A"], ["B"], ["C"], ["G"], // Q11–16
    ["B", "C"], ["B", "D"], // Q17–18, Q19–20
    "C", "A", "B", "C", "A", // Q21–25
    ["G"], ["A"], ["D"], ["C"], ["E"], // Q26–30
    "mud", "feathers", "shape", "moon", "neck", "evidence", "destinations", "oceans", "recovery", "atlas" // Q31–40
]

// Mapping for Q17–18 and Q19–20 answer letters to full text
const q17_18Options: Record<string, string> = {
    'A': 'A. lack of time',
    'B': 'B. loss of confidence',
    'C': 'C. too much effort required',
    'D': 'D. high costs',
    'E': 'E. feeling less successful than others'
};

const q17_18Keys: Record<string, string> = {
    'A. lack of time': 'A',
    'B. loss of confidence': 'B',
    'C. too much effort required': 'C',
    'D. high costs': 'D',
    'E. feeling less successful than others': 'E'
};

const q19_20Options: Record<string, string> = {
    'A': 'A. write goals down',
    'B': 'B. have achievable aims',
    'C': 'C. set a time limit',
    'D': 'D. give yourself rewards',
    'E': 'E. challenge yourself'
};

const q19_20Keys: Record<string, string> = {
    'A. write goals down': 'A',
    'B. have achievable aims': 'B',
    'C. set a time limit': 'C',
    'D. give yourself rewards': 'D',
    'E. challenge yourself': 'E'
};

export default function ListeningTest1Page() {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement>(null)
    
    const [answers, setAnswers] = useState<Record<number, string | { options: string[], count: number }>>({})
    const [volume, setVolume] = useState(1)
    const [highlighted, setHighlighted] = useState<Set<number>>(new Set())
    const [testData, setTestData] = useState<TestData | null>(null)
    const [muted, setMuted] = useState(false)
    const [started, setStarted] = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(true)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')
    const [submittingTest, setSubmittingTest] = useState(false)
    const [timeLeft, setTimeLeft] = useState(32 * 60) // 32 minutes
    const [finalTime, setFinalTime] = useState<number | null>(null)
    const [audioDuration, setAudioDuration] = useState<number | null>(null)
    const [audioError, setAudioError] = useState<string | null>(null)
    const [showStartPrompt, setShowStartPrompt] = useState(true)
    const [selRect, setSelRect] = useState<{ top: number; left: number } | null>(null)
    
    // Handle answer changes
    const handleAnswerChange = (qnum: number, val: string | string[]) => {
        const baseQnum = [17, 18].includes(qnum) ? 17 :
                        [19, 20].includes(qnum) ? 19 : qnum;
        
        const isMultiOptionGroup = [17, 19].includes(baseQnum);
        
        if (isMultiOptionGroup) {
            const nextOptions = Array.isArray(val) ? val : [val];
            const nextCount = nextOptions.length;
        
            setAnswers(prev => {
                const updated = {
                    ...prev,
                    [baseQnum]: { options: nextOptions, count: nextCount }
                };
                console.log(`Updated answers for qnum ${qnum} (baseQnum ${baseQnum}):`, updated);
                return updated;
            });
        } else {
        const safeVal: string = Array.isArray(val) ? val.join(', ') : val;
            setAnswers(prev => {
                const updated = {
                    ...prev,
                    [qnum]: safeVal
                };
                console.log(`Updated answers for qnum ${qnum}:`, updated);
                return updated;
            });
        }
    }

    type Question = {
        number: number;
        answer?: string;
        [key: string]: any;
    }

    type TestData = {
        title: string;
        questions: Question[];
    }

    useEffect(() => {
        // Simulate loading test data
        const initialTestData: TestData = {
            title: "IELTS Listening Test 1",
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
            audioRef.current.play().catch(console.error)
        }
    }, [started])
    
    // Timer logic in handlePlay
    const handlePlay = () => {
        if (audioRef.current) {
            const duration = 32 * 60 // 32 minutes (1920 seconds)
            setAudioDuration(duration)
            setTimeLeft(duration)
            setFinalTime(duration)
            audioRef.current.play().catch(console.error)
            setStarted(true)
            setShowStartPrompt(false)
        }
    }

    // Audio duration setup
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onloadedmetadata = () => {
                const final = 32 * 60 // 32 minutes
                setAudioDuration(final)
                setTimeLeft(final)
                setFinalTime(final)
            }
        }
    }, [audioRef])

    const startAudio = () => {
        if (audioRef.current) {
            audioRef.current.muted = true
            audioRef.current.play()
                .then(() => {
                    audioRef.current!.muted = false
                    setAudioError(null)
                })
                .catch(() => {
                    setAudioError('Failed to play audio. Please click the play button below.')
                })
        }
    }

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
                // Add image to the top-right corner (adjust width/height as needed)
                doc.addImage(logoBase64, 'JPEG', 490, 5, 100, 100); // x: 490 (right side), y: 8 (top), width: 100, height: 100
            } catch (error) {
                console.error('Failed to load logo:', error);
            }

            const testNumber = testData?.title?.split(' ').pop() || '1';
            const testTitle = `IELTS LISTENING TEST ${testNumber}`;

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

                if (Array.isArray(userAns)) {
                    userAns = userAns.sort().join(', ');
                } else if (typeof userAns === 'object' && userAns?.options) {
                    userAns = userAns.options.sort().join(', ');
                } else {
                    userAns = String(userAns || '').replace(/^!['’]?\s*/, '').trim();
                }

                // Skip if user answer is empty after trimming
                if (!userAns) return;
    
                if (Array.isArray(correctAns)) {
                    correctAns = correctAns.sort().join(', ');
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

            //doc.text(`Score Summary:`, margin, y); y += 20;
            //doc.text(`Correct Answers: ${correctCount}`, margin, y); y += 16;
            //doc.text(`Band Score: ${band.toFixed(1)}`, margin, y); y += 30;

            // Print answers with special handling for Q17–18 and Q19–20
            for (let i = 0; i < sortedQs.length; i++) {
                const q = sortedQs[i];
                const qnum = q.number;

                // Skip Q18 and Q20 as they will be combined with Q17 and Q19
                if (qnum === 18 || qnum === 20) continue;

                const rawAnswer = answers[qnum] ?? '[No Answer]';
                const clean = (txt: string) => txt.replace(/^!['’]?\s*/g, '').trim();

                let formattedAnswer: string;
                if (qnum === 17 || qnum === 19) {
                    // Combine answers for Q17–18 or Q19–20
                    const options = (typeof rawAnswer === 'object' && rawAnswer?.options)
                        ? rawAnswer.options as Array<keyof typeof q17_18Options>
                        : [];
                    const optionsMap = qnum === 17 ? q17_18Options : q19_20Options;
                    const fullOptions = options.map(opt => optionsMap[opt] || opt).join(', ');
                    formattedAnswer = fullOptions || '[No Answer]';
                    const rangeLabel = qnum === 17 ? '17-18' : '19-20';
                    const line = `${rangeLabel}: ${formattedAnswer}`;
                    const wrappedLines = doc.splitTextToSize(line, maxWidth);
                    if (y + wrappedLines.length * 16 > 780) {
                        doc.addPage();
                        y = 40;
                    }
                    doc.text(wrappedLines, margin, y);
                    y += wrappedLines.length * 16 + 6;
                } else {
                    // Handle other questions as before
                    formattedAnswer = typeof rawAnswer === 'object' && rawAnswer?.options
                        ? rawAnswer.options.map(a => clean(a)).join(', ')
                        : clean(String(rawAnswer));
                    const line = `${qnum}. ${formattedAnswer}`;
                    const wrappedLines = doc.splitTextToSize(line, maxWidth);
                    if (y + wrappedLines.length * 16 > 780) {
                        doc.addPage();
                        y = 40;
                    }
                    doc.text(wrappedLines, margin, y);
                    y += wrappedLines.length * 16 + 6;
                }
            }

            // Watermark on every page
            const pageCount = (doc as any).internal.getNumberOfPages();
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

    const toggleHighlight = (qnum: number) => {
        setHighlighted(prev => {
            const newSet = new Set(prev);
            if (newSet.has(qnum)) {
                newSet.delete(qnum);
            } else {
                newSet.add(qnum);
            }
            return newSet;
        })
    }  

    return (
        <div className="relative w-full h-full" onMouseUp={onMouseUp}>
        {!started && <div className="absolute inset-0 backdrop-blur-sm z-10" />}
        {/* START AUDIO */}
        {started && (
            <audio ref={audioRef} src="/audio/listeningtest_1.mp3" preload="auto" hidden />
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
            <h1 className="text-lg font-bold">IELTS Listening Test 1</h1>
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
        <h5 className="font-bold ml-25">NOTES ON ISLAND HOTEL</h5>
        <ul className="list-disc pl-5 space-y-1">
            <li className='ml-8'><em>Example</em>: Type of room required</li>
            <li className='ml-8'><em>Answer</em>: Double room</li>
            <p className="font-semibold">Time</p>
            <li className='ml-8'>The length of stay: approximately 2 weeks</li>
            <li className='ml-8'>Starting date: 25th April</li>
            <p className="font-semibold">Temperature</p>
            <li className='ml-8'>
            Up to{' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="1"
                value={answers[1] as string || ''}
                onChange={(e) => handleAnswerChange(1, e.target.value)}
            />{' '}C.
            </li>
            <li className='ml-8'>Erratic weather</li>
            <p className="font-semibold">Transport</p>
            <li className='ml-8'>Pick-up service is provided.</li>
            <li className='ml-8'>
            Normally transfer to the airport takes about{' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="2"
                value={answers[2] as string || ''}
                onChange={(e) => handleAnswerChange(2, e.target.value)}
            />.
            </li>
            <p className="font-semibold">Facilities</p>
            <li className='ml-8'>
            en-suite facilities and a{' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="3"
                value={answers[3] as string || ''}
                onChange={(e) => handleAnswerChange(3, e.target.value)}
            />.
            </li>
            <li className='ml-8'>gym and spa facilities.</li>
            <li className='ml-8'>a large outdoor swimming pool.</li>
            <li className='ml-8'>
            three standard{' '}
            <input
                type="text"
                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="4"
                value={answers[4] as string || ''}
                onChange={(e) => handleAnswerChange(4, e.target.value)}
            />.
            </li>
            
        </ul>

        <h4 className="font-semibold mt-3">Questions 5–10</h4>
        <p>Complete the notes below.<span className="font-bold"> Write <span className="text-red-600">NO MORE THAN TWO WORDS AND/OR A NUMBER</span> for each answer.</span></p>
        <table className="w-full border-collapse border border-gray-200 mt-2">
            <thead>
            <tr className="bg-gray-100">
                <th className="border border-gray-200 p-2">Days</th>
                <th className="border border-gray-200 p-2">Entertainment activities</th>
                <th className="border border-gray-200 p-2">Transportation</th>
            </tr>
            </thead>
            <tbody>
            {[
                {
                day: 'Tuesdays',
                activities: [
                    ['learning to make', 5],
                    ['having a', 6, 'concert']
                ],
                transport: ['mini bus']
                },
                {
                day: 'Wednesdays',
                activities: [
                    ['enjoying mountain view'],
                    ['exploring a tropical', 8]
                ],
                transport: [[7], 'shuttle bus']
                },
                {
                day: 'Thursdays',
                activities: [
                    ['having a fancy dinner'],
                    ['watching a spectacular display of', 9]
                ],
                transport: [[10]]
                }
            ].map((row, idx) => (
                <tr key={idx}>
                <td className="border border-gray-200 p-2"><li>{row.day}</li></td>
                <td className="border border-gray-200 p-2">
                    <ul className="list-disc pl-5 space-y-1">
                    {row.activities.map((activity, i) => (
                        <li key={i} className="flex flex-wrap gap-1 items-center">
                        {activity.map((item, j) =>
                            typeof item === 'number' ? (
                            <input
                                key={j}
                                type="text"
                                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder={`${item}`}
                                value={answers[item] as string || ''}
                                onChange={(e) => handleAnswerChange(item, e.target.value)}
                            />
                            ) : (
                            <span key={j}>{item}</span>
                            )
                        )}
                        </li>
                    ))}
                    </ul>
                </td>
                <td className="border border-gray-200 p-2">
                    <ul className="list-disc pl-5 space-y-1">
                    {row.transport.map((item, i) => (
                        <li key={i} className="flex flex-wrap gap-1 items-center">
                        {Array.isArray(item) ? (
                            item.map((subItem, j) =>
                            typeof subItem === 'number' ? (
                                <input
                                key={j}
                                type="text"
                                className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder={`${subItem}`}
                                value={answers[subItem] as string || ''}
                                onChange={(e) => handleAnswerChange(subItem, e.target.value)}
                                />
                            ) : (
                                <span key={j}>{subItem}</span>
                            )
                            )
                        ) : (
                            <span>{item}</span>
                        )}
                        </li>
                    ))}
                    </ul>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </section>

        {/* SECTION 2: Questions 11–20 */}
        <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
        <h2 className="font-semibold">SECTION 2. QUESTIONS 11-20</h2>
        <h4 className="font-semibold mt-3">Questions 11–16</h4>
        <p>
            <strong>What advantage does the speaker mention for each of the following physical activities?</strong>
        </p>
        <p className ="italic">
            Choose SIX answers from the box and write the correct letter, A–G, next to Questions 11–16.
        </p>
        <div className="flex">
            <div className="grid grid-cols-[2fr_auto] gap-x-10 border rounded p-4">
                <div className="border-r border-gray-200 pr-8">
                    <p className="font-semibold mb-2">Physical activities:</p>
                    <ul className="list-none space-y-2">
                        {([
                            ['11. using a gym', 11],
                            ['12. running', 12],
                            ['13. swimming', 13],
                            ['14. cycling', 14],
                            ['15. doing yoga', 15],
                            ['16. training with a personal trainer', 16]
                        ] as [string, number][]).map(([label, qnum], i) => (
                            <li key={i} className="flex items-center justify-between gap-2 whitespace-nowrap">
                                <span className="min-w-[210px]">{label}</span>
                                <input
                                    type="text"
                                    placeholder={`${qnum}`}
                                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    value={typeof answers[qnum] === 'string' ? answers[qnum] : ''}
                                    onChange={(e) => handleAnswerChange(qnum, e.target.value.toUpperCase())}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="font-semibold mb-2 mr-10">Advantages:</p>
                    <ul className="list-none space-y-3 mr-10">
                        {[
                            'A. not dependent on season',
                            'B. enjoyable',
                            'C. low risk of injury',
                            'D. fitness level unimportant',
                            'E. sociable',
                            'F. fast results',
                            'G. motivating'
                        ].map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <h4 className="font-semibold mt-4">Questions 17–18</h4>
        <p className="font-bold">Choose <span className="text-red-600">TWO</span> letters, A–E.</p>
        <p>For which TWO reasons does the speaker say people give up going to the gym?</p>
        {[
            'A. lack of time',
            'B. loss of confidence',
            'C. too much effort required',
            'D. high costs',
            'E. feeling less successful than others'
        ].map((option, idx) => {
            const baseQnum = 17;
            const answerData = answers[baseQnum];
            const prevOptions = answerData && typeof answerData === 'object' && 'options' in answerData ? answerData.options : [];
            const count = answerData && typeof answerData === 'object' && 'count' in answerData ? answerData.count : 0;
            const optionKey = q17_18Keys[option as keyof typeof q17_18Keys]; // Map full text to key (e.g., "B. loss of confidence" -> "B")
            return  (
                <label
                    key={idx}
                    className="block pl-6 relative cursor-pointer"
                    data-qnum={baseQnum}
                >
                    <input
                        type="checkbox"
                        className="absolute left-0 top-0 mt-[2px]"
                        value={optionKey} // Store the key ("B") instead of the full text
                        checked={prevOptions.includes(optionKey)}
                        onChange={(e) => {
                            const nextOptions = [...prevOptions];
                            let nextCount = count;
                            if (e.target.checked) {
                                if (nextOptions.length < 2) {
                                    nextOptions.push(optionKey);
                                    nextCount++;
                                } else {
                                    alert('Please select exactly two options.');
                                    return;
                                }
                            } else {
                                const index = nextOptions.indexOf(optionKey);
                                if (index !== -1) {
                                    nextOptions.splice(index, 1);
                                    nextCount--;
                                }
                            }
                            if (nextOptions.length > 0) {
                                setAnswers(prevAnswers => ({
                                    ...prevAnswers,
                                    [baseQnum]: { options: nextOptions, count: nextCount }
                                }));
                            } else {
                                setAnswers(prevAnswers => {
                                    const updated = { ...prevAnswers };
                                    delete updated[baseQnum];
                                    return updated;
                                });
                            }
                        }}
                    />
                    <span 
                        onMouseUp={onMouseUp}
                        className={highlighted.has(baseQnum) ? 'highlighted bg-yellow-200' : ''}
                    >
                        {option}
                    </span>
                </label>
            );
        })}

        <h4 className="font-semibold mt-4">Questions 19–20</h4>
        <p className="font-bold">Choose <span className="text-red-600">TWO</span> letters, A–E.</p>
        <p>Which TWO pieces of advice does the speaker give for setting goals?</p>
        {[
            'A. write goals down',
            'B. have achievable aims',
            'C. set a time limit',
            'D. give yourself rewards',
            'E. challenge yourself'
        ].map((option, idx) => {
            const baseQnum = 19;
            const answerData = answers[baseQnum];
            const prevOptions = answerData && typeof answerData === 'object' && 'options' in answerData ? answerData.options : [];
            const count = answerData && typeof answerData === 'object' && 'count' in answerData ? answerData.count : 0;
            const optionKey = q19_20Keys[option as keyof typeof q19_20Keys]; // Map full text to key (e.g., "B. have achievable aims" -> "B")
            return (
                <label
                    key={idx}
                    className="block pl-6 relative cursor-pointer"
                    data-qnum={baseQnum}
                >
                    <input
                        type="checkbox"
                        className="absolute left-0 top-0 mt-[2px]"
                        value={optionKey} // Store the key ("B") instead of the full text
                        checked={prevOptions.includes(optionKey)}
                        onChange={(e) => {
                            const nextOptions = [...prevOptions];
                            let nextCount = count;
                            if (e.target.checked) {
                                if (nextOptions.length < 2) {
                                    nextOptions.push(optionKey);
                                    nextCount++;
                                } else {
                                    alert('Please select exactly two options.');
                                    return;
                                }
                            } else {
                                const index = nextOptions.indexOf(optionKey);
                                if (index !== -1) {
                                    nextOptions.splice(index, 1);
                                    nextCount--;
                                }
                            }
                            if (nextOptions.length > 0) {
                                setAnswers(prevAnswers => ({
                                    ...prevAnswers,
                                    [baseQnum]: { options: nextOptions, count: nextCount }
                                }));
                            } else {
                                setAnswers(prevAnswers => {
                                    const updated = { ...prevAnswers };
                                    delete updated[baseQnum];
                                    return updated;
                                });
                            }
                        }}
                    />
                    <span 
                        onMouseUp={onMouseUp}
                        className={highlighted.has(baseQnum) ? 'highlighted bg-yellow-200' : ''}
                    >
                        {option}
                    </span>
                </label>
            );
        })}
        </section>

        {/* SECTION 3: Questions 21–30 */}
        <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
        <h2 className="font-semibold">SECTION 3. QUESTIONS 21-30</h2>
        <h4 className="font-semibold mt-3">Questions 21–25</h4>
        <p>Choose the correct letter, A, B, or C.</p>
        <p className="text-lg font-semibold mt-2">Food Waste</p>
        {[
            {
                qnum: 21,
                text: 'What point does Robert make about the 2013 study in Britain?',
                options: [
                    'A. It focused more on packaging than wasted food.',
                    'B. It proved that households produced more waste than restaurants.',
                    'C. It included liquid waste as well as solid waste.'
                ]
            },
            {
                qnum: 22,
                text: 'The speakers agree that food waste reports should emphasise the connection between carbon dioxide emissions and',
                options: [
                    'A. food production.',
                    'B. transport of food to landfill sites.',
                    'C. distribution of food products.'
                ]
            },
            {
                qnum: 23,
                text: 'Television programmes now tend to focus on',
                options: [
                    'A. the nutritional value of food products.',
                    'B. the origin of food products.',
                    'C. the chemicals found in food products.'
                ]
            },
            {
                qnum: 24,
                text: 'For Anna, the most significant point about food waste is',
                options: [
                    'A. the moral aspect.',
                    'B. the environmental impact.',
                    'C. the economic effect.'
                ]
            },
            {
                qnum: 25,
                text: 'Anna and Robert decide to begin their presentation by',
                options: [
                    'A. handing out a questionnaire.',
                    'B. providing statistical evidence.',
                    'C. showing images of wasted food.'
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

        <h3 className="text-lg font-semibold mt-4">Questions 26–30</h3>
        <p>
            <strong>What advantage do the speakers identify for each of the following projects?</strong>
        </p>
        <p>
            Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.
        </p>
        <div className="flex">
            <div className="grid grid-cols-[1fr_auto] gap-x-20 border rounded p-4">
                <div className='border-r border-gray-200 pr-10'>
                <p className="font-semibold mb-2">Advantages</p>
                    <ul className="list-none space-y-2">
                        {([
                            'A. it should save time',
                            'B. it will create new jobs',
                            'C. it will benefit local communities',
                            'D. it will make money',
                            'E. it will encourage personal responsibility',
                            'F. it will be easy to advertise',
                            'G. it will involve very little cost'
                        ] as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="font-semibold mb-2">Projects</p>
                    <ul className="list-none space-y-4">
                        {([
                            ['26. edible patch', 26],
                            ['27. ripeness centre', 27],
                            ['28. waste tracking technology', 28],
                            ['29. smartphone application', 29],
                            ['30. food waste composting', 30]
                        ] as [string, number][]).map(([label, qnum], i) => (
                            <li key={i} className="flex items-center justify-between gap-2 whitespace-nowrap">
                                <span className="min-w-[210px]">{label}</span>
                                <input
                                    type="text"
                                    placeholder={`${qnum}`}
                                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    value={typeof answers[qnum] === 'string' ? answers[qnum] : ''}
                                    onChange={(e) => handleAnswerChange(qnum, e.target.value.toUpperCase())}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        </section>

        {/* SECTION 4: Questions 31–40 */}
        <section className="bg-white p-4 rounded shadow space-y-2" onMouseUp={onMouseUp}>
        <h3 className="text-lg font-semibold">Questions 31–40</h3>
        <p>Complete the notes below. <span className= "font-bold italic" >Write <span className="font-bold text-red-600">ONE WORD ONLY</span> for each answer.</span></p> 

        <h4 className="font-semibold mt-2 ml-40">Bird Migration Theory</h4>
        <p>Most birds are believed to migrate seasonally.</p>

        <h5 className="font-bold">Hibernation theory</h5>
        <ul className="list-disc pl-5 space-y-1">
            <li>
                It was believed that birds hibernated underwater or buried themselves in{' '}
                <input
                    type="text"
                    placeholder="31"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[31] as string || ''}
                    onChange={(e) => handleAnswerChange(31, e.target.value)}
                />.
            </li>
            <li>This theory was later disproved by experiments on caged birds.</li>
        </ul>

        <h5 className="font-bold mt-2">Transmutation theory</h5>
        <ul className="list-disc pl-5 space-y-1">
            <li>Aristotle believed birds changed from one species into another in summer and winter.</li>
            <li>
                In autumn he observed that redstarts experience the loss of{' '}
                <input
                    type="text"
                    placeholder="32"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[32] as string || ''}
                    onChange={(e) => handleAnswerChange(32, e.target.value)}
                />{' '}and thought they then turned into robins.
            </li>
            <li>
                Aristotle’s assumptions were logical because the two species of birds had a similar{' '}
                <input
                    type="text"
                    placeholder="33"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[33] as string || ''}
                    onChange={(e) => handleAnswerChange(33, e.target.value)}
                />.
            </li>
        </ul>

        <h5 className="font-bold mt-2">17th century</h5>
        <ul className="list-disc pl-5 space-y-1">
            <li>
                Charles Morton popularised the idea that birds fly to the{' '}
                <input
                    type="text"
                    placeholder="34"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[34] as string || ''}
                    onChange={(e) => handleAnswerChange(34, e.target.value)}
                />{' '}in winter.
            </li>
        </ul>

        <h5 className="font-bold mt-2">Scientific developments</h5>
        <ul className="list-disc pl-5 space-y-1">
            <li>
                In 1822, a stork was killed in Germany which had an African spear in its{' '}
                <input
                    type="text"
                    placeholder="35"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[35] as string || ''}
                    onChange={(e) => handleAnswerChange(35, e.target.value)}
                />.
            </li>
            <li>
                previously there had been no{' '}
                <input
                    type="text"
                    placeholder="36"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[36] as string || ''}
                    onChange={(e) => handleAnswerChange(36, e.target.value)}
                />{' '}that storks migrate to Africa
            </li>
            <li>
                Little was known about the{' '}
                <input
                    type="text"
                    placeholder="37"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[37] as string || ''}
                    onChange={(e) => handleAnswerChange(37, e.target.value)}
                />{' '}and journeys of migrating birds until the practice of ringing was established.
            </li>
            <li>
                It was thought large birds carried small birds on some journeys because they were considered incapable of travelling across huge{' '}
                <input
                    type="text"
                    placeholder="38"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[38] as string || ''}
                    onChange={(e) => handleAnswerChange(38, e.target.value)}
                />.
            </li>
            <li>
                Ringing depended on what is called the{' '}
                <input
                    type="text"
                    placeholder="39"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[39] as string || ''}
                    onChange={(e) => handleAnswerChange(39, e.target.value)}
                />{' '}of dead birds.
            </li>
            <li>
                In 1931, the first{' '}
                <input
                    type="text"
                    placeholder="40"
                    className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={answers[40] as string || ''}
                    onChange={(e) => handleAnswerChange(40, e.target.value)}
                />{' '}to show the migration of European birds was printed.
            </li>
        </ul>
        </section>
        </div>

        {/* Sticky Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full bg-orange-50 border-t z-40 py-2 shadow overflow-x-auto">
        <div className="flex flex-nowrap gap-1 justify-center px-2 min-w-max">
            {Array.from({ length: 40 }, (_, i) => i + 1).map((qnum) => {
            const baseQnum = [17, 18].includes(qnum) ? 17 :
                            [19, 20].includes(qnum) ? 19 : qnum;
            const answerData = answers[baseQnum];
            const isMultiOption = [17, 19].includes(baseQnum);
            const isAnswered = isMultiOption
                ? (answerData && typeof answerData === 'object' && 'count' in answerData
                    ? (qnum === 17 || qnum === 19 ? answerData.count >= 1 : answerData.count === 2)
                    : false)
                : (answerData && typeof answerData === 'string' && answerData.length > 0);


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