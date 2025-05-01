// lib/email.ts
import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit' // or wherever you build the PDF

export async function sendEmailWithPdf({
    to,
    subject,
    html,
    answers,
    testData
    }: {
    to: string
    subject: string
    html: string
    answers: Record<number,string|string[]>
    testData: any
    }) {
    // --- render your PDF in memory ---
    const doc = new PDFDocument()
    const buffers: Buffer[] = []
    doc.on('data', function (this: PDFDocument, chunk: Buffer) {
        buffers.push(chunk)
        })
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers)

        // --- send via SMTP ---
        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
        })

        await transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments: [
            {
            filename: `${testData.title}.pdf`,
            content: pdfBuffer,
            }
        ]
        })
    })

    // generate some simple PDF content
    doc.text(`Listening Test: ${testData.title}`)
    doc.moveDown()
    doc.text(`Answers:`)
    Object.entries(answers).forEach(([num, ans]) => {
        doc.text(`${num}: ${Array.isArray(ans)?ans.join(', '):ans}`)
    })
    doc.end()
}
