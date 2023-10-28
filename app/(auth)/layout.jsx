import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import '../globals.css'

export const metadata = {
    title: 'Auth',
    description: 'Authentication provided by Clerk'
}

const inter = Inter({subsets: ['latin']})

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.className} bg-dark-1 `}>
                  <div className="w-full flex items-center justify-center min-h-screen">
                    {children}
                  </div>
                </body>
            </html>
        </ClerkProvider>
    )
}