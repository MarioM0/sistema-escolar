import React from "react"
import { AuthProvider } from "../context/auth-context"
import "../globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased">
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  )
}
