"use client"

import { useState, useEffect } from "react"
import { supabase, type Product, type Category, type CartItem, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Plus, Minus, MapPin, Phone, Clock, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Dados do cliente
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase não está configurado. Usando dados de exemplo.")
      // Definir dados de exemplo para desenvolvimento
      setCategories([
        { id: "1", name: "Frutas e Verduras", created_at: new Date().toISOString() },
        { id: "2", name: "Laticínios", created_at: new Date().toISOString() },
        { id: "3", name: "Padaria", created_at: new Date().toISOString() },
      ])
      setProducts([
        {
          id: "1",
          name: "Banana Prata",
          description: "Banana prata fresca por kg",
          price: 4.99,
          cost_price: 3.5,
          category_id: "1",
          image_url: "/placeholder.svg?height=200&width=200",
          stock_quantity: 50,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          categories: { id: "1", name: "Frutas e Verduras", created_at: new Date().toISOString() },
        },
        {
          id: "2",
          name: "Leite Integral 1L",
          description: "Leite integral pasteurizado",
          price: 5.49,
          cost_price: 4.2,
          category_id: "2",
          image_url: "/placeholder.svg?height=200&width=200",
          stock_quantity: 30,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          categories: { id: "2", name: "Laticínios", created_at: new Date().toISOString() },
        },
      ])
      setLoading(false)
      return
    }

    fetchProducts()
    fetchCategories()
  }, [])

  // Vou corrigir a função fetchProducts para usar uma abordagem mais robusta

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      // Primeiro, vamos buscar os produtos
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name")

      if (productsError) throw productsError

      // Depois, vamos buscar as categorias separadamente
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) throw categoriesError

      // Combinar os dados manualmente
      const productsWithCategories =
        productsData?.map((product) => ({
          ...product,
          categories: product.category_id ? categoriesData?.find((cat) => cat.id === product.category_id) : null,
        })) || []

      setProducts(productsWithCategories)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category_id === selectedCategory)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1 }]
    })
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId))
    } else {
      setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const submitOrder = async () => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Configuração necessária",
        description: "Configure o Supabase para enviar pedidos reais",
        variant: "destructive",
      })
      return
    }

    if (!customerData.name || !customerData.phone || !customerData.address) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive",
      })
      return
    }

    try {
      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_address: customerData.address,
          total_amount: getTotalPrice(),
          notes: customerData.notes,
          status: "pendente",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Criar itens do pedido
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Limpar carrinho e mostrar confirmação
      setCart([])
      setIsCheckoutOpen(false)
      setIsOrderConfirmed(true)

      toast({
        title: "Pedido realizado!",
        description: "Seu pedido foi enviado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o pedido",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Super Mercado Rocha</h1>
              <p className="text-blue-100 text-sm">Delivery rápido e confiável</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Filtros de Categoria */}
      <div className="bg-white border-b sticky top-[88px] z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="whitespace-nowrap"
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Produtos */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || "/placeholder.svg?height=200&width=200&query=produto"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">R$ {product.price.toFixed(2)}</span>
                  {product.categories && (
                    <Badge variant="secondary" className="text-xs">
                      {product.categories.name}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button onClick={() => addToCart(product)} className="w-full bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </main>

      {/* Modal do Carrinho */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Seu Carrinho ({getTotalItems()} {getTotalItems() === 1 ? "item" : "itens"})
            </DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={item.product.image_url || "/placeholder.svg?height=60&width=60&query=produto"}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-blue-600 font-bold">R$ {item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setIsCartOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Checkout */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo *</label>
              <Input
                value={customerData.name}
                onChange={(e) => setCustomerData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <Input
                value={customerData.phone}
                onChange={(e) => setCustomerData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Endereço completo *</label>
              <Textarea
                value={customerData.address}
                onChange={(e) => setCustomerData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro, cidade..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <Textarea
                value={customerData.notes}
                onChange={(e) => setCustomerData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ponto de referência, instruções especiais..."
                rows={2}
              />
            </div>

            {/* Resumo do pedido */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Resumo do pedido:</h4>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm mb-1">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-blue-600">R$ {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={submitOrder} className="w-full bg-red-600 hover:bg-red-700">
              Confirmar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação */}
      <Dialog open={isOrderConfirmed} onOpenChange={setIsOrderConfirmed}>
        <DialogContent className="max-w-md text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-green-600">Pedido Confirmado!</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-6">
            Seu pedido foi recebido e está sendo preparado. Entraremos em contato em breve!
          </p>
          <Button onClick={() => setIsOrderConfirmed(false)} className="w-full">
            Continuar Comprando
          </Button>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-blue-400">Super Mercado Rocha</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 text-red-400" />
                <span>Rua das Flores, 123 - Centro</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 text-red-400" />
                <span>(11) 99999-9999</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-red-400" />
                <span>Seg-Dom: 7h às 22h</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-xs">© 2024 Super Mercado Rocha. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
