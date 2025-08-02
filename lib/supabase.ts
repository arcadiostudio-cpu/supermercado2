import { createClient } from "@supabase/supabase-js"

// Função para obter as variáveis de ambiente de forma segura
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return { supabaseUrl, supabaseAnonKey }
}

// Criar cliente Supabase com fallback para evitar erros de build
const createSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

  // Durante o build, usar valores dummy para evitar erros
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      // Server-side durante build - usar valores dummy
      return createClient("https://dummy.supabase.co", "dummy-key")
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://dummy.supabase.co" &&
    supabaseAnonKey !== "dummy-key"
  )
}

// Tipos para TypeScript
export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  cost_price: number | null
  category_id: string | null
  image_url: string | null
  stock_quantity: number
  active: boolean
  created_at: string
  updated_at: string
  categories?: Category | null
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_amount: number
  status: "pendente" | "em_preparo" | "entregue" | "cancelado"
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}
