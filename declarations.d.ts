declare module '@react-pdf/renderer' {
    import * as React from 'react';
    export const Document: React.FC<any>;
    export const Page: React.FC<any>;
    export const View: React.FC<any>;
    export const Text: React.FC<any>;
    export const StyleSheet: any;
    export function renderToBuffer(doc: React.ReactElement): Promise<Buffer>;
}