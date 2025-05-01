// global.d.ts
declare module 'pdfkit' {
    import { Writable } from 'stream'
    // minimal stub — you can expand these as needed
    export default class PDFDocument extends Writable {
        constructor(opts?: any)
        on(event: 'data', listener: (chunk: Buffer) => void): this
        on(event: 'end', listener: () => void): this
        text(text: string): this;
        moveDown(): this;
        // ...add any other methods you use
        }
    }
    