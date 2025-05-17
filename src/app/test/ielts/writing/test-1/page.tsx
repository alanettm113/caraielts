"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Eye, EyeOff, Loader2, Clock as ClockIcon, Expand, SendHorizontal } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';

export default function WritingTestPage() {
    const router = useRouter();
    const testId = 'test-1';

    const [currentTask, setCurrentTask] = useState<'task1' | 'task2'>('task1');
    const [task1, setTask1] = useState('');
    const [task2, setTask2] = useState('');
    const [note1, setNote1] = useState('');
    const [note2, setNote2] = useState('');
    const [showNote1, setShowNote1] = useState(false);
    const [showNote2, setShowNote2] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [timerExpired, setTimerExpired] = useState(false); // Track timer expiry
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [started, setStarted] = useState(false);
    const [showStartDialog, setShowStartDialog] = useState(true);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentDatetime, setStudentDatetime] = useState('');
    const [submittingTest, setSubmittingTest] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!started) return;
        const iv = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(iv);
                    setTimerExpired(true); // Mark timer as expired
                    handleOpenSubmitDialog();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [started]);

    const handleOpenSubmitDialog = () => {
        setShowSubmitDialog(true);
        if (timerExpired && studentName.trim() && studentDatetime.trim()) {
            handleFinalSubmit(); // Auto-submit if conditions met
        }
    };

    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}`;
    };

    const loadImageAsBase64 = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleFinalSubmit = async () => {
        if (!studentName.trim() || !studentDatetime.trim()) {
            alert('Please fill Full Name and Datetime!');
            return;
        }
        try {
            setSubmittingTest(true);
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const margin = 40;
            const maxWidth = 515;
            let y = 40;

            // Load and add the CARA IELTS logo
            const logoUrl = '/images/CARA_IELTS_Logo.jpg';
            try {
                const logoBase64 = await loadImageAsBase64(logoUrl);
                doc.addImage(logoBase64, 'JPEG', 490, 5, 100, 100); // Top-right corner
            } catch (error) {
                console.error('Failed to load logo:', error);
            }

            doc.setFontSize(14);
            doc.text(`IELTS WRITING TEST ${testId.replace('test-', '')}`, 290, y, { align: 'center' });
            y += 30;
            doc.setFontSize(12);
            doc.text(`Student: ${studentName}`, margin, y);
            y += 20;
            doc.text(`Date: ${studentDatetime}`, margin, y);
            y += 20;
            doc.line(margin, y, 555, y);
            y += 20;

            // Task 1 content
            const wc1 = task1.trim().split(/\s+/).length;
            doc.text(`Task 1 (Word Count: ${wc1}):`, margin, y);
            y += 20;
            const task1Lines = doc.splitTextToSize(task1.trim(), maxWidth);
            for (const line of task1Lines) {
                if (y > 780) {
                    doc.addPage();
                    y = 40;
                }
                doc.text(line, margin, y);
                y += 16;
            }
            y += 20;

            // Task 2 content
            const wc2 = task2.trim().split(/\s+/).length;
            doc.text(`Task 2 (Word Count: ${wc2}):`, margin, y);
            y += 20;
            const task2Lines = doc.splitTextToSize(task2.trim(), maxWidth);
            for (const line of task2Lines) {
                if (y > 780) {
                    doc.addPage();
                    y = 40;
                }
                doc.text(line, margin, y);
                y += 16;
            }

            doc.save(`Writing_Test_${testId.replace('test-', '')}_${studentName.replace(/\s+/g, '_')}.pdf`);
            alert('✅ PDF download started!');
            router.push('/dashboard');
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('❌ Failed to submit test.');
        } finally {
            setSubmittingTest(false);
        }
    };

    const toggleFull = () => {
        if (!document.fullscreenElement) {
            rootRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const taskContentMap: Record<'task1' | 'task2', {
        title: string;
        instruction: React.ReactNode;
        essay: string;
        setEssay: (v: string) => void;
        note: string;
        setNote: (v: string) => void;
        showNote: boolean;
        setShowNote: (v: boolean) => void;
    }> = {
        task1: {
            title: 'WRITING TASK 1',
            instruction: (
                <div>
                    <p className="pace-y-2"> You should spend about 20 minutes on this task.</p>
                    <p className="border px-4 py-2 bg-white font-semibold">
                        The charts below show the changes in ownership of electrical appliances 
                        and amount of time spent doing housework and households in one country 
                        between 1920 and 2019. 
                        Summarize the information by selecting and reporting the main features, and 
                        make comparisons where relevant. </p>
                    <p className="text-md font-semibold"> Write at least 150 words. 
                    </p>
                    <img
                        src="/images/Writing_Test1_Task1.png"
                        alt="WRITING TASK1 IMAGE"
                        className="mt-4 w-full max-w-full h-auto border rounded shadow"
                    />
                </div>
            ),
            essay: task1,
            setEssay: setTask1,
            note: note1,
            setNote: setNote1,
            showNote: showNote1,
            setShowNote: setShowNote1,
        },
        task2: {
            title: 'WRITING TASK 2',
            instruction: (
                <div className="space-y-2">
                    <p>You should spend about 40 minutes on this task.</p>
                    <p>Write about the following topic:</p>
                    <div className="border px-4 py-2 bg-white font-semibold italic">
                        <p>
                            In some countries, more and more people are becoming interested in
                            finding out about the history of the house or building they live in.
                        </p>
                        <p>What are the reasons for this?</p>
                        <p>How can people research this?</p>
                    </div>
                    <p>
                        Give reasons for your answer and include any relevant examples from your
                        own knowledge or experience.
                    </p>
                    <p className="font-semibold">Write at least 250 words.</p>
                </div>
            ),             
            essay: task2,
            setEssay: setTask2,
            note: note2,
            setNote: setNote2,
            showNote: showNote2,
            setShowNote: setShowNote2,
        },
    };

    const taskContent = taskContentMap[currentTask];

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
                                    setStarted(true);
                                    setShowStartDialog(false);
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
                <h1 className="text-lg font-bold">IELTS Writing Test {testId.replace('test-', '')}</h1>
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                    <ClockIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-lg font-semibold text-orange-500">
                        {formatTime(timeLeft)} minutes remaining
                    </span>
                </div>
                <div className="w-1/4 flex justify-end space-x-2">
                    <button onClick={toggleFull} className="p-2">
                        <Expand className="w-5 h-5 text-gray-600" />
                    </button>
                    <Button
                        className="bg-amber-300 hover:bg-amber-400 text-white"
                        onClick={handleOpenSubmitDialog}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit Test'}
                        <SendHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={30} className="flex flex-col border-r">
                    <div className="p-4 overflow-auto">
                        <h3 className="font-semibold text-lg">{taskContent.title}</h3>
                        <p className="text-md text-gray-700 mt-2">{taskContent.instruction}</p>
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col border-r">
                    <div className="overflow-y-auto flex-1 flex-col flex whitespace-pre-wrap">
                        <h3 className="font-medium text-sm mb-2">Your Essay</h3>
                        <Textarea
                            style={{ fontFamily: 'Noto Serif, serif', fontSize: '18px', lineHeight: '28px', fontWeight: 400 }}
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
                {taskContent.showNote ? (
                    <ResizablePanel defaultSize={20} minSize={10} className="flex flex-col">
                        <div className="px-4 py-2 flex justify-between items-center border-b">
                            <h3 className="font-medium text-sm">Your Notes</h3>
                            <Button variant="ghost" size="icon" onClick={() => taskContent.setShowNote(false)}>
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-4 flex-1 overflow-auto">
                            <Textarea
                                style={{ fontFamily: 'Noto Serif, serif', fontSize: '18px', lineHeight: '28px', fontWeight: 400 }}
                                className="h-full resize-none"
                                value={taskContent.note}
                                onChange={(e) => taskContent.setNote(e.target.value)}
                                placeholder="Write your notes here..."
                            />
                        </div>
                    </ResizablePanel>
                ) : (
                    <div className="flex items-center justify-center px-2">
                        <Button variant="ghost" size="icon" onClick={() => taskContent.setShowNote(true)}>
                            <Eye className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </ResizablePanelGroup>

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
                                            if (newValue) setStudentDatetime(newValue.format('DD-MM-YYYY HH:mm'));
                                        }}
                                        className="w-full"
                                    />
                                </LocalizationProvider>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button 
                                variant="ghost" 
                                onClick={() => setShowSubmitDialog(false)} 
                                disabled={timerExpired}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleFinalSubmit} 
                                disabled={submittingTest} 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                {submittingTest ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-6 justify-center py-0.5 bg-amber-50">
                <Button
                    variant="ghost"
                    className={`px-6 py-2 rounded-full border shadow transition cursor-pointer text-sm font-semibold ${
                        currentTask === 'task1'
                            ? 'bg-amber-300 text-white border-amber-400'
                            : 'bg-white text-gray-700 hover:bg-amber-100'
                    }`}
                    onClick={() => setCurrentTask('task1')}
                >
                    Task 1
                </Button>
                <Button
                    variant="ghost"
                    className={`px-6 py-2 rounded-full border shadow transition cursor-pointer text-sm font-semibold ${
                        currentTask === 'task2'
                            ? 'bg-amber-300 text-white border-amber-400'
                            : 'bg-white text-gray-700 hover:bg-amber-100'
                    }`}
                    onClick={() => setCurrentTask('task2')}
                >
                    Task 2
                </Button>
            </div>
        </div>
    );
}