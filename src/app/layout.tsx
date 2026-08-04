import AuthProvider from "../context/Provider";
import "@/app/global.css";
import { Anton, Archivo } from "next/font/google";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Dezavu",
  description: "Hear it. Name it. Score.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html
        lang="en"
        className={`${anton.variable} ${archivo.variable} bg-black`}
      >
        <body className="bg-black min-h-screen font-sans">{children}</body>
      </html>
    </AuthProvider>
  );
}
