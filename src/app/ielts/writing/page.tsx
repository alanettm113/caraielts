'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/supabase"
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Eye, EyeOff, Loader2, Clock as ClockIcon, Expand, SendHorizontal } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

export default function WritingTestPage() {
    const router = useRouter();

    const [userId, setUserId] = useState<string | null>(null);
    //const [testStarted, setTestStarted] = useState(false);
    const [currentTask, setCurrentTask] = useState<'task1' | 'task2'>('task1');

    const [task1, setTask1] = useState('');
    const [task2, setTask2] = useState('');
    const [note1, setNote1] = useState('');
    const [note2, setNote2] = useState('');
    const [showNote1, setShowNote1] = useState(false);
    const [showNote2, setShowNote2] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60);

    const [isSubmitting, setIsSubmitting] = useState(false);

    //const [loading, setLoading] = useState(true)
    const [started, setStarted] = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(true)

    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')
    const [submittingTest, setSubmittingTest] = useState(false)

    // full-screen ref
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.email || null);
        };
        fetchUser();
    }, []);

    // countdown timer
    useEffect(() => {
        if (!started) return
        const iv = setInterval(() => {
        setTimeLeft((t) => {
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

    const handleOpenSubmitDialog = () => setShowSubmitDialog(true)

    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0')
        return `${m}`
    }
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

        // Header
        doc.setFontSize(14);
        doc.text('IELTS WRITING TEST', 210, y, { align: 'center' });
        y += 30;

        doc.setFontSize(12);
        doc.text(`Student: ${studentName}`, margin, y); y += 20;
        doc.text(`Date: ${studentDatetime}`, margin, y); y += 20;
        doc.line(margin, y, 555, y); y += 20;

        // Task 1
        const wc1 = task1.trim().split(/\s+/).length;
        doc.text(`Task 1 (Word Count: ${wc1}):`, margin, y); y += 20;

        const task1Lines = doc.splitTextToSize(task1.trim(), maxWidth);
        for (const line of task1Lines) {
        if (y > 780) {
            doc.addPage(); y = 40;
        }
        doc.text(line, margin, y); y += 16;
        }

        y += 20;

        // Task 2
        const wc2 = task2.trim().split(/\s+/).length;
        doc.text(`Task 2 (Word Count: ${wc2}):`, margin, y); y += 20;

        const task2Lines = doc.splitTextToSize(task2.trim(), maxWidth);
        for (const line of task2Lines) {
        if (y > 780) {
            doc.addPage(); y = 40;
        }
        doc.text(line, margin, y); y += 16;
        }

        // Add watermark behind text on all pages
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(240); // lighter so it's behind
        doc.setFontSize(60);
        doc.text('MS CARA IELTS', 300, 500, {
            angle: -30,
            align: 'center'
        });
        doc.setTextColor(0); // reset for text
        }

        doc.save(`Writing_${studentName.replace(/\s+/g, '_')}.pdf`);
        alert('✅ PDF download started!');
        router.push('/dashboard');
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('❌ Failed to submit test.');
    } finally {
        setSubmittingTest(false);
    }
    };
    
    /*const handleSubmit = async () => {
        if (isSubmitting || !userId) return
        setIsSubmitting(true)
        try {
            // 1) Save to Supabase
            const { data: insertData, error: insertError } = await supabase
                .from('writing_submissions')
                .insert([{
                    user_id: userId,
                    task1_response: task1,
                    task2_response: task2,
                    notes1: note1,
                    notes2: note2,
                    word_count_task1: task1.trim().split(/\s+/).filter(Boolean).length,
                    word_count_task2: task2.trim().split(/\s+/).filter(Boolean).length,
                    submitted_at: new Date().toISOString(),
                }])
                .select()
                if (insertError) throw insertError
        
                // 2) Generate a PDF of the student’s work
                const doc = new jsPDF({ unit: 'pt', format: 'a4' })
                doc.setFontSize(12)
                const margin = 40
                const maxLineWidth = 500
                const lines1 = doc.splitTextToSize(task1, maxLineWidth)
                doc.text('Task 1 Response:', margin, 60)
                doc.text(lines1, margin, 80)
                const yAfterTask1 = 80 + lines1.length * 14
                const lines2 = doc.splitTextToSize(task2, maxLineWidth)
                doc.text('Task 2 Response:', margin, yAfterTask1 + 20)
                doc.text(lines2, margin, yAfterTask1 + 40)
        
                const pdfBlob = doc.output('blob')
        
                // 3) POST to your /api/email‑writing route
                const form = new FormData()
                form.append('pdf', pdfBlob, 'submission.pdf')
                form.append('studentId', userId)
                form.append('studentEmail', userId)         // assuming email == userId
                form.append('teacherEmail', 'alanettm113@gmail.com')
                form.append('submissionId', insertData[0].id)
        
                const emailRes = await fetch('/api/email-writing', {
                method: 'POST',
                body: form,
                })
                if (!emailRes.ok) {
                const err = await emailRes.text()
                console.error('Email API error:', err)
                throw new Error('Could not send email')
                }
        
                // 4) Finally, redirect or show a confirmation
                router.push('/dashboard')
            } catch (err: any) {
                console.error('Submission error:', err)
                alert('Sorry, something went wrong. Check the console.')
            } finally {
                setIsSubmitting(false)
            }
            }*/


        // full-screen toggle
    const toggleFull = () => {
        if (!document.fullscreenElement) {
        rootRef.current?.requestFullscreen();
        } else {
        document.exitFullscreen();
        }
    };

    const taskContent = {
        task1: {
        title: 'Task 1: Describe the chart',
        instruction: 'Write a report based on the given chart. You should write at least 150 words.',
        essay: task1,
        setEssay: setTask1,
        note: note1,
        setNote: setNote1,
        showNote: showNote1,
        setShowNote: setShowNote1,
        },
        task2: {
        title: 'Task 2: Opinion Essay',
        instruction: 'Some people think that the best way to increase road safety is to increase the minimum legal age for driving cars and riding motorbikes. To what extent do you agree or disagree?',
        essay: task2,
        setEssay: setTask2,
        note: note2,
        setNote: setNote2,
        showNote: showNote2,
        setShowNote: setShowNote2,
        }
    }[currentTask];

    /*if (!testStarted) {
        return (
        <div className="flex items-center justify-center h-screen bg-orange-50">
            <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Start Writing Test</h1>
            <Button className="text-lg px-6 py-3 bg-green-600 hover:bg-green-700 text-white" onClick={() => setTestStarted(true)}>Start Test</Button>
        </div>
        </div>
        );
    }*/

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

        {/* Header Fixed */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-orange-50 border-b px-4 py-2 shadow">
        <h1 className="font-bold">IELTS Writing Test</h1>


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
                className="bg-amber-300 hover:bg-amber-400 text-white"
                onClick={handleOpenSubmitDialog}
                disabled={isSubmitting}
                >
                {isSubmitting
                ? <Loader2 className="animate-spin w-4 h-4"/>
                : 'Submit Test'}
                <SendHorizontal className="w-5 h-5" />
                </Button>
            </div>
        </header>

        {/* Content area below fixed header */}
        
        <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Topic */}
            <ResizablePanel defaultSize={30} className="flex flex-col border-r">
            <div className="p-4 overflow-auto">
            <h3 className="font-semibold text-lg">{taskContent.title}</h3>
            <p className="text-md text-gray-700 mt-2">{taskContent.instruction}</p>
            </div>
            </ResizablePanel>
            <ResizableHandle />

            {/* Essay */}
            <ResizablePanel defaultSize={50} minSize={20} className="flex flex-colborder-r ">
            <div className="overflow-y-auto flex-1 flex-col flex whitespace-pre-wrap">
                <h3 className="font-medium text-sm mb-2">Your Essay</h3>
                <Textarea
                    style={{ 
                        fontFamily: 'Noto Serif, serif',
                        fontSize: '18px',
                        lineHeight: '28px',
                        fontWeight: 400
                    }}
                    className="flex-1 resize-none mb-1"
                    value={taskContent.essay}
                    onChange={(e) => taskContent.setEssay(e.target.value)}
                    placeholder="Write your essay here..."
                    />
                    <div className="text-right text-md text-gray-600">
                    Word Count: {taskContent.essay.trim().split(/\s+/).filter(Boolean).length}
                    </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle />

                {/* Note */}
                {taskContent.showNote && (
                    <ResizablePanel defaultSize={20} minSize={10} className="flex flex-col">
                    <div className="px-4 py-2 flex justify-between items-center border-b">
                        <h3 className="font-medium text-sm">Your Notes</h3>
                        <Button variant="ghost" size="icon" onClick={() => taskContent.setShowNote(false)}>
                        <EyeOff className="h-4 w-4" />
                        </Button>
                        </div>
                    <div className="p-4 flex-1 overflow-auto">
                    <Textarea
                        style={{
                            fontFamily: 'Noto Serif, serif',
                            fontSize: '18px',
                            lineHeight: '28px',
                            fontWeight: 400,
                        }}
                        className="h-full resize-none"
                        value={taskContent.note}
                        onChange={(e) => taskContent.setNote(e.target.value)}
                        placeholder="Write your notes here..."
                    />
                    </div>
                    </ResizablePanel>
                )}
                {!taskContent.showNote && (
                    <div className="flex items-center justify-center px-2">
                    <Button variant="ghost" size="icon" onClick={() => taskContent.setShowNote(true)}>
                        <Eye className="w-4 h-4"/>
                    </Button>
                    </div>
                )}
                </ResizablePanelGroup>

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

            {/* Task Switch Buttons Centered */}
            <div className="flex border-b bg-amber-50">
            <Button
                variant="ghost"   // ← no built‑in bg‑color
                className={`flex-1 py-2 transition-colors ${
                    currentTask==='task1'
                    ? 'bg-amber-300 text-amber-50'
                    : 'bg-amber-100 text-amber-50 hover:bg-amber-300'
                }`}
                onClick={()=>setCurrentTask('task1')}
                >
                Task 1
                </Button>
            <Button
                variant="ghost"   // ← no built‑in bg‑color
                className={`flex-1 py-2 transition-colors ${
                    currentTask==='task2'
                    ? 'bg-amber-300 text-amber-50'
                    : 'bg-amber-100 text-amber-50 hover:bg-amber-300'
                }`}
                onClick={()=>setCurrentTask('task2')}
                >
                Task 2
                </Button>
            </div>
        </div> 
    );
}
