'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
    Clock as ClockIcon,
    Volume2,
    Volume1,
    VolumeX,
    Expand,
    SendHorizontal,
    Loader2
    } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    type QType =
    | 'Completion'
    | 'MultipleChoice'
    | 'Matching'
    | 'Labelling'
    | 'ShortAnswer'

    interface Question {
    id: string
    number: number
    type: QType
    question_text: string
    options?: string[]
    answer: string
    passage_no: 1 | 2 | 3 | 4
    }

    interface TestData {
    id: string
    title: string
    audio_url: string
    questions: Question[]
    }

    export default function ListeningTestPage() {
    const { id } = useParams()
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement>(null)
    
    const [loading, setLoading] = useState(true)
    const [testData, setTestData] = useState<TestData | null>(null)
    const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
    const [timeLeft, setTimeLeft] = useState(32 * 60)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)
    
    const [started, setStarted] = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(true)
    
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')
    const [submittingTest, setSubmittingTest] = useState(false)

    //const [submitting, setSubmitting] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null) // New state for audio errors

     // START TEST: Play audio
    useEffect(() => {
        if (started && audioRef.current) {
            audioRef.current.play().catch(console.error)
            }
        }, [started])
    
     // COUNTDOWN timer
    useEffect(() => {
        if (!started) return
        const iv = setInterval(() => {
        setTimeLeft(t => {
            if (t <= 1) {
            clearInterval(iv)
            handleOpenSubmitDialog()
            return 0
            }
        return t - 1
        })
        }, 1000)
            return () => clearInterval(iv)
        }, [started])

    // helper to know when a question button is "done"
    const isAnswered = (qnum: number): boolean => {
        // Q11 lights with ≥1 tick
        if (qnum === 11) {
        const arr = Array.isArray(answers[11]) ? answers[11] : []
        return arr.length >= 1
        }
        // Q12 lights with ≥2 ticks
        if (qnum === 12) {
        const arr = Array.isArray(answers[12]) ? answers[12] : []
        return arr.length >= 2
        }
        if (qnum === 13) {
        const arr = Array.isArray(answers[13]) ? answers[13] : []
        return arr.length >= 1
        }
        // Q12 lights with ≥2 ticks
        if (qnum === 14) {
        const arr = Array.isArray(answers[14]) ? answers[14] : []
        return arr.length >= 2
        }
        if (qnum === 21) {
        const arr = Array.isArray(answers[21]) ? answers[21] : []
        return arr.length >= 1
        }
        // Q12 lights with ≥2 ticks
        if (qnum === 22) {
        const arr = Array.isArray(answers[22]) ? answers[22] : []
        return arr.length >= 2
        }
        if (qnum === 23) {
        const arr = Array.isArray(answers[23]) ? answers[23] : []
        return arr.length >= 1
        }
        // Q12 lights with ≥2 ticks
        if (qnum === 24) {
        const arr = Array.isArray(answers[24]) ? answers[24] : []
        return arr.length >= 2
        }
        // fallback: any non-empty answer
        const val = answers[qnum]
        return Array.isArray(val) ? val.length > 0 : Boolean(val)
    }

    //Lock Scroll When Blurred
    useEffect(() => {
        if (!started) {
            document.body.style.overflow = 'hidden'
            } else {
            document.body.style.overflow = 'auto'
            }
        }, [started])

    // fetch test + questions
    useEffect(() => {
        supabase
        .from('listening_tests')
        .select(`id, title, audio_url, questions:listening_questions(*)`)
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
            if (error) console.error(error)
            else setTestData(data as TestData)
            setLoading(false)
        })
    }, [id])

    // countdown timer
    /*useEffect(() => {
        if (!started || loading) return
        const iv = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(iv)
                    handleSubmit()
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(iv)
    }, [started, loading])*/

    /*const changeVolume = (delta: number) => {
        const v = Math.min(1, Math.max(0, volume + delta))
        setVolume(v)
        if (audioRef.current) audioRef.current.volume = v
    }*/

    /*async function handleSubmit() {
        if (!testData || submitting) return
        setSubmitting(true)
        let correct = 0
        testData.questions.forEach((q) => {
        const ans = answers[q.number]
        if (typeof ans === 'string' && ans.toLowerCase() === q.answer.toLowerCase())
            correct++
        else if (Array.isArray(ans) && ans.includes(q.answer)) correct++
        })
        alert('Your test has been submitted successfully!')
        //alert(`You scored ${correct}/40`)
        router.push('/dashboard')
    }*/  

    // Function to start audio playback
    const startAudio = () => {
        if (audioRef.current) {
            audioRef.current.muted = true
            audioRef.current.play()
                .then(() => {
                audioRef.current!.muted = false
                setAudioError(null)
                })
                .catch((e) => {
                console.error('Audio playback failed', e)
                setAudioError('Failed to play audio. Please click the play button below.')
                })
            }
        }
    
    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0')
        return `${m}`
    }

    
    const toggleFull = () => {
        const elem = document.documentElement
        if (!document.fullscreenElement) {
            elem.requestFullscreen()
            } else {
            document.exitFullscreen()
            }
        }

    const handleAnswerChange = (qnum: number, val: string | string[]) => {
        setAnswers((a) => ({ ...a, [qnum]: val }))
    }

    // drag/drop for Q25–30
    const topics = [
        'A independent living',
        'B the ageing process stages',
        'C PSWs’ role in health care',
        'D workplace communication',
        'E memory stimulation activities',
        'F handling stress',
        'G biological systems'
    ]
    const coursesQ25to30 = [
        { num: 25, label: 'Understanding is Essential' },
        { num: 26, label: 'Foundations' },
        { num: 27, label: 'The Way We Work' },
        { num: 28, label: 'Residence Care' },
        { num: 29, label: 'Dynamics' },
        { num: 30, label: 'The Power Within' }
    ]
    const [matches, setMatches] = useState<Record<number, string>>({})

    const handleDragStart = (e: React.DragEvent, letter: string) =>
        e.dataTransfer.setData('text/plain', letter)
    const allowDrop = (e: React.DragEvent) => e.preventDefault()
    const handleDrop = (e: React.DragEvent, qnum: number) => {
        e.preventDefault()
        const letter = e.dataTransfer.getData('text/plain')
        setMatches((m) => ({ ...m, [qnum]: letter }))
        handleAnswerChange(qnum, letter)
    }

    const handleOpenSubmitDialog = () => setShowSubmitDialog(true)

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
        sortedQs.forEach((q) => {
            let userAns = answers[q.number];

            if (Array.isArray(userAns)) {
                userAns = userAns.join(', ');
            }
            userAns = String(userAns).replace(/^!['’]?\s*/, '').trim().toLowerCase();
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

        doc.text(`Score Summary:`, margin, y); y += 20;
        doc.text(`Correct Answers: ${correctCount}`, margin, y); y += 16;
        doc.text(`Band Score: ${band.toFixed(1)}`, margin, y); y += 30;

        // Render answers
        sortedQs.forEach((q) => {
        const rawAnswer = answers[q.number] ?? '[No Answer]';

        const clean = (txt: string) =>
            txt.replace(/^!['’]?\s*/g, '').trim();

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
        doc.text('MS CARA IELTS', 300, 500, {
            angle: -30,
            align: 'center',
        });
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
    };

    if (loading || !testData)
        return <div className="p-10 text-center">Loading…</div>

    const allQs = [...testData.questions].sort((a, b) => a.number - b.number)

    return (
        <div className="relative w-full h-full">
            {!started && <div className="absolute inset-0 backdrop-blur-sm z-10"></div>}
            
            {started && testData.audio_url && (
            /*<audio
                ref={audioRef}
                src={testData.audio_url}
                controls
                className="hidden"
                preload="auto"
                onError={() => setAudioError('Failed to load audio file. Please check the source.')}
            />*/
            //<audio ref={audioRef} src={testData.audio_url} controls className="w-full"/>
            <audio ref={audioRef} src="/audio/listening-test-1.mp3" preload="auto" hidden />
            )}
            {audioError && <p className="text-red-500 text-sm">{audioError}</p>}

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
                        startAudio()
                    }}
                    >
                    here
                    </span>{' '}
                    to start the test.
                </p>
                </div>
            </div>
            )}

            <header className="fixed top-0 left-0 w-full z-30 bg-orange-50 border-b px-4 py-2 flex items-center justify-between shadow">
            <h1 className="text-2xl font-bold">IELTS Listening Test</h1>

            {/* Center Timer */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
            <ClockIcon className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-semibold text-orange-500">
                {formatTime(timeLeft)} minutes remaining
            </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
                <Button size="icon" variant="ghost" onClick={() => {
                if (muted || volume === 0) {
                    setMuted(false)
                    setVolume(1)
                    if (audioRef.current) audioRef.current.volume = 1
                } else {
                    setMuted(true)
                    setVolume(0)
                    if (audioRef.current) audioRef.current.volume = 0
                }
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
                    <Expand className="w-5 h-5 text-gray-600"/>
                    </button>
                    <Button
                    onClick={handleOpenSubmitDialog}
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

        {/* CONTENT */}
        <div className="overflow-y-auto p-4 flex-1 space-y-1 bg-orange-50 pt-15">
            {/* Q1–7: General Information */}
            <section className="bg-white p-4 rounded shadow space-y-2">
            <h3 className="font-semibold mt-2">Questions 1–10</h3> 
            <p>Complete the notes below.</p>
            <p className="text-red-600 font-medium">
                Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.
            </p>
            <p className="font-semibold mt-2">The International School, Dubai</p>
            <p className="font-semibold mt-3">General Information and facilities</p>
            <ul className="list-disc list-inside space-y-1">
                <li>Two departments: Lower school, Middle school</li>
                <li>
                Location of school opposite the <strong>1.</strong>{' '}
                <input
                    id="q-1"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center" /*inline-block w-25 border rounded px-1*/
                    onChange={(e) => handleAnswerChange(1, e.target.value)}
                />
                </li>
                <li>School address: Meadows Drive. Dubai</li>
                <li>
                Uniform: a <strong>2.</strong>{' '}
                <input
                    id="q-2"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(2, e.target.value)}
                />{' '}
                shirt, black trousers or shorts
                </li>
                <li>
                Lessons from 7.20 until <strong>3.</strong>{' '}
                <input
                    id="q-3"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(3, e.target.value)}
                />
                , Sunday–Thursday
                </li>
                <li>
                Children on Early Start programme are given <strong>4.</strong>{' '}
                <input
                    id="q-4"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(4, e.target.value)}
                />{' '}
                before school starts
                </li>
                <li>
                Late Stay activities: playtime, help with homework, current term’s spoil activity
                is <strong>5.</strong>{' '}
                <input
                    id="q-5"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(5, e.target.value)}
                />
                </li>
                <li>
                Music: <strong>6.</strong>{' '}
                <input
                    id="q-6"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(6, e.target.value)}
                />{' '}
                lessons held on Tuesdays
                </li>
                <li>
                Languages: <strong>7.</strong>{' '}
                <input
                    id="q-7"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(7, e.target.value)}
                />{' '}
                from age 7
                </li>
            </ul>
            {/* Q8–10: Meeting with Head Teacher */}
            <p className="font-semibold mt-2">Meeting with Head Teacher</p>
            <ul className="list-disc list-inside space-y-1">
                <li>
                Name of Head Teacher: Elizabeth Rose Day: <strong>8.</strong>{' '}
                <input
                    id="q-8"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(8, e.target.value)}
                />
                </li>
                <li>
                Time: <strong>9.</strong>{' '}
                <input
                    id="q-9"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(9, e.target.value)}
                />
                </li>
                <li>
                Can talk to the <strong>10.</strong>{' '}
                <input
                    id="q-10"
                    type="text"
                    className="border-b-2 border-gray-400 w-24 text-center"
                    onChange={(e) => handleAnswerChange(10, e.target.value)}
                />{' '}
                teacher in coffee break
                </li>
            </ul>
            </section>


            {/* Q11–12: single UI */}
            <section className="bg-white p-4 rounded shadow space-y-2">
            <div id="q-11" className="mt-2">
            <span id="q-12" />
            <h3 className="font-semibold">Questions 11–12</h3>
            <p>Choose TWO letters, A–E.</p>
            <div className="bg-white p-4 rounded shadow space-y-1">
                <p className="font-medium mb-2">
                Which TWO things will employees need to do during their first week in their
                new office space?
                </p>
                {testData.questions
                .find((q) => q.number === 11)!
                .options!.map((opt, i) => (
                    <label key={i} className="flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={
                        Array.isArray(answers[11]) && (answers[11] as string[]).includes(opt)
                        }
                        onChange={(e) => {
                        const prev = Array.isArray(answers[11]) ? [...answers[11]] : []
                        let next = e.target.checked
                            ? [...prev, opt]
                            : prev.filter((x) => x !== opt)
                        if (next.length > 2) next = next.slice(0, 2)
                        handleAnswerChange(11, next)
                        handleAnswerChange(12, next)
                        }}
                    />
                    {opt}
                    </label>
                ))}
            </div>
            </div>

            {/* Q13–14 */}
            <div id="q-13" className="mt-2">
            <span id="q-14" />
            <h3 className="font-semibold">Questions 13–14</h3>
            <p>Choose TWO letters, A–E.</p>
            <div className="bg-white p-4 rounded shadow space-y-1">
                <p className="font-medium mb-2">
                Which TWO steps have the company taken to improve the physical environment of
                employees' offices?
                </p>
                {testData.questions
                .find((q) => q.number === 13)!
                .options!.map((opt, i) => (
                    <label key={i} className="flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={
                        Array.isArray(answers[13]) && (answers[13] as string[]).includes(opt)
                        }
                        onChange={(e) => {
                        const prev = Array.isArray(answers[13]) ? [...answers[13]] : []
                        let next = e.target.checked
                            ? [...prev, opt]
                            : prev.filter((x) => x !== opt)
                        if (next.length > 2) next = next.slice(0, 2)
                        handleAnswerChange(13, next)
                        handleAnswerChange(14, next)
                        }}
                    />
                    {opt}
                    </label>
                ))}
            </div>
            </div>

            {/* Q15–20 with side-by-side map */}
            <h3 className="font-semibold mt-2">Questions 15–20</h3>
            <p className="mb-2">Label the plan below. Write the correct letter, A–I.</p>
            <div className="md:flex">
                <div className="md:w-1/2 bg-white p-4 rounded shadow space-y-4">
                {allQs
                    .filter((q) => q.number >= 15 && q.number <= 20)
                    .map((q) => (
                    <div key={q.number} className="flex items-center space-x-4" id={`q-${q.number}`}>
                        <span className="w-60">
                        {q.number}. {q.question_text}
                        </span>
                        <input
                        type="text"
                        placeholder="A–I"
                        className="border-b-2 border-gray-400 w-40 text-center" /*flex-1 border rounded px-3 py-1*/
                        value={String(answers[q.number] ?? '')}
                        onChange={(e) =>
                        handleAnswerChange(q.number, e.target.value.toUpperCase())
                        }
                        />
                    </div>
                    ))}
                </div>
                <div className="md:w-1/2">
                <Image
                    src="/images/map.png"
                    alt="Plan of the renovated factory complex"
                    width={600}
                    height={300}
                    className="w-full h-auto border"
                />
                </div>
            </div>
            </section>


            {/* Q21–24 */}
            <section className="bg-white p-4 rounded shadow space-y-1">
            <div id="q-21" className="mt-2">
            <span id="q-22" />
            <h3 className="font-semibold">Questions 21–22</h3>
            <p>Choose TWO letters, A–E.</p>
            <div className="bg-white p-4 rounded shadow space-y-1">
            <p className="font-medium mb-2">
                Which are the TWO main duties for Personal Support Workers (PSWs)?
            </p>
            {testData.questions
                .find((q) => q.number === 21)!
                .options!.map((opt, i) => (
                <label key={i} className="flex items-center">
                    <input
                    type="checkbox"
                    className="mr-2"
                    checked={
                        Array.isArray(answers[21]) && (answers[21] as string[]).includes(opt)
                    }
                    onChange={(e) => {
                        const prev = Array.isArray(answers[21]) ? [...answers[21]] : []
                        let next = e.target.checked
                        ? [...prev, opt]
                        : prev.filter((x) => x !== opt)
                        if (next.length > 2) next = next.slice(0, 2)
                        handleAnswerChange(21, next)
                        handleAnswerChange(22, next)
                    }}
                    />
                    {opt}
                </label>
                ))}
                </div>
            </div>

            <div id="q-23" className="mt-2 ">
            <span id="q-24" />
            <h3 className="font-semibold">Questions 23–24</h3>
            <p>Choose TWO letters, A–E.</p>
            <div className="bg-white p-4 rounded shadow space-y-1">
            <p className="font-medium mb-2">
                Which are the TWO requirements to do the PSW programme?
            </p>
            {testData.questions
                .find((q) => q.number === 23)!
                .options!.map((opt, i) => (
                <label key={i} className="flex items-center">
                    <input
                    type="checkbox"
                    className="mr-2"
                    checked={
                        Array.isArray(answers[23]) && (answers[23] as string[]).includes(opt)
                    }
                    onChange={(e) => {
                        const prev = Array.isArray(answers[23]) ? [...answers[23]] : []
                        let next = e.target.checked
                        ? [...prev, opt]
                        : prev.filter((x) => x !== opt)
                        if (next.length > 2) next = next.slice(0, 2)
                        handleAnswerChange(23, next)
                        handleAnswerChange(24, next)
                    }}
                    />
                    {opt}
                </label>
                ))}
                </div>
            </div>

            {/* Q25–30 drag & drop */}
            <section className="mt-2">
            <h3 className="font-semibold mb-2">Questions 25–30</h3>
            <p>Choose SIX answers from the box and drop the correct letter onto each course.</p>
            <div className="md:flex md:space-x-5 mt-4">
                {/* Topics column */}
                <div className="md:w-1/3 bg-white p-5 rounded shadow mb-4 md:mb-0">
                <h4 className="font-medium mb-2">Topics</h4>
                <ul className="space-y-5">
                    {topics.map((t) => (
                    <li
                        key={t}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t[0])}
                        className="cursor-move px-2 py-1 border rounded hover:bg-gray-100"
                    >
                        {t}
                    </li>
                    ))}
                </ul>
                </div>

                {/* Courses column */}
                <div className="md:w-2/3 bg-white p-5 rounded shadow">
                <h4 className="font-medium mb-2">Courses</h4>
                <ul className="space-y-3">
                    {coursesQ25to30.map((c) => (
                    <li
                        key={c.num}
                        id={`q-${c.num}`}
                        onDrop={(e) => handleDrop(e, c.num)}
                        onDragOver={allowDrop}
                        className="flex justify-between items-center border px-4 py-2 rounded"
                    >
                        <span className="font-medium">
                        {c.num}. {c.label}
                        </span>
                        <div className="w-10 h-8 border rounded flex items-center justify-center">
                        {matches[c.num] || <span className="text-gray-400">--</span>}
                        </div>
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            </section>
            </section>

            {/* Q31–40: bullets + inline blanks */}
            <section className="bg-white p-4 rounded shadow space-y-2">
            <h3 className="font-semibold">Questions 31–40</h3>
            <p>Complete the notes below.</p>
            <p className="text-red-600 font-medium">Write ONE WORD ONLY for each answer.</p>

            {/* Underwater Archaeological Sites */}
            <p className="font-semibold mt-4">Underwater Archaeological Sites</p>
            <p className="font-semibold mt-1">General Information</p>
            <ul className="list-disc list-inside space-y-2">
                {allQs
                .filter((q) => [31, 32].includes(q.number))
                .map((q) => {
                    // remove any “● ” prefix
                    const raw = q.question_text.replace(/^\s*●\s*/, '')
                    const [before, after] = raw.split('___')
                    return (
                    <li
                        key={q.number}
                        id={`q-${q.number}`}
                        className="flex items-start space-x-2"
                    >
                        <span className="font-medium">{q.number}.</span>
                        <span>{before.trim()}</span>
                        <input
                        type="text"
                        className="border-b-2 border-gray-400 w-24 text-center"
                        value={answers[q.number] as string || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        />
                        <span>{after?.trim()}</span>
                    </li>
                    )
                })}
            </ul>

            {/* Shipwrecks */}
            <p className="font-semibold mt-4">Shipwrecks</p>
            <ul className="list-disc list-inside space-y-2">
                {allQs
                .filter((q) => [33, 34].includes(q.number))
                .map((q) => {
                    const raw = q.question_text.replace(/^\s*●\s*/, '')
                    const [before, after] = raw.split('___')
                    return (
                    <li
                        key={q.number}
                        id={`q-${q.number}`}
                        className="flex items-start space-x-2"
                    >
                        <span className="font-medium">{q.number}.</span>
                        <span>{before.trim()}</span>
                        <input
                        type="text"
                        className="border-b-2 border-gray-400 w-24 text-center"
                        value={answers[q.number] as string || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        />
                        <span>{after?.trim()}</span>
                    </li>
                    )
                })}
            </ul>

            {/* Learn from it */}
            <p className="font-semibold mt-4">Learn from it</p>
            <ul className="list-disc list-inside space-y-2">
                {allQs
                .filter((q) => [35, 36].includes(q.number))
                .map((q) => {
                    const raw = q.question_text.replace(/^\s*●\s*/, '')
                    const [before, after] = raw.split('___')
                    return (
                    <li
                        key={q.number}
                        id={`q-${q.number}`}
                        className="flex items-start space-x-2"
                    >
                        <span className="font-medium">{q.number}.</span>
                        <span>{before.trim()}</span>
                        <input
                        type="text"
                        className="border-b-2 border-gray-400 w-24 text-center"
                        value={answers[q.number] as string || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        />
                        <span>{after?.trim()}</span>
                    </li>
                    )
                })}
            </ul>

            {/* Examples */}
            <p className="font-semibold mt-4">Examples</p>
            <ul className="list-disc list-inside space-y-2">
                {allQs
                .filter((q) => [37, 38, 39, 40].includes(q.number))
                .map((q) => {
                    const raw = q.question_text.replace(/^\s*●\s*/, '')
                    const [before, after] = raw.split('___')
                    return (
                    <li
                        key={q.number}
                        id={`q-${q.number}`}
                        className="flex items-start space-x-2"
                    >
                        <span className="font-medium">{q.number}.</span>
                        <span>{before.trim()}</span>
                        <input
                        type="text"
                        className="border-b-2 border-gray-400 w-24 text-center"
                        value={answers[q.number] as string || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        />
                        <span>{after?.trim()}</span>
                    </li>
                    )
                })}
            </ul>
            </section>
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

        {/* BOTTOM NAV 1–40 */}
        <nav className="sticky bottom-0 bg-white border-t p-2">
            <div className="flex flex-wrap gap-2 justify-center">
            {allQs.map((q) => (
                <button
                key={q.number}
                onClick={() =>
                    document
                    .getElementById(`q-${q.number}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                className={`w-6 h-6 text-xs rounded ${
                    isAnswered(q.number) ? 'bg-amber-300' : 'bg-amber-100'
                }`}
                >
                {q.number}
                </button>
            ))}
            </div>
        </nav>

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
