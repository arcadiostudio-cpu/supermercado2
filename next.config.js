/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para export estático (Netlify)
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: "out",

  // Configurações de imagem para export estático
  images: {
    unoptimized: true,
    domains: ["placeholder.svg", "via.placeholder.com"],
  },

  // Remover rewrites que não funcionam com export
  // async rewrites() {
  //   return []
  // },

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  // ESLint config
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript config
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuração experimental para export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
