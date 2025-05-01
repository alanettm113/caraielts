'use client'

import { useEffect, useState, useRef  } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock as ClockIcon, PenLine, Loader2, Expand, SendHorizontal } from 'lucide-react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField'
import dayjs, { Dayjs } from 'dayjs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    type Question = {
    id: string
    number: number
    type: 'TFNG' | 'YNNG' | 'HeadingMatch' | 'MultipleChoice' | 'ShortAnswer' | 'GapFill'
    question_text: string
    options?: string[]
    answer?: string
    passage_no: 1 | 2 | 3
    }

    type TestData = {
    id: string
    title: string
    passage1: string
    passage2: string
    passage3: string
    questions: Question[]
    }

export default function ReadingTestPage() {
    const router = useRouter()
    const { id }  = useParams()

    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [testData, setTestData] = useState<TestData | null>(null)
    const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({})
    const [timeLeft, setTimeLeft] = useState(60 * 60)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [passageNo, setPassageNo] = useState<1 | 2 | 3>(1)
    const rootRef = useRef<HTMLDivElement>(null);

    const [started, setStarted] = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(true)

    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')
    const [submittingTest, setSubmittingTest] = useState(false)

    

    const handleOpenSubmitDialog = () => {
        setShowSubmitDialog(true)
    }

    useEffect(() => {
        setMounted(true)
        }, [])

    // for highlight toolbar
    const [selRect, setSelRect] = useState<DOMRect | null>(null)
    const passageRef = useRef<HTMLDivElement>(null)

    // fetch test + questions from Supabase
        useEffect(() => {
        supabase
        .from('reading_tests')
        .select(`*, questions:reading_questions(*)`)
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
            if (!error && data) setTestData(data as TestData)
            setLoading(false)
        })
    }, [id])

    // countdown timer + auto‑submit at zero
    useEffect(() => {
        if (!started || loading) return
        const iv = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(iv)
                    //handleSubmit()
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(iv)
    }, [started, loading])

    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0')
        return `${m}`
    }  

    // record one answer
    const handleAnswerChange = (n: number, v: string) => {
        setAnswers((a) => ({ ...a, [n]: v }))
    }

    // submit the test
    //const handleSubmit = async () => {
        //if (isSubmitting || !testData) return
            //setIsSubmitting(true)
            //await supabase
            //.from('submissions')
            //.insert({ /* … */ })
            //router.push('/dashboard')}
        // raw correct count

        /*let correctCount = 0
        for (let q of testData.questions) {
            const ans = answers[q.number]?.trim().toLowerCase() ?? ''
            if (q.answer?.trim().toLowerCase() === ans) correctCount++}*/
    
            const handleFinalSubmit = async () => {
    if (!studentName.trim() || !studentDatetime.trim()) {
        alert('Please fill Full Name and Datetime!');
        return;
    }

    try {
        setSubmittingTest(true);

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        doc.setFont('Times', 'normal'); // Fix font spacing
        const margin = 40;
        const maxWidth = 400;
        let y = 20;

        const testNumber = testData?.title?.split(' ').pop() || '1';
        const testTitle = `IELTS READING TEST ${testNumber}`;

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
        sortedQs.forEach((q) => {
        const userAns = (answers[q.number] as string || '').trim().toLowerCase();
        const correct = q.answer?.trim().toLowerCase();
        if (userAns && correct && userAns === correct) correctCount++;
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

        // Render answers (no questions shown, only number + answer)
        sortedQs.forEach((q) => {
        const rawAnswer = answers[q.number] ?? '[No Answer]';

        const clean = (txt: string) =>
            txt.replace(/^!['’]?\s*/, '').trim(); // ✅ remove corrupted !' prefix

        const formattedAnswer = Array.isArray(rawAnswer)
            ? rawAnswer.map(a => clean(a)).join(', ')
            : clean(String(rawAnswer));

        const line = `${q.number}. ${formattedAnswer}`; // ✅ One clean line
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        if (y + wrappedLines.length * 16 > 780) {
            doc.addPage();
            y = 40;
        }

        doc.text(wrappedLines, margin, y);
        y += wrappedLines.length * 16 + 6;
        });

        // Add watermark on every page
        const pageCount = (doc as any).internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(200);
        doc.setFontSize(60);
        doc.text('MS CARA IELTS', 300, 500, {
            angle: -30,
            align: 'center'
        });
        doc.setTextColor(0)
        }

        doc.save(`Reading_${studentName.replace(/\s+/g, '_')}.pdf`);
        alert('✅ PDF download started!');
        router.push('/dashboard');
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('❌ Failed to submit test.');
    } finally {
        setSubmittingTest(false);
    }
    }

    useEffect(() => {
        if (isSubmitting && testData) {
          // 1) compute raw correct count
        const correctCount = testData.questions.reduce((sum, q) => {
        const rawAns = (answers[q.number] as string || '').trim().toLowerCase()
        return sum + (q.answer?.trim().toLowerCase() === rawAns ? 1 : 0)
            }, 0)
        

        // convert to band (example scale)
        let bandScore = 0
        if (correctCount >= 39) bandScore = 9.0
        else if (correctCount >= 37) bandScore = 8.5
        else if (correctCount >= 35) bandScore = 8
        else if (correctCount >= 33) bandScore = 7.5
        else if (correctCount >= 30) bandScore = 7
        else if (correctCount >= 27) bandScore = 6.5
        else if (correctCount >= 23) bandScore = 6
        else if (correctCount >= 19) bandScore = 5.5
        else if (correctCount >= 15) bandScore = 5
        else if (correctCount >= 13) bandScore = 4.5
        else if (correctCount >= 10) bandScore = 4
        else if (correctCount >= 7) bandScore = 3.5
        else if (correctCount >= 5) bandScore = 3.0
        else bandScore = 2.5
        
        alert('Your test has been submitted successfully!')
        //alert(`You got ${correctCount} correct → Band ${bandScore.toFixed(1)}`)
            }
        }, [isSubmitting, testData])
        
        /*await supabase.from('submissions').insert({
        test_id: testData.id,
        answers,
        score: correctCount,
        band: bandScore,
        submitted_at: new Date().toISOString(),
        })
        router.push('/dashboard')
        }*/

        // on mouseup in passage, detect selection rect or hide
        const onMouseUp = () => {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
                const r = sel.getRangeAt(0).getBoundingClientRect()
                setSelRect(r)
            } else {
                setSelRect(null)
            }
            }

        // Highlight wrapper with fallback
        function highlight(color: string) {
            const sel = window.getSelection()
            if (!sel || !sel.rangeCount) return
            const range = sel.getRangeAt(0)
            const span = document.createElement('span')
            span.style.backgroundColor = color
            try {
            range.surroundContents(span)
            } catch {
            // fallback for partial selections
            const frag = range.extractContents()
            span.appendChild(frag)
            range.insertNode(span)
            }
            sel.removeAllRanges()
            setSelRect(null)
            }

        // full-screen toggle
        const toggleFull = () => {
            if (!document.fullscreenElement) {
            rootRef.current?.requestFullscreen();
            } else {
            document.exitFullscreen();
            }
        };

        if (loading || !testData) {
        return (<div className="p-10 text-center">Loading Test…</div>)
        }


        // pull out just this passage
        const td = testData!    // Now TypeScript “knows” testData is non‐null
        const { passage1, passage2, passage3, questions } = testData
        const passages = [passage1, passage2, passage3]
        const passageContent = passages[passageNo - 1]
        const currentQs = questions
            .filter((q) => q.passage_no === passageNo)
            .sort((a, b) => a.number - b.number)
        const allQs = [...questions].sort((a, b) => a.number - b.number)
        const groupIndex = (n: number): 1 | 2 | 3 => (n <= 13 ? 1 : n <= 26 ? 2 : 3)

        return (
            <div ref={rootRef} className="flex flex-col w-full h-screen overflow-hidden bg-orange-50">
            {!started && <div className="absolute inset-0 backdrop-blur-sm z-10"></div>}

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
                    }}
                    >
                    here
                    </span>{' '}
                    to start the test.
                </p>
                </div>
            </div>
            )}

            <header className="sticky top-0 z-30 flex items-center justify-between bg-orange-50 border-b px-4 py-2 shadow">
            <h1 className="font-bold">IELTS Reading Test</h1>
            
             {/* Center Timer */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                <ClockIcon className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold text-orange-500">
                {formatTime(timeLeft)} minutes remaining
                </span>
            </div>

            {/* Right: submit + fullscreen */}
            <div className="w-1/4 flex justify-end space-x-2">
                <button onClick={toggleFull} className="p-2">
                    <Expand className="w-5 h-5 text-gray-600"/>
                    </button>
                    <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={submittingTest}
                    className="bg-amber-300 hover:bg-amber-400 text-white flex items-center gap-1"
                        >
                    {submittingTest ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                    <>
                    Submit <SendHorizontal className="w-5 h-5" />
                    </>
                    )}
                </Button>
                </div>
            </header>


        {/* MAIN PANELS */}
        <div className="h-[calc(100vh-64px-48px)] flex overflow-hidden">
        <section className="bg-white p-4 rounded shadow space-y-2">
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
            {/* PASSAGE */}
            <ResizablePanel
                defaultSize={50}
                minSize={20}
                className="relative flex flex-col font-serif text-lg leading-relaxed px-1.5"
                onMouseUp={onMouseUp}
                >
                {/* Scrollable passage */}
                <div className="overflow-y-auto flex-1 font-serif whitespace-pre-wrap">{passageContent}</div>
                
               {/* Pen toolbar at selection */}
                {selRect && (
                <div
                    className="absolute z-50 flex items-center gap-1 p-1 bg-white border rounded shadow"
                    style={{
                    top: selRect.top + window.scrollY - 105,
                    left: selRect.left + window.scrollX + 20,
                    }}
                >
                    {['yellow', 'lightgreen', 'pink', 'aqua', 'orange'].map((c) => (
                    <button
                        key={c}
                        className="w-5 h-5 border"
                        style={{ backgroundColor: c }}
                        onClick={() => highlight(c)}
                    />
                    ))}
                    <PenLine size={18} className="text-gray-700" />
                </div>
                )}
            </ResizablePanel>

            <ResizableHandle />

            {/* QUESTIONS */}
            <ResizablePanel
                defaultSize={50}
                minSize={20}
                className="flex flex-col p-0.5 overflow-y-auto h-full"
            >
                <div className="overflow-y-auto flex-1">
                {currentQs.map((q) => (
                <div key={q.id} id={`q-${q.number}`} className="mb-6 border-b pb-4">
                    <p className="font-medium mb-2">
                    {q.number}. {q.question_text}
                    </p> 

                    {/* TF/NG */}
                    {(q.type === 'TFNG' || q.type === 'YNNG') && (
                    <div className="space-y-1">
                        {['True', 'False', 'Not Given'].map((opt) => (
                        <label
                            key={opt}
                            className="flex items-center space-x-2"
                        >
                            <input
                            type="radio"
                            name={`q${q.number}`}
                            value={opt}
                            checked={answers[q.number] === opt}
                            onChange={(e) =>
                                handleAnswerChange(q.number, e.target.value)
                            }
                            />
                            <span>
                            {q.type === 'YNNG'
                                ? opt.replace('True', 'Yes').replace('False', 'No')
                                : opt}
                            </span>
                        </label>
                        ))}
                    </div>
                    )}

                    {/* HeadingMatch */}
                    {q.type === 'HeadingMatch' && q.options && (
                    <select
                        className="w-full border rounded p-2"
                        value={answers[q.number] || ''}
                        onChange={(e) =>
                        handleAnswerChange(q.number, e.target.value)
                        }
                    >
                        <option value="">— Select heading —</option>
                        {q.options.map((opt, i) => (
                        <option key={i} value={opt}>
                            {opt}
                        </option>
                        ))}
                    </select>
                    )}

                    {/* MultipleChoice */}
                    {q.type === 'MultipleChoice' && q.options && (
                    <div className="space-y-1">
                        {q.options.map((opt, i) => {
                        const label = String.fromCharCode(65 + i)
                        const text = opt.replace(/^[A-Z]\.\s*/, '');
                        return (
                            <label
                            key={i}
                            className="flex items-center space-x-2"
                            >
                            <input
                                type="radio"
                                name={`q${q.number}`}
                                value={label}
                                checked={answers[q.number] === label}
                                onChange={(e) =>
                                handleAnswerChange(q.number, e.target.value)
                                }
                            />
                            <span>
                                {label}. {text}
                            </span>
                            </label>
                        )
                        })}
                    </div>
                    )}

                    {/* ShortAnswer / GapFill */}
                    {(q.type === 'ShortAnswer' || q.type === 'GapFill') && (
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={answers[q.number] || ''}
                        onChange={(e) =>
                        handleAnswerChange(q.number, e.target.value)
                        }
                    />
                    )}
                </div>
                ))}
                </div>
                
                {/* Submit Dialog */}
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
                                onChange={(newValue) => {
                                if (newValue) setStudentDatetime(newValue.format('DD-MM-YYYY HH:mm'))
                                }}
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


                {/* bottom Q‑nav - all 40 question buttons*/}
                <div className="absolute inset-x-0 bottom-0 bg-orange-50 border-t p-2 z-10 overflow-x-auto">
                <div className="max-w-[2000px] mx-auto flex justify-center space-x-1">
                    {allQs.map((q) => (
                    <button
                        key={q.number}
                        className={`w-6 h-6 text-xs rounded ${
                        answers[q.number]
                            ? 'bg-amber-300'
                            : 'bg-amber-100'
                        }`}
                        onClick={() => {
                        // switch passage if needed
                        const pass = q.number <= 13 ? 1 : q.number <= 26 ? 2 : 3
                        setPassageNo(pass as 1 | 2 | 3)
                        // scroll question panel
                        setTimeout(() => {
                            document
                            .getElementById(`q-${q.number}`)
                            ?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            })
                        }, 100)
                        }}
                    >
                        {q.number}
                    </button>
                    ))}
                </div>
                </div>
            </ResizablePanel>
            </ResizablePanelGroup>
            </section>
        </div>

        {/* Hidden div for PDF generation */}
        <div id="pdf-content"   
        style={{
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '20px',
        }}
        >
        <h1 style={{ textAlign: 'center' }}>IELTS LISTENING TEST 1</h1>
        <p><strong>Student:</strong> {studentName}</p>
        <p><strong>Date:</strong> {studentDatetime}</p>
        <hr />
        <h2>Answers</h2>
        <ol>
            {Object.entries(answers).map(([qnum, ans]) => (
            <li key={qnum}>
                <strong>{qnum}.</strong> {Array.isArray(ans) ? ans.join(', ') : ans}
            </li>
            ))}
        </ol>
        <p style={{ position: 'fixed', bottom: 10, left: 10, opacity: 0.1, fontSize: '3rem', transform: 'rotate(-30deg)' }}>
            CARA IELTS
        </p>
        </div>

        </div>

)
}

