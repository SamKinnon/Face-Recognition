import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Face Recognition System",
  description: "Advanced biometric authentication using facial recognition technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Face Recognition System
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/register">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav> */}
        {children}
      </body>
    </html>
  )
}
