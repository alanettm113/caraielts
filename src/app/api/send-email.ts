// Next.js (pages directory) API route - runs only on the server
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end()

    const { to, subject, html, answers, testData } = req.body

    // build PDF in memory
    const doc = new PDFDocument()
    const buffers: Buffer[] = []
    doc.on('data', (b) => buffers.push(b))
    await new Promise((r) => doc.on('end', r))
    doc.text(`Listening Test: ${testData.title}`)
    // … render answers …
    doc.end()
    const pdfBuffer = Buffer.concat(buffers)

    // send with nodemailer
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        },
    })

    await transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments: [{ filename: `${testData.title}.pdf`, content: pdfBuffer }],
    })

    res.status(200).json({ ok: true })
}
