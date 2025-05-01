// scripts/import_listening.js
import fs from 'fs'
import pdfParse from 'pdf-parse'
import { createClient } from '@supabase/supabase-js'
import { randomUUID }  from 'crypto'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function main() {
    // 1) Create the test meta
    const testId = randomUUID()
    const { error: errTest } = await supabase
        .from('listening_tests')
        .insert([{
        id:         testId,
        title:      'The International School, Dubai – Orientation & Underwater Sites',
        audio_url:  'https://your.cdn.com/ielts/listening/Orientation.mp3',
        transcript: null,
        }])
    if (errTest) throw errTest

    // 2) Build up the 40 rows, including instruction headers
    const questions = [
        // Instruction row for Q1–10
        {
        number:      0,
        type:        'Instruction',
        question_text:
            'Questions 1–10\nComplete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.\nThe International School, Dubai – General Information and facilities'
        },

        // 1–10: real completion items
        { number:  1, type: 'Completion', question_text: 'Location of school opposite the ___' },
        { number:  2, type: 'Completion', question_text: 'Uniform: a ___ shirt, black trousers or shorts' },
        { number:  3, type: 'Completion', question_text: 'Lessons from 7.20 until ___, Sunday – Thursday' },
        { number:  4, type: 'Completion', question_text: 'Children on Early Start programme are given ___ before school starts' },
        { number:  5, type: 'Completion', question_text: "Current term's spoil activity is ___" },
        { number:  6, type: 'Completion', question_text: 'Music: ___ lessons held on Tuesdays' },
        { number:  7, type: 'Completion', question_text: 'Languages: ___ from age 7' },
        { number:  8, type: 'Completion', question_text: 'Meeting with Head Teacher Day: ___' },
        { number:  9, type: 'Completion', question_text: 'Time: ___' },
        { number: 10, type: 'Completion', question_text: 'Can talk to the ___ teacher in coffee break' },

        // Instruction row for Q11–12
        {
        number:      0,
        type:        'Instruction',
        question_text:
            'Questions 11–12\nChoose TWO letters, A–E.\nWhich TWO things will employees need to do during their first week in their new office space?'
        },
        // 11–12: MCQ choose TWO
        {
        number:       11,
        type:         'MultipleChoice',
        question_text:
            'Which TWO things will employees need to do during their first week in their new office space?',
        options: [
            'A. find out about safety procedures',
            'B. collect a new form of identification',
            'C. move boxes containing documents',
            'D. make a note of any problem that occurs',
            'E. learn about new company technology'
        ]
        },
        {
        number:       12,
        type:         'MultipleChoice',
        question_text:
            'Which TWO things will employees need to do during their first week in their new office space?',
        options: [
            'A. find out about safety procedures',
            'B. collect a new form of identification',
            'C. move boxes containing documents',
            'D. make a note of any problem that occurs',
            'E. learn about new company technology'
        ]
        },

        // Instruction row for Q13–14
        {
        number:      0,
        type:        'Instruction',
        question_text:
            'Questions 13–14\nChoose TWO letters, A–E.\nWhich TWO steps have the company taken to improve the physical environment of employees’ offices?'
        },
        // 13–14: MCQ choose TWO
        {
        number:       13,
        type:         'MultipleChoice',
        question_text:
            'Which TWO steps have the company taken to improve the physical environment of employees’ offices?',
        options: [
            'A. provided comfortable seating',
            'B. installed a new heating system',
            'C. used attractive materials',
            'D. enlarged people’s working space',
            'E. replaced the old type of lights'
        ]
        },
        {
        number:       14,
        type:         'MultipleChoice',
        question_text:
            'Which TWO steps have the company taken to improve the physical environment of employees’ offices?',
        options: [
            'A. provided comfortable seating',
            'B. installed a new heating system',
            'C. used attractive materials',
            'D. enlarged people’s working space',
            'E. replaced the old type of lights'
        ]
        },

        // Instruction row for Q15–20
        {
        number:      0,
        type:        'Instruction',
        question_text:
            'Questions 15–20\nLabel the plan below.\nWrite the correct letter, A–I, next to Questions 15–20.'
        },
        // 15–20: Labelling
        { number: 15, type: 'Labelling', question_text: 'Conference center' },
        { number: 16, type: 'Labelling', question_text: 'New office space' },
        { number: 17, type: 'Labelling', question_text: 'Stores' },
        { number: 18, type: 'Labelling', question_text: 'Finance' },
        { number: 19, type: 'Labelling', question_text: 'Café' },
        { number: 20, type: 'Labelling', question_text: 'IT Department' },

        // Instruction row for Q21–30
        {
        number:      0,
        type:        'Instruction',
        question_text:
            'Questions 21–30\nQuestions 21 and 22: Choose TWO letters, A–E.\nWhich are the TWO main duties for Personal Support Workers (PSWs)?\nQuestions 23 and 24: Choose TWO letters, A–E.\nWhich are the TWO requirements to do the PSW programme?\nQuestions 25–30: Choose SIX answers from the box and write the correct letter, A–G, next to questions 25–30.'
        },
        // 21–22: PSW duties
        {
        number: 21, type: 'MultipleChoice',
        question_text: 'Which are the TWO main duties for Personal Support Workers (PSWs)?',
        options: [
            'A. talking with clients',
            'B. helping clients to eat and drink',
            'C. helping with physical needs',
            'D. ensuring clients are well and safe',
            'E. managing clients’ pills'
        ]
        },
        {
        number: 22, type: 'MultipleChoice',
        question_text: 'Which are the TWO main duties for Personal Support Workers (PSWs)?',
        options: [
            'A. talking with clients',
            'B. helping clients to eat and drink',
            'C. helping with physical needs',
            'D. ensuring clients are well and safe',
            'E. managing clients’ pills'
        ]
        },
        // 23–24: PSW requirements
        {
        number: 23, type: 'MultipleChoice',
        question_text: 'Which are the TWO requirements to do the PSW programme?',
        options: [
            'A. high school completion',
            'B. a maths course',
            'C. a language qualification',
            'D. a clear driving record',
            'E. First Aid training'
        ]
        },
        {
        number: 24, type: 'MultipleChoice',
        question_text: 'Which are the TWO requirements to do the PSW programme?',
        options: [
            'A. high school completion',
            'B. a maths course',
            'C. a language qualification',
            'D. a clear driving record',
            'E. First Aid training'
        ]
        },
        // 25–30: Matching topics to courses
        {
        number:       25, type: 'Matching',
        question_text: 'Topic for course “Understanding is Essential”',
        options: [
            'A. independent living',
            'B. the ageing process stages',
            'C. PSWs’ role in health care',
            'D. workplace communication',
            'E. memory stimulation activities',
            'F. handling stress',
            'G. biological systems'
        ]
        },
        {
        number:       26, type: 'Matching',
        question_text: 'Topic for course “Foundations”',
        options: [
            'A. independent living',
            'B. the ageing process stages',
            'C. PSWs’ role in health care',
            'D. workplace communication',
            'E. memory stimulation activities',
            'F. handling stress',
            'G. biological systems'
        ]
        },
        {
        number:       27, type: 'Matching',
        question_text: 'Topic for course “The Way We Work”',
        options: [
            'A. independent living',
            'B. the ageing process stages',
            'C. PSWs’ role in health care',
            'D. workplace communication',
            'E. memory stimulation activities',
            'F. handling stress',
            'G. biological systems'
        ]
        },
        {
        number:       28, type: 'Matching',
        question_text: 'Topic for course “Residence Care”',
        options: [
            'A. independent living',
            'B. the ageing process stages',
            'C. PSWs’ role in health care',
            'D. workplace communication',
            'E. memory stimulation activities',
            'F. handling stress',
            'G. biological systems'
        ]
        },
        {
        number:       29, type: 'Matching',
        question_text: 'Topic for course “Dynamics”',
        options: [
            'A. independent living',
            'B. the ageing process stages',
            'C. PSWs’ role in health care',
            'D. workplace communication',
            'E. memory stimulation activities',
            'F. handling stress',
            'G. biological systems'
        ]
        },
        {
        number:       30, type: 'Matching',
        question_text: 'Topic for course “The Power Within”',
        options: [
            'A. independent living',
            'B. the ageing process stages',
            'C. PSWs’ role in health care',
            'D. workplace communication',
            'E. memory stimulation activities',
            'F. handling stress',
            'G. biological systems'
        ]
        },

        // Instruction row for Q31–40
        {
        number: 0,
        type:   'Instruction',
        question_text:
            'Questions 31–40\nComplete the notes below.\nWrite ONE WORD ONLY for each answer.\nUnderwater Archaeological Sites'
        },
        // 31–40: final completion
        { number: 31, type: 'Completion', question_text: 'Maoris never developed a ___ form of communication.' },
        { number: 32, type: 'Completion', question_text: 'Discoveries helped understand everyday ___ of ancient communities.' },
        { number: 33, type: 'Completion', question_text: 'Experts applied advanced ___ to improve accuracy.' },
        { number: 34, type: 'Completion', question_text: 'Cause of many wrecks is damage by a violent ___.' },
        { number: 35, type: 'Completion', question_text: 'Some findings used to produce a ___ gallery.' },
        { number: 36, type: 'Completion', question_text: 'Amount of ___ conducted was restricted.' },
        { number: 37, type: 'Completion', question_text: 'Crew used a ___ as defence against pirates.' },
        { number: 38, type: 'Completion', question_text: 'Materials found included a ___ detailing the route.' },
        { number: 39, type: 'Completion', question_text: 'Valuable cargo like ___ motivated explorers.' },
        { number: 40, type: 'Completion', question_text: 'Luxury goods included old ___.' },
    ]

    // 3) Bulk insert all 40 question rows
    const { error: errQs } = await supabase
        .from('listening_questions')
        .insert(
        questions.map(q => ({
            test_id:      testId,
            number:       q.number,
            type:         q.type,
            question_text:q.question_text,
            options:      q.options || null,
            answer:       null
        }))
        )
    if (errQs) throw errQs

    console.log(`✅ Imported all rows for listening test ${testId}`)
    process.exit(0)
    }

    main().catch(err => {
    console.error(err)
    process.exit(1)
})
