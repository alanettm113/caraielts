
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
    SquarePen, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField'
import dayjs from 'dayjs';
import jsPDF from 'jspdf'

// Correct Answers
const correctAnswers = [
    "golf course", "blue", "12:40", "breakfast", "swimming", "piano", "Spanish", "Wednesday", "10:15", "science",
    ["A", "E"], ["A", "E"], ["A", "C"], ["A", "C"], "I", "B", "F", "C", "E", "D",
    ["C", "D"], ["C", "D"], ["A", "E"], ["A", "E"], "D", "C", "G", "A", "F", "E",
    "written", "lifestyle", "technology", "storm", "film", "research", "gun", "map", "gold", "coins"
]

export default function ListeningTest1Page() {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    
    const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
    const [volume, setVolume] = useState(1)
    const [highlighted, setHighlighted] = useState<Set<number>>(new Set()) // Track highlighted questions

    const [testData, setTestData] = useState<TestData | null>(null)
    const [muted, setMuted] = useState(false)
    const [started, setStarted] = useState(false)

    const [showStartDialog, setShowStartDialog] = useState(true)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)

    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')
    const [submittingTest, setSubmittingTest] = useState(false)

    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [finalTime, setFinalTime] = useState<number | null>(null)

    const [audioDuration, setAudioDuration] = useState<number | null>(null)
    const [audioError, setAudioError] = useState<string | null>(null)

    const [showStartPrompt, setShowStartPrompt] = useState(true)

    const [selRect, setSelRect] = useState<{ top: number; left: number } | null>(null)
    const [highlightColor, setHighlightColor] = useState<string>('')

    const handleAnswerChange = (qnum: number, val: string | string[]) => {
        if ([11, 12, 13, 14, 21, 22, 23, 24].includes(qnum) && Array.isArray(val) && val.length > 2) {
            alert('Please select exactly two options.');
            return;
        }
        setAnswers(prev => ({ ...prev, [qnum]: val }));
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
        // Simulate loading test data (replace with actual data source)
        const initialTestData: TestData = {
            title: "IELTS Listening Test 1",
            questions: Array.from({ length: 40 }, (_, i) => ({
                number: i + 1,
                answer: "", // Default empty answer
            })),
        };
        setTestData(initialTestData);
    }, []);

    useEffect(() => {
        if (started && audioRef.current) {
            audioRef.current.play().catch(console.error)
        }
    }, [started])

    // Handle play
    const handlePlay = () => {
        if (audioRef.current) {
            const raw = Math.floor(audioRef.current.duration)
            const duration = Math.max(raw + 120, 1500) // Audio duration + 2 minutes
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
                const raw = Math.floor(audioRef.current!.duration)
                const final = Math.max(raw + 120, 1500) // Audio duration + 2 minutes
                setAudioDuration(final)
                setTimeLeft(final)
                setFinalTime(final)
            }
        }
    }, [audioRef])

    // Auto countdown + auto submit
    useEffect(() => {
        if (!started || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setShowSubmitDialog(true); // Open dialog at 0
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, timeLeft]);

    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = (sec % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Lock Scroll When Blurred
    useEffect(() => {
        document.body.style.overflow = started ? 'auto' : 'hidden'
    }, [started])

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

            const testNumber = testData?.title?.split(' ').pop() || '1';
            const testTitle = `IELTS LISTENING TEST ${testNumber}`;

            // Header
            doc.setFontSize(14);
            doc.text(testTitle, 210, y, { align: 'center' });
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

                // Handle multiple-choice questions
                if (Array.isArray(userAns)) {
                    userAns = userAns.sort().join(', ');
                } else {
                    userAns = String(userAns || '').replace(/^!['’]?\s*/, '').trim();
                }

                if (Array.isArray(correctAns)) {
                    correctAns = correctAns.sort().join(', ');
                } else {
                    correctAns = String(correctAns || '').trim();
                }

                // Compare answers (case-insensitive)
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

            doc.text(`Score Summary:`, margin, y); y += 20;
            doc.text(`Correct Answers: ${correctCount}`, margin, y); y += 16;
            doc.text(`Band Score: ${band.toFixed(1)}`, margin, y); y += 30;

            // Render answers
            sortedQs.forEach((q) => {
                const rawAnswer = answers[q.number] ?? '[No Answer]';
                const clean = (txt: string) => txt.replace(/^!['’]?\s*/g, '').trim();
                const formattedAnswer = Array.isArray(rawAnswer)
                    ? rawAnswer.map(a => clean(a)).join(', ')
                    : clean(String(rawAnswer));
                const line = `${q.number}. ${formattedAnswer}`;
                const wrappedLines = doc.splitTextToSize(line, maxWidth);
                if (y + wrappedLines.length * 16 > 780) {
                    doc.addPage();
                    y = 40;
                }
                doc.text(wrappedLines, margin, y);
                y += wrappedLines.length * 16 + 6;
            });

            // Watermark on every page
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setTextColor(200);
                doc.setFontSize(60);
                //doc.text('MS CARA IELTS', 300, 500, {
                    //angle: -30,
                    //align: 'center',
                //});
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

    // Highlight event for full page
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

        // Check if the selection starts or ends within an input element
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
                <audio ref={audioRef} src="/audio/listening-test-1.mp3" preload="auto" hidden />
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

            {/* 4 part / 40 question JSX code */}
            <div className="overflow-y-auto pt-12 p-4 pb-10" onMouseUp={onMouseUp}>
                {/* PART 1: Questions 1–10 */}
                <section className="bg-white p-4 rounded shadow space-y-1 mt-2 text-[15px]" onMouseUp={onMouseUp}>
                    <h3 className="text-lg font-semibold">Questions 1–10</h3>
                    <p>Complete the notes below.</p>
                    <p className="font-bold">
                        Write <span className="text-red-600">NO MORE THAN TWO WORDS AND/OR A NUMBER</span> for each answer.
                    </p>

                    <h4 className="font-semibold mt-3">The International School, Dubai</h4>
                    <h5 className="font-medium">General Information and facilities</h5>
                    <p className="ml-4">● Two departments: Lower school, Middle school</p>
                    <ol className="list-decimal list-inside space-y-1 mt-1 text-[15px] ml-4">
                        {[
                            ['● Location of school opposite the', 1],
                            ['● Uniform: a', 2, 'shirt, black trousers or shorts'],
                            ['● Lessons from 7.20 until', 3, ', Sunday - Thursday'],
                            ['● Children on Early Start programme are given', 4, 'before school starts'],
                            ['● Late Stay activities: playtime, help with homework, current term\'s spoil activity is', 5],
                            ['● Music:', 6, 'lessons held on Tuesdays'],
                            ['● Languages:', 7, 'from age 7'],
                        ].map((line, idx) => (
                            <li key={idx} className="flex flex-wrap gap-1 items-center">
                                {line.map((item, j) =>
                                    typeof item === 'number' ? (
                                        <input
                                            key={j}
                                            type="text"
                                            className="border border-gray-400 rounded-full px-3 py-[1px] w-28 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            placeholder={`${item}`}
                                            value={typeof answers[item] === 'string' ? answers[item] : ''}
                                            onChange={(e) => handleAnswerChange(item, e.target.value)}
                                        />
                                    ) : (
                                        <span key={j}>{item}</span>
                                    )
                                )}
                            </li>
                        ))}
                    </ol>

                    <h5 className="font-medium mt-3">Meeting with Head Teacher</h5>
                    <ol className="list-decimal list-inside space-y-1 mt-1 text-[15px] ml-4" start={8}>
                        {[
                            ['● Name of Head Teacher: Elizabeth Rose Day', 8],
                            ['● Time:', 9],
                            ['● Can talk to the', 10, 'teacher in coffee break'],
                        ].map((line, idx) => (
                            <li key={idx} className="flex flex-wrap gap-2 items-center">
                                {line.map((item, j) =>
                                    typeof item === 'number' ? (
                                        <input
                                            key={j}
                                            type="text"
                                            className="border border-gray-400 rounded-full px-3 py-[1px] w-28 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            placeholder={`${item}`}
                                            value={typeof answers[item] === 'string' ? answers[item] : ''}
                                            onChange={(e) => handleAnswerChange(item, e.target.value)}
                                        />
                                    ) : (
                                        <span key={j}>{item}</span>
                                    )
                                )}
                            </li>
                        ))}
                    </ol>
                </section>

                {/* PART 2: Questions 11–14 */}
                <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
                    {/* 11–12 */}
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Questions 11–12</h3>
                        <p className="font-bold">
                            Choose <span className="text-red-600">TWO</span> letters, A–E.
                        </p>
                        <p>Which TWO things will employees need to do during their first week in their new office space?</p>
                        {[
                            'A. find out about safety procedures',
                            'B. collect a new form of identification',
                            'C. move boxes containing documents',
                            'D. make a note of any problem that occurs',
                            'E. learn about new company technology',
                        ].map((option, idx) => {
                            const qnum = 11 + (idx % 2);
                            const prev = Array.isArray(answers[qnum]) ? answers[qnum] : [];
                            return (
                                <label
                                    key={idx}
                                    className="block pl-6 relative cursor-pointer select-none"
                                    data-qnum={qnum}
                                >
                                    <input
                                        type="checkbox"
                                        className="absolute left-0 top-0 mt-[2px]"
                                        checked={prev.includes(option)}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...prev, option]
                                                : prev.filter((val) => val !== option);
                                            handleAnswerChange(qnum, next);
                                            if (next.length === 0) {
                                                const updated = { ...answers };
                                                delete updated[qnum];
                                                setAnswers(updated);
                                            }
                                        }}
                                    />
                                    <span className={highlighted.has(qnum) ? 'highlighted bg-yellow-200' : ''}>{option}</span>
                                </label>
                            );
                        })}
                    </div>

                    {/* 13–14 */}
                    <div className="space-y-1 pt-4">
                        <h3 className="text-lg font-semibold">Questions 13–14</h3>
                        <p className="font-bold">Choose <span className="text-red-600">TWO</span> letters, A–E.</p>
                        <p>Which TWO steps have the company taken to improve the physical environment of employees' offices?</p>
                        {[
                            'A. provided comfortable seating',
                            'B. installed a new heating system',
                            'C. used attractive materials',
                            'D. enlarged people’s working space',
                            'E. replaced the old type of lights',
                        ].map((option, idx) => {
                            const qnum = 13 + (idx % 2);
                            const prev = Array.isArray(answers[qnum]) ? answers[qnum] : [];
                            return (
                                <label
                                    key={idx}
                                    className="block pl-6 relative cursor-pointer select-none"
                                    data-qnum={qnum}
                                >
                                    <input
                                        type="checkbox"
                                        className="absolute left-0 top-0 mt-[2px]"
                                        checked={prev.includes(option)}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...prev, option]
                                                : prev.filter((val) => val !== option);
                                            handleAnswerChange(qnum, next);
                                            if (next.length === 0) {
                                                const updated = { ...answers };
                                                delete updated[qnum];
                                                setAnswers(updated);
                                            }
                                        }}
                                    />
                                    <span className={highlighted.has(qnum) ? 'highlighted bg-yellow-200' : ''}>{option}</span>
                                </label>
                            );
                        })}
                    </div>
                </section>

                {/* Questions 15–20 - Label the image */}
                <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
                    <h3 className="text-lg font-semibold">Questions 15–20</h3>
                    <p className="font-bold">
                        Label the plan below. Write the correct letter, A–I, next to Questions 15–20.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            {[
                                '15. Conference center',
                                '16. New office space',
                                '17. Stores',
                                '18. Finance',
                                '19. Café',
                                '20. IT Department'
                            ].map((label, idx) => {
                                const qnum = 15 + idx
                                return (
                                    <div key={qnum} className="flex items-center gap-2">
                                        <label className="w-42 font-medium">{label}</label>
                                        <input
                                            type="text"
                                            placeholder={`${qnum}`}
                                            className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            value={typeof answers[qnum] === 'string' ? answers[qnum] : ''}
                                            onChange={(e) => handleAnswerChange(qnum, e.target.value.toUpperCase())}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center items-start mt-[-50px]">
                            <img
                                src="/images/map.png"
                                alt="Factory Plan"
                                className="w-full max-w-[800px] h-auto border shadow"
                            />
                        </div>
                    </div>
                </section>

                {/* PART 3: Questions 21–30 */}
                <section className="bg-white p-4 rounded shadow space-y-1 mt-2" onMouseUp={onMouseUp}>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Questions 21–22</h3>
                        <p className="font-bold">Choose <span className="text-red-600">TWO</span> letters, A–E.</p>
                        <p>Which are the <span className='italic font-bold'>TWO main duties for Personal Support Workers (PSWs)?</span></p>
                        {[
                            'A. talking with clients',
                            'B. helping clients to eat and drink',
                            'C. helping with physical needs',
                            'D. ensuring clients are well and safe',
                            'E. managing clients’ pills'
                        ].map((option, idx) => {
                            const qnum = 21 + (idx % 2)
                            const prev = Array.isArray(answers[qnum]) ? answers[qnum] : []
                            return (
                                <label
                                    key={idx}
                                    className="block pl-6 relative cursor-pointer select-none"
                                    data-qnum={qnum}
                                >
                                    <input
                                        type="checkbox"
                                        className="absolute left-0 top-0 mt-[2px]"
                                        checked={prev.includes(option)}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...prev, option]
                                                : prev.filter((val) => val !== option)
                                            handleAnswerChange(qnum, next)
                                            if (next.length === 0) {
                                                const updated = { ...answers }
                                                delete updated[qnum]
                                                setAnswers(updated)
                                            }
                                        }}
                                    />
                                    {option}
                                </label>
                            )
                        })}
                    </div>

                    <div className="space-y-2 pt-2">
                        <h3 className="text-lg font-semibold">Questions 23–24</h3>
                        <p className="font-bold">Choose <span className="text-red-600">TWO</span> letters, A–E.</p>
                        <p>Which are the <span className='italic font-bold'>TWO requirements to do the PSW programme?</span></p>
                        {[
                            'A. high school completion',
                            'B. a maths course',
                            'C. a language qualification',
                            'D. a clear driving record',
                            'E. First Aid training '
                        ].map((option, idx) => {
                            const qnum = 23 + (idx % 2)
                            const prev = Array.isArray(answers[qnum]) ? answers[qnum] : []
                            return (
                                <label
                                    key={idx}
                                    className="block pl-6 relative cursor-pointer select-none"
                                    data-qnum={qnum}
                                >
                                    <input
                                        type="checkbox"
                                        className="absolute left-0 top-0 mt-[2px]"
                                        checked={prev.includes(option)}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...prev, option]
                                                : prev.filter((val) => val !== option)
                                            handleAnswerChange(qnum, next)
                                            if (next.length === 0) {
                                                const updated = { ...answers }
                                                delete updated[qnum]
                                                setAnswers(updated)
                                            }
                                        }}
                                    />
                                    {option}
                                </label>
                            )
                        })}
                    </div>
                </section>

                {/* Questions 25–30 - Drag & Drop */}
                <section className="bg-white p-4 rounded shadow space-y-1" onMouseUp={onMouseUp}>
                    <h3 className="text-lg font-semibold">Questions 25–30</h3>
                    <p>
                        <strong>What <span className="font-bold text-2xl">topic</span> do students learn about in each of the following courses?</strong>
                    </p>
                    <p>
                        Choose SIX answers from the box and write the correct letter, A–G, next to questions 25–30.
                    </p>
                    <div className="flex">
                        <div className="grid grid-cols-[1fr_auto] gap-x-30 border rounded p-4">
                            <div>
                                <p className="font-semibold mb-2">Topics:</p>
                                <ul className="list-none space-y-3">
                                    {[
                                        'A) independent living',
                                        'B) the ageing process stages',
                                        'C) PSWs’ role in health care',
                                        'D) workplace communication',
                                        'E) memory stimulation activities',
                                        'F) handling stress',
                                        'G) biological systems'
                                    ].map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="font-semibold mb-2">Courses:</p>
                                <ul className="list-none space-y-2">
                                    {[
                                        ['25. Understanding is Essential', 25],
                                        ['26. Foundations', 26],
                                        ['27. The Way We Work', 27],
                                        ['28. Residence Care', 28],
                                        ['29. Dynamics', 29],
                                        ['30. The Power Within', 30],
                                    ].map(([label, qnum], i) => (
                                        <li key={i} className="flex items-center justify-between gap-2 whitespace-nowrap">
                                            <span className="min-w-[210px]">{label}</span>
                                            <input
                                                type="text"
                                                placeholder={`${qnum}`}
                                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                value={typeof answers[qnum as number] === 'string' ? answers[qnum as number] : ''}
                                                onChange={(e) => handleAnswerChange(qnum as number, e.target.value.toUpperCase())}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PART 4: Questions 31–40 */}
                <section className="bg-white p-4 rounded shadow space-y-2" onMouseUp={onMouseUp}>
                    <h3 className="text-lg font-semibold">Questions 31–40</h3>
                    <p>Complete the notes below.</p>
                    <p className="font-bold">
                        Write <span className="text-red-600">ONE WORD ONLY</span> for each answer.
                    </p>

                    <h4 className="font-semibold mt-2">Underwater Archaeological Sites</h4>
                    <h5 className="font-medium">General Information</h5>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            The Maoris are an example of a society that never developed a{' '}
                            <input
                                type="text"
                                placeholder="31"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[31] || ''}
                                onChange={(e) => handleAnswerChange(31, e.target.value)}
                            />{' '}
                            form of communication.
                        </li>
                        <li>
                            Discoveries at underwater sites have helped scholars better understand the everyday{' '}
                            <input
                                type="text"
                                placeholder="32"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[32] || ''}
                                onChange={(e) => handleAnswerChange(32, e.target.value)}
                            />{' '}
                            of ancient communities.
                        </li>
                    </ul>

                    <h5 className="font-medium mt-2">Shipwrecks</h5>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            In recent excavations, experts have applied advanced{' '}
                            <input
                                type="text"
                                placeholder="33"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[33] || ''}
                                onChange={(e) => handleAnswerChange(33, e.target.value)}
                            />{' '}
                            to improve the accuracy of findings.
                        </li>
                        <li>
                            One commonly identified cause of many wrecks is damage caused by a violent{' '}
                            <input
                                type="text"
                                placeholder="34"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[34] || ''}
                                onChange={(e) => handleAnswerChange(34, e.target.value)}
                            />.
                        </li>
                    </ul>

                    <h5 className="font-medium mt-2">Learn from it:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            Some findings have been used to produce a{' '}
                            <input
                                type="text"
                                placeholder="35"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[35] || ''}
                                onChange={(e) => handleAnswerChange(35, e.target.value)}
                            />{' '}
                            gallery to showcase life on board sunken vessels.
                        </li>
                        <li>
                            Due to difficult access and preservation issues, the amount of{' '}
                            <input
                                type="text"
                                placeholder="36"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[36] || ''}
                                onChange={(e) => handleAnswerChange(36, e.target.value)}
                            />{' '}
                            conducted was quite restricted.
                        </li>
                    </ul>

                    <h5 className="font-medium mt-2">Examples</h5>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            There was one wreck where the crew used a{' '}
                            <input
                                type="text"
                                placeholder="37"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[37] || ''}
                                onChange={(e) => handleAnswerChange(37, e.target.value)}
                            />{' '}
                            as a defense against pirate attacks.
                        </li>
                        <li>
                            Among the materials found was a{' '}
                            <input
                                type="text"
                                placeholder="38"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[38] || ''}
                                onChange={(e) => handleAnswerChange(38, e.target.value)}
                            />{' '}
                            that detailed the ship’s intended route.
                        </li>
                        <li>
                            Valuable cargo, especially items like{' '}
                            <input
                                type="text"
                                placeholder="39"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[39] || ''}
                                onChange={(e) => handleAnswerChange(39, e.target.value)}
                            />, was a major motivation for early explorers.
                        </li>
                        <li>
                            Various luxury goods were discovered, including jewellery and old{' '}
                            <input
                                type="text"
                                placeholder="40"
                                className="border border-gray-400 rounded-full px-3 py-[4px] w-27 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={answers[40] || ''}
                                onChange={(e) => handleAnswerChange(40, e.target.value)}
                            />.
                        </li>
                    </ul>
                </section>
            </div>

            {/* Sticky Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full bg-orange-50 border-t z-40 py-2 shadow overflow-x-auto">
                <div className="flex flex-nowrap gap-1 justify-center px-2 min-w-max">
                    {Array.from({ length: 40 }, (_, i) => i + 1)
                        .filter(qnum => ![11, 12, 13, 14, 21, 22, 23, 24].includes(qnum))
                        .map((qnum) => (
                            <button
                                key={qnum}
                                onClick={() => {
                                    const el = document.querySelector(`[placeholder='${qnum}']`);
                                    if (el instanceof HTMLElement) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        el.focus();
                                    } else {
                                        console.warn(`Element with placeholder '${qnum}' not found`);
                                    }
                                }}
                                className={`w-7 h-7 border rounded-full text-sm font-medium transition-all duration-150 ${
                                    answers[qnum] ? 'bg-amber-500 text-white' : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-100'
                                }`}
                            >
                                {qnum}
                            </button>
                        ))}
                </div>
            </div>
        {showSubmitDialog && (
            <div className="fixed inset-0 bg-amber-100 bg-opacity-80 flex items-center justify-center z-40">
            <div className="bg-white p-8 rounded-md shadow-md w-96 space-y-4">
                <h2 className="text-xl font-semibold text-center text-orange-500">Submit Your Test</h2>
                <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                    type="text"
                    placeholder="Enter your full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full border p-2 rounded mt-1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Test Date & Time</label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimeField
                        format="DD-MM-YYYY HH:mm"
                        value={studentDatetime ? dayjs(studentDatetime, 'DD-MM-YYYY HH:mm') : null}
                        onChange={(val) => val && setStudentDatetime(val.format('DD-MM-YYYY HH:mm'))}
                        className="w-full"
                    />
                    </LocalizationProvider>
                </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
                <Button onClick={handleFinalSubmit} disabled={submittingTest} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    {submittingTest ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit'}
                </Button>
                </div>
            </div>
            </div>
        )}
        </div>
    )
}
