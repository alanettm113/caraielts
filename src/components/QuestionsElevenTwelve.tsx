'use client'

import React from 'react'

interface Props {
  /** the two-answer array for Q11 (we’ll drive Q11/Q12 status from its length) */
    selected: string[]
    /** when the user (un)checks an option, we cap at 2 answers */
    onChange: (newSel: string[]) => void
    /** the five choices A–E */
    options: string[]
    }

    export default function QuestionsElevenTwelve({ selected, onChange, options }: Props) {
    const toggle = (opt: string) => {
        let next = selected.includes(opt)
        ? selected.filter(x => x !== opt)
        : [...selected, opt]
        // only allow two
        if (next.length > 2) next = next.slice(0, 2)
        onChange(next)
    }

    return (
        <div className="bg-white p-4 rounded shadow space-y-2">
        <p className="font-medium mb-2">
            Which TWO things will employees need to do during their first week in their new office space?
        </p>
        {options.map((opt, i) => (
            <label key={i} className="flex items-center">
            <input
                type="checkbox"
                className="mr-2"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
            />
            {opt}
            </label>
        ))}
        </div>
    )
}
