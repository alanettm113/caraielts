'use client'

import { useEffect, useState, useRef  } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { 
    ChevronLeft, 
    ChevronRight, 
    Clock as ClockIcon, 
    PenLine, Loader2, 
    Expand, 
    SendHorizontal,
    SquarePen,
    MoveHorizontal
    } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField'
//import { Scrollbars } from 'react-custom-scrollbars-2'
import jsPDF from 'jspdf'
import dayjs from 'dayjs'

    // ------------------------- DATA -------------------------
    type Question = {
        number: number
        question_text: string
        type: 'dropdown' | 'text' | 'mcq' | 'HeadingMatch' | 'MatchPerson'| 'TFNG' | 'YNNG' | 'HeadingMatch' | 'MultipleChoice' | 'ShortAnswer' | 'GapFill'
        options?: string[]
        answer?: string
    }

    const passages: Record<number, string> = {
    1: `READING PASSAGE 1
    \nYou should spend about 20 minutes on Questions 1–13 which are based on Reading Passage 1 below.
    \nCould urban engineers learn from dance?
    
    \nA The way we travel around cities has a major impact on whether they are sustainable. Transportation is estimated to account for 30% of energy consumption in most of the world’s most developed nations, so lowering the need for energy-using vehicles is essential for decreasing the environmental impact of mobility. But as more and more people move to cities, it is important to think about other kinds of sustainable travel too. The ways we travel affect our physical and mental health, our social lives, our access to work and culture, and the air we breathe. Engineers are tasked with changing how we travel round cities through urban design, but the engineering industry still works on the assumptions that led to the creation of the energy-consuming transport systems we have now: the emphasis placed solely on efficiency, speed, and quantitative data. We need radical changes, to make it healthier, more enjoyable, and less environmentally damaging to travel around cities. 
    
    \nB Dance might hold some of the answers. That is not to suggest everyone should dance their way to work, however healthy and happy it might make us, but rather that the techniques used by choreographers to experiment with and design ovement in dance could provide engineers with tools to stimulate new ideas in city-making. Richard Sennett, an inEluential urbanist and sociologist who has transformed ideas about the way cities are made, argues that urban design has suffered from a separation between mind and body since the introduction of the architectural blueprint. 
    
    \nC Whereas medieval builders improvised and adapted construction through their intimate knowledge of materials and personal experience of the conditions on a site, building designs are now conceived and stored in media technologies that detach the designer from the physical and social realities they are creating. While the design practices created by these new technologies are essential for managing the technical complexity of the modern city, they have the drawback of simplifying reality in the process. 
    
    \nD To illustrate, Sennett discusses the Peachtree Center in Atlanta, USA, a development typical of the modernist approach to urban planning prevalent in the 1970s. Peachtree created a grid of streets and towers intended as a new pedestrian-friendly downtown for Atlanta. According to Sennett, this failed because its designers had invested too much faith in computer-aided design to tell them how it would operate. They failed to take into account that purpose-built street cafés could not operate in the hot sun without the protective awnings common in older buildings, and would need energy-consuming air conditioning instead, or that its giant car park would feel so unwelcoming that it would put people off getting out of their cars. What seems entirely predictable and controllable on screen has unexpected results when translated into reality. 
    
    \nE The same is true in transport engineering, which uses models to predict and shape the way people move through the city. Again, these models are necessary, but they are built on specific world views in which certain forms of efficiency and safety are considered and other experience of the city ignored. Designs that seem logical in models appear counter-intuitive in the actual experience of their users. The guard rails that will be familiar to anyone who has attempted to cross a British road, for example, were an engineering solution to pedestrian safety based on models that prioritize the smooth Elow of traffic. On wide major roads, they often guide pedestrians to specific crossing points and slow down their progress across the road by using staggered access points divide the crossing into two – one for each carriageway. In doing so they make crossings feel longer, introducing psychological barriers greatly impacting those that are the least mobile, and encouraging others to make dangerous crossings to get around the guard rails. These barriers don’t just make it harder to cross the road: they divide communities and decrease opportunities for healthy transport. As a result, many are now being removed, causing disruption, cost, and waste. 
    
    \nF If their designers had had the tools to think with their bodies – like dancers – and imagine how these barriers would feel, there might have been a better solution. In order to bring about fundamental changes to the ways we use our cities, engineering will need to develop a richer understanding of why people move in certain ways, and how this movement affects them. Choreography may not seem an obvious choice for tackling this problem. Yet it shares with engineering the aim of designing patterns of movement within limitations of space. It is an art form developed almost entirely by trying out ideas with the body, and gaining instant feedback on how the results feel. Choreographers have deep understanding of the psychological, aesthetic, and physical implications of different ways of moving. 
    
    \nG Observing the choreographer Wayne McGregor, cognitive scientist David Kirsh described how he ‘thinks with the body’, Kirsh argues that by using the body to simulate outcomes, McGregor is able to imagine solutions that would not be possible using purely abstract thought. This kind of physical knowledge is valued in many areas of expertise, but currently has no place in formal engineering design processes. A suggested method for transport engineers is to improvise design solutions and instant feedback about how they would work from their own experience of them, or model designs at full scale in the way choreographers experiment with groups of dancers. Above all, perhaps, they might learn to design for emotional as well as functional effects. 
    `,

    2: `READING PASSAGE 2
    
    \nYou should spend about 20 minutes on Questions 14–26 which are based on Reading Passage 2 below.
    
    \nShould we try to bring extinct species back to life? 
    
    \nA The passenger pigeon was a legendary species. Flying in vast numbers across North America, with potentially many millions within a single Elock, their migration was once one of nature’s great spectacles. Sadly, the passenger pigeon’s existence came to an end on 1 September 1914, when the last living specimen died at Cincinnati Zoo. Geneticist Ben Novak is lead researcher on an ambitious project which now aims to bring the bird back to life through a process known as ‘de-extinction’. The basic premise involves using cloning technology to turn the DNA of extinct animals into a fertilised embryo, which is carried by the nearest relative still in existence – in this case, the abundant band-tailed pigeon – before being born as a living, breathing animal. Passenger pigeons are one of the pioneering species in this Eield, but they are far from the only ones on which this cutting-edge technology is being trialled. 
    
    \nB In Australia, the thylacine, more commonly known as the Tasmanian tiger, is another extinct creature which genetic scientists are striving to bring back to life. ‘There is no carnivore now in Tasmania that Eills the niche which thylacines once occupied,’ explains Michael Archer of the University of New South Wales. He points out that in the decades since the thylacine went extinct, there has been a spread in a ‘dangerously debilitating’ facial tumour syndrome which threatens the existence of the Tasmanian devils, the island’s other notorious resident. Thylacines would have prevented this spread because they would have killed signiEicant numbers of Tasmanian devils. ‘If that contagious cancer had popped up previously, it would have burned out in whatever region it started. The return of thylacines to Tasmania could help to ensure that devils are never again subjected to risks of this kind.’ 
    
    \nC If extinct species can be brought back to life, can humanity begin to correct the damage it has caused to the natural world over the past few millennia? ‘The idea of de-extinction is that we can reverse this process, bringing species that no longer exist back to life,’ says Beth Shapiro of University of California Santa Cruz’s Genomics Institute. ‘I don’t think that we can do this. There is no way to bring back something that is 100 per cent identical to a species that went extinct a long time ago.’ A more practical approach for long-extinct species is to take the DNA of existing species as a template, ready for the insertion of strands of extinct animal DNA to create something new; a hybrid, based on the living species, but which looks and/or acts like the animal which died out. D This complicated process and questionable outcome begs the question: what is the actual point of this technology? ‘For us, the goal has always been replacing the
    
    \nextinct species with a suitable replacement,’ explains Novak. ‘When it comes to breeding, band-tailed pigeons scatter and make maybe one or two nests per hectare, whereas passenger pigeons were very social and would make 10,000 or more nests in one hectare.’ Since the disappearance of this key species, ecosystems in the eastern US have suffered, as the lack of disturbance caused by thousands of passenger pigeons wrecking trees and branches means there has been minimal need for regrowth. This has left forests stagnant and therefore unwelcoming to the plants and animals which evolved to help regenerate the forest after a disturbance. According to Novak, a hybridized band-tailed pigeon, with the added nesting habits of a passenger pigeon, could, in theory, re-establish that forest disturbance, thereby creating a habitat necessary for a great many other native species to thrive. 
    
    \nE Another popular candidate for this technology is the woolly mammoth. George Church, professor at Harvard Medical School and leader of the Woolly Mammoth Revival Project, has been focusing on cold resistance, the main way in which the extinct woolly mammoth and its nearest living relative, the Asian elephant, differ. By pinpointing which genetic traits made it possible for mammoths to survive the icy climate of the tundra, the project’s goal is to return mammoths, or a mammoth-like species, to the area. ‘My highest priority would be preserving the endangered Asian elephant,’ says Church, ‘expanding their range to the huge ecosystem of the tundra. Necessary adaptations would include smaller ears, thicker hair, and extra insulating fat, all for the purpose of reducing heat loss in the tundra, and all traits found in the now extinct woolly mammoth.’ This repopulation of the tundra and boreal forests of Eurasia and North America with large mammals could also be a useful factor in reducing carbon emissions – elephants punch holes through snow and knock down trees, which encourages grass growth. This grass growth would reduce temperature, and mitigate emissions from melting permafrost. 
    
    \nF While the prospect of bringing extinct animals back to life might capture imaginations, it is, of course, far easier to try to save an existing species which is merely threatened with extinction. ‘Many of the technologies that people have in mind when they think about de-extinction can be used as a form of “genetic rescue”,’ explains Shapiro. She prefers to focus the debate on how this emerging technology could be used to fully understand why various species went extinct in the first place, and therefore how we could use it to make genetic modifications which could prevent mass extinctions in the future. ‘I would also say there’s an incredible moral hazard to not do anything at all,’ she continues. ‘We know that what we are doing today is not enough, and we have to be willing to take some calculated and measured risks.’
    `,
        
    3:`READING PASSAGE 3
    \nYou should spend about 20 minutes on Questions 27–40 which are based on Reading Passage 3 below.
    
    \nHaving a laugh
    
    \nThe ﬁndings of psychological scientists reveal the importance of humour

    Humans start developing a sense of humour as early as six weeks old, when babies begin to laugh and smile in response to stimuli. Laughter is universal across all human cultures and even exists in some form in rats, chimps, and bonobos. Like other human emotions and expressions, laughter and humour psychological scientists with rich resources for studying human psychology, ranging from the development of language to the neuroscience of social perception. 
    
    Theories focusing on the evolution of laughter point to it as an important adaptation for social communication. Take, for example, the recorded laughter in TV comedy shows. Back in 1950, US sound engineer Charley Douglass hated dealing with the unpredictable laughter of live audiences, so started recording his own ‘laugh tracks’. These were intended to help people at home feel like they were in a social situation, uch as a crowded theatre. Douglass even recorded various types of laughter, as well as mixtures of laugher from men, women, and children. In doing so, he picked up on a quality of laughter that is now interesting researchers: a simple ‘haha’ communicates a remarkable amount of socially relevant information. 
    
    In one study conducted in 2016, samples of laughter from pairs of English-speaking students were recorded at the University of California, Santa Cruz. A team made up of more than 30 psychological scientists, anthropologists, and biologists then played these recording to listeners from 24 diverse societies, from indigenous tribes in New Guinea to city-dwellers in India and Europe. Participants were asked whether they thought the people laughing were friends or strangers. On average, the results were remarkably consistent: worldwide, people’s guesses were correct approximately 60% of the time. 
    
    Researchers have also found that diﬀerent types of laughter serve as codes to complex human social hierarchies. A team led by Christopher Oveis from the University of California, San Diego, found that high-status individuals had diﬀerent laughs from low-status individuals, and that strangers’ judgements of an individual’s social status were inﬂuenced by the dominant or submissive quality of their laughter. In their study, 48 male college students were randomly assigned to groups of four, with each group composed of two low-status members, who had just joined their college fraternity group, and two high-status members, older student took a turn at being teased by the others, involving the use of mildly insulting nicknames. Analysis revealed that, as expected, igh-status individuals produced more dominant laughs and fewer submissive laughs relative to the low-status individuals. Meanwhile, low-status individuals were more likely to change their laughter based on their position of power; that is, the newcomers produced more dominant laughs when they were in the ‘powerful’ role of teasers. 
    
    Dominant laughter was higher in pitch, louder, and more variable in tone than submissive laughter. 
    
    A random group of volunteers then listened to an equal number of dominant and submissive laughs from both the high- and low-status individuals, and were asked to estimate the social status of the laughter. In line with predictions, laughers producing dominant laughs were perceived to be signiﬁcantly higher in status than laughers producing submissive laughs. ‘This was particularly true for low-status individuals, who were rated as signiﬁcantly higher in status when displaying a dominant versus submissive laugh,’ Oveis and colleagues note. ‘Thus, by strategically displaying more dominant laughter when the context allows, low-status individuals may achieve higher status in the eyes of others.’ However, high-status individuals were rated as high-statuswhether they produced their natural dominant laugh or tried to do a submissive one. 
    
    Another study, conducted by David Cheng and Lu Wang of Australian National University, was based on the hypothesis that humour might provide a respite from tedious situations in the workplace. This ‘mental break’ might facilitate the replenishment of mental resources. To test this theory, the researchers recruited 74 business students, ostensibly for an experiment on perception. First, the students performed a tedious task in which they had to cross out every instance of the letter ‘e’ over two pages of text. The students then were randomly assigned to watch a video clip eliciting either humour, contentment, or neutral feelings. Some watched a clip of the BBC comedy Mr. Bean, others a relaxing scene with dolphins swimming in the ocean, and others a factual video about the management profession. 
    
    The students then completed a task requiring persistence in which they were asked to guess the potential performance of employees based on provided proﬁles, and were told that making 10 correct assessments in a row would lead to a win. However, the software was programmed such that is was nearly impossible to achieve 10 consecutive correct answers. Participants were allowed to quit the task at any point. Students who had watched the Mr. Bean video ended up spending signiﬁcantly more time working on the task, making twice as many predictions as the other two groups. 
    
    Cheng and Wang then replicated these results in a second study, during which they had participants complete long multiplication questions by hand. Again, participants who watched the humorous video spent signiﬁcantly more time working on this tedious task and completed more questions correctly than did the students in either of the other groups. 
    
    ‘Although humour has been found to help relieve stress and facilitate social relationships, traditional view of task performance implies that individuals should avoid things such as humour that may distract them from the accomplishment of task goals,’ Cheng and Wang conclude. ‘We suggest that humour is not only enjoyable but more importantly, energising.’ 
    ` 
    }

    // Questions for each passage
    const passage1Questions: Question[] = [
        { 
            number: 1, question_text: 
            'reference to an appealing way of using dance that the writer is not proposing', 
            "type": "dropdown",
            "options": ["A", "B", "C", "D", "E", "F", "G"]
        },
        { 
            number: 2, question_text: 
            'an example of a contrast between past and present approaches to building', 
            "type": "dropdown",
            "options": ["A", "B", "C", "D", "E", "F", "G"]
        },
        { 
            number: 3, question_text: 
            'mention of an objective of both dance and engineering', 
            "type": "dropdown",
            "options": ["A", "B", "C", "D", "E", "F", "G"]
        },
        { 
            number: 4, question_text: 
            'reference to an unforeseen problem arising from ignoring the climate', 
            "type": "dropdown",
            "options": ["A", "B", "C", "D", "E", "F", "G"]
        },
        { 
            number: 5, question_text: 
            'why some measures intended to help people are being reversed', 
            "type": "dropdown",
            "options": ["A", "B", "C", "D", "E", "F", "G"]
        },
        { 
            number: 6, question_text: 
            'reference to how transport has an impact on human lives', 
            "type": "dropdown",
            "options": ["A", "B", "C", "D", "E", "F", "G"]
        },
        { 
            number: 7, question_text: 
            'Guard rails were introduced on British roads to improve the _____ of pedestrians.', 
            "type": "text" },
        { 
            number: 8, question_text: 
            'while ensuring that the movement of _____ is not disrupted.', 
            "type": "text" },
        { 
            number: 9, question_text: 
            'Pedestrians are led to access points, and encouraged to cross one _____ at a time.', 
            "type": "text" },
        { 
            number: 10, question_text: 
            'particularly for less _____ people.', 
            "type": "text" },
        { 
            number: 11, question_text: 
            'Another result is that some people cross the road in a _____ way.', 
            "type": "text" },
        { 
            number: 12, question_text: 
            'The guard rails separate _____,', 
            "type": "text" },
        { 
            number: 13, question_text: 
            'and make it more difficult to introduce forms of transport that are _____', 
            "type": "text" }
        ];
        const passage2Questions: Question[]= [
        { 
            number: 14, question_text: 
            'a reference to how further disappearance of multiple species could be avoided.', 
            "type": 'HeadingMatch', 
            options: ['A','B','C','D','E','F'] },
        { 
            number: 15, question_text: 
            'explanation of a way of reproducing an extinct animal using the DNA of only that species', 
            "type": 'HeadingMatch', 
            options: ['A','B','C','D','E','F'] },
        { 
            number: 16, question_text: 
            'reference to a habitat which has suffered following the extinction of a species', 
            "type": 'HeadingMatch', 
            options: ['A','B','C','D','E','F'] },
        { 
            number: 17, question_text: 
            'mention of the exact point at which a particular species became extinct', 
            "type": 'HeadingMatch', 
            options: ['A','B','C','D','E','F'] },
        { 
            number: 18, question_text: 
            'The woolly mammoth revival project: George Church and his team are trying to identify the ______ which enabled mammoths to live in the tundra.', 
            "type": "text" },
        { 
            number: 19, question_text: 
            'Introducing Asian elephants to the tundra would involve adaptations to minimise ______', 
            "type": "text" },
        { 
            number: 20, question_text: 
            'The species would need to have the mammoth-like features of thicker hair, _____ of a reduced size and more _______', 
            "type": "text" },
        { 
            number: 21, question_text: '...', 
            "type": "text" },
        { 
            number: 22, question_text: 
            'impact on the environment could help reduce temperatures and decrease _______', 
            "type": "text" },
        { 
            number: 23, question_text: 
            'Reintroducing an extinct species to its original habitat could improve the health of a particular species living there.', 
            type: 'MatchPerson', 
            options: ['A', 'B', 'C'] },
        { 
            number: 24, question_text: 
            'It is important to concentrate on the causes of an animal’s extinction.', 
            type: 'MatchPerson', 
            options: ['A', 'B', 'C'] },
        { 
            number: 25, question_text: 
            'A species brought back from extinction could have an important beneficial impact on the vegetation of its habitat.', 
            type: 'MatchPerson', 
            options: ['A', 'B', 'C'] },
        { 
            number: 26, question_text: 
            'Our current efforts at preserving biodiversity are insufficient.', 
            type: 'MatchPerson', 
            options: ['A', 'B', 'C'] }
        ]
        const passage3Questions: Question[]= [
        {
            number: 27,
            question_text: "When referring to laughter in the first paragraphs, the writer emphasises",
            type: "mcq",
            options: [
            "A. its impact on language.",
            "B. its function in human culture.",
            "C. its value to scientific research.",
            "D. its universality in animal societies."
            ]
        },
        {
            number: 28,
            question_text: "What does the writer suggest about Charley Douglass?",
            "type": "mcq",
            options: [
            "A. He understood the importance of enjoying humour in a group setting.",
            "B. He believed that TV viewers at home needed to be told when to laugh.",
            "C. He wanted his shows to appeal to audiences across the social spectrum.",
            "D. He preferred shows where audiences were present in the recording studio."
            ]
        },
        {
            number: 29,
            question_text: "What makes the Santa Cruz study particularly significant?",
            "type": "mcq",
            options: [
            "A. the various different types of laughter that were studied",
            "B. the similar results produced by a wide range of cultures",
            "C. the number of different academic disciplines involved",
            "D. the many kinds of people whose laughter was recorded"
            ]
        },
        {
            number: 30,
            question_text: "Which of the following happened in the San Diego study?",
            "type": "mcq",
            options: [
            "A. Some participants became very upset.",
            "B. Participants exchanged roles.",
            "C. Participants who had not met before became friends.",
            "D. Some participants were unable to laugh."
            ]
        },
        {
            number: 31,
            question_text: "In the fifth paragraph, what did the results of the San Diego study suggest?",
            "type": "mcq",
            options: [
            "A. It is clear whether a dominant laugh is produced by a high- or low-status person.",
            "B. Low-status individuals in a position of power will still produce submissive laughs.",
            "C. The submissive laughs of low- and high-status individuals are surprisingly similar.",
            "D. High-status individuals can always be identified by their way of laughing."
            ]
        },
        {
            number: 32,
            question_text: "The benefits of humour: Participants were shown one of three videos, each designed to generate a different kind of _____.",
            "type": "text"
        },
        {
            number: 33,
            question_text: "Those who had watched the _____ video persisted with the task for longer.",
            "type": "text"
        },
        {
            number: 34,
            question_text: "A second study in which participants were asked to perform a particularly _____ task produced similar results.",
            "type": "text"
        },
        {
            number: 35,
            question_text: "Humour not only reduces _____ and helps build social connections...",
            "type": "text"
        },
        {
            number: 36,
            question_text: "...but it may also have a _____ effect on the body and mind.",
            "type": "text"
        },
        {
            number: 37,
            question_text: "Participants in the Santa Cruz study were more accurate at identifying the laughs of friends than those of strangers.",
            "type": "dropdown",
            "options": ["TRUE", "FALSE", "NOT GIVEN"]
        },
        {
            number: 38,
            question_text: "The researchers in the San Diego study were correct in their predictions regarding the behaviour of the high-status individuals.",
            "type": "dropdown",
            "options": ["TRUE", "FALSE", "NOT GIVEN"]
        },
        {
            number: 39,
            question_text: "The participants in the Australian National University study were given a fixed amount of time to complete the task focusing on employee profiles.",
            "type": "dropdown",
            "options": ["TRUE", "FALSE", "NOT GIVEN"]
        },
        {
            number: 40,
            question_text: "Cheng and Wang’s conclusions were in line with established notions regarding task performance.",
            "type": "dropdown",
            "options": ["TRUE", "FALSE", "NOT GIVEN"]
        }
        ]
        const testData = {
            title: 'IELTS Reading Test 1',
            passage1: passages[1],
            passage2: passages[2],
            passage3: passages[3],
            questions: [...passage1Questions, ...passage2Questions, ...passage3Questions]
        };



        // Correct Answers
        const correctAnswers: string[] = [
            "B", "C", "F", "D", "E", "A",       // 1–6 dropdown
            "safety", "traffic", "carriageway", "mobile", "dangerous", "communities", "healthy", // 7–13 text
            "F", "A", "D", "A",                 // 14–17 dropdown
            "genetic traits", "heat loss", "ears", "fat", "emissions", // 18–22 text
            "B", "C", "A", "C",                 // 23–26 dropdown
            "C", "A", "B", "B", "D",            // 27–31 mcq
            "F", "H", "C", "D", "E",            // 32–36 text
            "NOT GIVEN", "TRUE", "FALSE", "FALSE" // 37–40 TFNG
        ];

// ------------------------- COMPONENT -------------------------
export default function ReadingTestPage() {
    const router = useRouter()
    const rootRef = useRef<HTMLDivElement>(null)
    const passageRef = useRef<HTMLDivElement>(null)

    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)

    const [currentPassage, setCurrentPassage] = useState(1);
    const passageContent = passages[currentPassage] || ''
    const allQuestions = [...passage1Questions, ...passage2Questions, ...passage3Questions]

    const [answers, setAnswers] = useState(Array(40).fill(''));

    const [timeLeft, setTimeLeft] = useState(60 * 60)
    const [started, setStarted] = useState(false)

    const [showStartDialog, setShowStartDialog] = useState(true)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)

    const [studentName, setStudentName] = useState('')
    const [studentDatetime, setStudentDatetime] = useState('')

    const [submittingTest, setSubmittingTest] = useState(false)

    const [selRect, setSelRect] = useState<{ top: number; left: number } | null>(null)
    const [highlightColor, setHighlightColor] = useState<string>('')

    const handleOpenSubmitDialog = () => {
        setShowSubmitDialog(true)
    }

    // countdown timer + auto‑submit at zero
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

    // Revised timer display format to show "X minutes remaining"
    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`; // e.g., "25 minutes remaining"
    }

    const handleSubmit = () => {
        const trimmedAnswers = answers.map((a) => a.trim().toUpperCase())
        const correct = correctAnswers.map((a) => a.trim().toUpperCase())
            
            let score = 0
            for (let i = 0; i < 40; i++) {
            if (trimmedAnswers[i] === correct[i]) score++
            }
            
            let band = 0
            if (score >= 39) band = 9.0
            else if (score >= 37) band = 8.5
            else if (score >= 35) band = 8.0
            else if (score >= 33) band = 7.5
            else if (score >= 30) band = 7.0
            else if (score >= 27) band = 6.5
            else if (score >= 23) band = 6.0
            else if (score >= 19) band = 5.5
            else if (score >= 15) band = 5.0
            else if (score >= 12) band = 4.5
            else if (score >= 10) band = 4.0
            else if (score >= 8) band = 3.5
            else if (score >= 6) band = 3.0
            else if (score >= 4) band = 2.5
            else band = 2.0
        
            alert(`✅ Test completed!\nCorrect: ${score}/40\nBand Score: ${band.toFixed(1)}`)
        }
    // record one answer
    const handleAnswerChange = (n: number, v: string) => {
        setAnswers((prev) => {
        const updated = [...prev];
          updated[n - 1] = v; // adjust for 0-based index
        return updated;
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
        doc.setFont('Times', 'normal'); // Fix font spacing
        const margin = 40;
        const maxWidth = 400;
        let y = 20;

        const testId = testData?.title?.split(' ').pop() || '1';
        const testTitle = `IELTS READING TEST ${testId}`;

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
        const userAns = (answers[q.number - 1] as string || '').trim().toLowerCase()
        const correct = correctAnswers[q.number - 1]?.trim().toLowerCase();
        if (userAns && correct && userAns === correct) correctCount++})

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
        const rawAnswer = answers[q.number - 1] ?? '[No Answer]';

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

        // Highlight wrapper with fallback
    const handleHighlight = (e: MouseEvent) => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) return

        const range = sel.getRangeAt(0)
        const parent = range.commonAncestorContainer as HTMLElement
        const toolbar = document.querySelector('.highlight-toolbar')
        if (toolbar?.contains(parent)) return

        const rect = range.getBoundingClientRect()
        setSelRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
        })
    }

    const highlight = (color: string) => {
        const sel = window.getSelection()
        if (!sel || !sel.rangeCount) return
        const range = sel.getRangeAt(0)

        const span = document.createElement('span')
        span.style.backgroundColor = color
        span.className = 'highlighted'

        try {
        range.surroundContents(span)
        } catch {
        const frag = range.extractContents()
        span.appendChild(frag)
        range.insertNode(span)
        }

        sel.removeAllRanges()
        setSelRect(null)
    }

    const removeHighlight = () => {
        const sel = window.getSelection()
        if (!sel || !sel.rangeCount) return
        const range = sel.getRangeAt(0)
        const parent = range.commonAncestorContainer.parentElement
        if (parent?.classList.contains('highlighted')) {
        const text = document.createTextNode(parent.innerText)
        parent.replaceWith(text)
        sel.removeAllRanges()
        setSelRect(null)
        }
    }    

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

    // full-screen toggle
    const toggleFull = () => {
        if (!document.fullscreenElement) {
        rootRef.current?.requestFullscreen();
        } else {
        document.exitFullscreen();
        }
    }
    
    const handleHighlightClick = () => {
        highlight(highlightColor)
    }
    
    return (
        <div ref={rootRef} className="font-['Roboto'] flex flex-col w-full h-screen overflow-hidden bg-orange-50">
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
            <h1 className="text-lg font-bold">IELTS Reading Test {testData.title.split(' ').pop()}</h1>
            
             {/* Center Timer */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                <ClockIcon className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold text-orange-500">
                {formatTime(timeLeft)}
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

        {/* Highlight Tools */}
        {selRect && (
            <div
            className="highlight-toolbar absolute z-50 flex items-center gap-1 p-1 bg-white border rounded shadow"
            style={{
                top: selRect.top - window.scrollY - 40,
                left: selRect.left - window.scrollX
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
        {/*<Scrollbars
        autoHide
        renderThumbVertical={({ style, ...props }) => (
            <div
            {...props}
            style={{
                ...style,
                backgroundColor: '#dfdfdf',
                borderRadius: '6px',
                border: '1px solid #fff',
                width: '4px'
            }}
            />
        )}
        >*/}
        {/* Main Layout  */}
        <div className="h-[calc(100vh-64px)] flex flex-grow overflow-hidden bg-white rounded shadow">
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-0">
            {/* PASSAGE */}
            <ResizablePanel
                defaultSize={50}
                minSize={20}
                className="pt-4 relative flex flex-col font-['Roboto'] text-sm leading-relaxed px-1.5"
                onMouseUp={onMouseUp}
                >
                {/* Scrollable passage */}
                <div className="flex-1 pb-10 overflow-auto text-justify whitespace-pre-line leading-relaxed tracking-wide">
                {passageContent
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map((line, idx) => (
                    <p key={idx}>{line.trim()}</p>
                    ))}
                </div>

            </ResizablePanel>
            <ResizableHandle className="relative group">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 transition-opacity">
                <MoveHorizontal className="w-6 h-6 inline-block text-gray-500" />
                
            </div>
            </ResizableHandle>

            {/* RIGHT: Questions */}
            <ResizablePanel
                defaultSize={50}
                minSize={20}
                className="flex flex-col pr-0 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-10"
            >
                <div className="overflow-y-auto flex-1">
                {(currentPassage === 1 ? passage1Questions :
                currentPassage === 2 ? passage2Questions :
                passage3Questions).map((q) => (
                    <div key={q.number} id={`q-${q.number}`} className="mb-5">
                    <p className="text-sm font-medium mb-1">
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

                    {q.type === 'dropdown' && (
                        <select
                        className="w-full border px-2 py-1"
                        value={answers[q.number - 1]}
                        onChange={(e) => handleAnswerChange(q.number - 1, e.target.value)}
                        >
                        <option value="">-- Select --</option>
                        {q.options?.map((opt) => (
                            <option key={opt}>{opt}</option>
                        ))}
                        </select>
                    )}

                    {q.type === 'text' && (
                        <input
                        type="text"
                        className="w-full border px-2 py-1"
                        value={answers[q.number - 1]}
                        onChange={(e) => handleAnswerChange(q.number - 1, e.target.value)}
                        />
                    )}

                    {q.type === 'mcq' && (
                        <div className="space-y-1">
                        {q.options?.map((opt) => (
                            <label key={opt} className="block">
                            <input
                                type="radio"
                                name={`q-${q.number}`}
                                value={opt}
                                checked={answers[q.number - 1] === opt}
                                onChange={() => handleAnswerChange(q.number - 1, opt)}
                                className="mr-2"
                            />
                            {opt}
                            </label>
                        ))}
                        </div>
                    )}
                    </div>
                ))}
            </div>
            
            {/* Bottom Question Navigation */}
            {/*absolute inset-x-0 bottom-0 bg-amber-50 border-t border-amber-200 p-2 z-10*/}
            <div className="absolute inset-x-0 bottom-0 bg-orange-50 shadow border-t p-2 z-10 overflow-x-auto "> 
            {/*max-w-[2000px] mx-auto flex justify-center flex-wrap gap-1*/}
            <div className="max-w-[2000px] mx-auto flex justify-center space-x-1 ">
                {allQuestions.map((q) => {
                const passageOfQ = q.number <= 13 ? 1 : q.number <= 26 ? 2 : 3
                return (
                    <button
                    key={q.number}
                    onClick={() => {
                        setCurrentPassage(passageOfQ)
                        setTimeout(() => {
                        const el = document.getElementById(`q-${q.number}`)
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }, 100)
                    }}
                    className={`w-7 h-7 border rounded-full text-sm font-medium transition-all duration-150 ${
                        answers[q.number - 1]
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-100'
                    }`}
                    >
                    {q.number}
                    </button>
                )
                })}
            </div>
            </div>
            </ResizablePanel>
        </ResizablePanelGroup>
        </div>
        {/*</Scrollbars>*/}
        

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
        </div>
    )
}
