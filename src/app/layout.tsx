
import "./globals.css";
import { Roboto } from "next/font/google";
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

  export const metadata = {
    title: "IELTS Web App",
    description: "Practice IELTS Reading, Listening, and Writing tests",
  };

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
