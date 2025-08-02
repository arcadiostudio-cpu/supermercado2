import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Super Mercado Rocha - Delivery",
  description: "Sistema de delivery do Super Mercado Rocha - Produtos frescos na sua casa!",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Super Mercado Rocha - Delivery",
    description: "Produtos frescos na sua casa com entrega rápida!",
    url: "https://seu-site.netlify.app",
    siteName: "Super Mercado Rocha",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Super Mercado Rocha - Delivery",
    description: "Produtos frescos na sua casa com entrega rápida!",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
