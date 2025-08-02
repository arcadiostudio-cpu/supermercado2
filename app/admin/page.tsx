"use client"

import { useState, useEffect } from "react"
import { supabase, type Product, type Category, type Order, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Upload,
  Link,
  Settings,
  Clock,
  CreditCard,
  Store,
  Phone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SystemSettings {
  delivery_time: string
  delivery_fee: string
  min_order_value: string
  payment_methods: string
  store_phone: string
  store_address: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<SystemSettings>({
    delivery_time: "30-45",
    delivery_fee: "5.00",
    min_order_value: "20.00",
    payment_methods: "dinheiro,pix,cartao",
    store_phone: "(11) 99999-9999",
    store_address: "Rua das Flores, 123 - Centro",
  })
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
    lowStock: 0,
  })

  const { toast } = useToast()
  const router = useRouter()

  // Estados para formulários
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [useImageUpload, setUseImageUpload] = useState(false)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    category_id: "",
    stock_quantity: "",
    image_url: "",
    unit_type: "unidade",
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const checkAuth = async () => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Configuração necessária",
        description: "Configure as variáveis de ambiente do Supabase",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/admin/login")
        return
      }
      setUser(session.user)
    } catch (error) {
      console.error("Erro na autenticação:", error)
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    await Promise.all([fetchProducts(), fetchCategories(), fetchOrders(), fetchStats(), fetchSettings()])
  }

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const { data: productsData, error: productsError } = await supabase.from("products").select("*").order("name")

      if (productsError) throw productsError

      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) throw categoriesError

      const productsWithCategories =
        productsData?.map((product) => ({
          ...product,
          categories: product.category_id ? categoriesData?.find((cat) => cat.id === product.category_id) : null,
        })) || []

      setProducts(productsWithCategories)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const fetchOrders = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    }
  }

  const fetchStats = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data: todayOrdersData } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)

      const todayOrders = todayOrdersData?.length || 0
      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

      const { count: lowStock } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock_quantity", 10)

      setStats({
        todayOrders,
        todayRevenue,
        totalProducts: totalProducts || 0,
        lowStock: lowStock || 0,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const fetchSettings = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase.from("system_settings").select("*")
      if (error) throw error

      const settingsObj: any = {}
      data?.forEach((setting) => {
        settingsObj[setting.setting_key] = setting.setting_value
      })

      setSettings((prev) => ({ ...prev, ...settingsObj }))
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    }
  }

  const saveSettings = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      }))

      for (const update of updates) {
        await supabase.from("system_settings").upsert(update, { onConflict: "setting_key" })
      }

      toast({ title: "Configurações salvas com sucesso!" })
      setIsSettingsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        cost_price: product.cost_price?.toString() || "",
        category_id: product.category_id || "",
        stock_quantity: product.stock_quantity.toString(),
        image_url: product.image_url || "",
        unit_type: (product as any).unit_type || "unidade",
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        name: "",
        description: "",
        price: "",
        cost_price: "",
        category_id: "",
        stock_quantity: "",
        image_url: "",
        unit_type: "unidade",
      })
    }
    setIsProductDialogOpen(true)
  }

  const saveProduct = async () => {
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description || null,
        price: Number.parseFloat(productForm.price),
        cost_price: productForm.cost_price ? Number.parseFloat(productForm.cost_price) : null,
        category_id: productForm.category_id || null,
        stock_quantity: Number.parseInt(productForm.stock_quantity) || 0,
        image_url: productForm.image_url || null,
        unit_type: productForm.unit_type,
        updated_at: new Date().toISOString(),
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)
        if (error) throw error
        toast({ title: "Produto atualizado com sucesso!" })
      } else {
        const { error } = await supabase.from("products").insert(productData)
        if (error) throw error
        toast({ title: "Produto criado com sucesso!" })
      }

      setIsProductDialogOpen(false)
      fetchProducts()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      })
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)
      if (error) throw error
      toast({ title: "Produto excluído com sucesso!" })
      fetchProducts()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error
      toast({ title: "Status do pedido atualizado!" })
      fetchOrders()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800"
      case "em_preparo":
        return "bg-blue-100 text-blue-800"
      case "entregue":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente"
      case "em_preparo":
        return "Em Preparo"
      case "entregue":
        return "Entregue"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "dinheiro":
        return "💵 Dinheiro"
      case "pix":
        return "📱 PIX"
      case "cartao":
        return "💳 Cartão"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Header Melhorado */}
      <header className="bg-white shadow-lg border-b-2 border-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-gray-600 font-medium">Super Mercado Rocha</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsSettingsDialogOpen(true)}
                className="border-blue-200 hover:bg-blue-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-200 hover:bg-red-50 text-red-600 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Cards de Estatísticas Melhorados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pedidos Hoje</CardTitle>
              <ShoppingCart className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs opacity-80 mt-1">pedidos recebidos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Faturamento Hoje</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {stats.todayRevenue.toFixed(2)}</div>
              <p className="text-xs opacity-80 mt-1">receita do dia</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Produtos</CardTitle>
              <Package className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs opacity-80 mt-1">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Estoque Baixo</CardTitle>
              <Package className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.lowStock}</div>
              <p className="text-xs opacity-80 mt-1">produtos em falta</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Melhoradas */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm border">
            <TabsTrigger value="products" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          {/* Aba Produtos Melhorada */}
          <TabsContent value="products">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Gestão de Produtos</CardTitle>
                  <Button onClick={() => openProductDialog()} className="bg-white text-blue-600 hover:bg-gray-100">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
                    >
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
                        <h3 className="font-bold mb-2 line-clamp-2 text-gray-800">{product.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Preço:</span>
                            <span className="font-bold text-green-600">
                              R$ {product.price.toFixed(2)}/{(product as any).unit_type || "un"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estoque:</span>
                            <span
                              className={`font-bold ${product.stock_quantity < 10 ? "text-red-600" : "text-blue-600"}`}
                            >
                              {product.stock_quantity} {(product as any).unit_type || "un"}
                            </span>
                          </div>
                          {product.categories && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {product.categories.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openProductDialog(product)}
                            className="flex-1 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteProduct(product.id)}
                            className="border-red-200 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Pedidos Melhorada */}
          <TabsContent value="orders">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Gestão de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-2 hover:border-blue-200 transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-gray-800">{order.customer_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {order.customer_phone}
                            </div>
                            <p className="text-sm text-gray-600 max-w-md">{order.customer_address}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-2xl text-green-600">R$ {order.total_amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString("pt-BR")}
                            </p>
                            {(order as any).payment_method && (
                              <div className="text-sm">{getPaymentMethodLabel((order as any).payment_method)}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
                            {getStatusLabel(order.status)}
                          </Badge>

                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_preparo">Em Preparo</SelectItem>
                              <SelectItem value="entregue">Entregue</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {order.order_items && order.order_items.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium mb-3 text-gray-800">Itens do pedido:</h4>
                            <div className="space-y-2">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                  <span className="font-medium">
                                    {item.quantity}x {item.product_name}
                                  </span>
                                  <span className="font-bold text-green-600">R$ {item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.notes && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium mb-2 text-blue-800">Observações:</h4>
                            <p className="text-sm text-blue-700">{order.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Produto Melhorado */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-600">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do produto"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="unit_type">Unidade de Medida *</Label>
                <Select
                  value={productForm.unit_type}
                  onValueChange={(value) => setProductForm((prev) => ({ ...prev, unit_type: value }))}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                    <SelectItem value="grama">Grama</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do produto"
                rows={3}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Preço de Venda *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="cost_price">Preço de Custo</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={productForm.cost_price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, cost_price: e.target.value }))}
                  placeholder="0.00"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="stock">Quantidade em Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="0"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={productForm.category_id}
                onValueChange={(value) => setProductForm((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Imagem do Produto</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="image-toggle" className="text-sm">
                    Upload de arquivo
                  </Label>
                  <Switch id="image-toggle" checked={useImageUpload} onCheckedChange={setUseImageUpload} />
                </div>
              </div>

              {useImageUpload ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Arraste uma imagem aqui ou clique para selecionar</p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      // Aqui você implementaria o upload real
                      const file = e.target.files?.[0]
                      if (file) {
                        // Por enquanto, vamos usar um placeholder
                        setProductForm((prev) => ({
                          ...prev,
                          image_url: `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(file.name)}`,
                        }))
                        toast({ title: "Imagem selecionada (modo demo)" })
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              ) : (
                <div>
                  <Label htmlFor="image_url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URL da Imagem
                  </Label>
                  <Input
                    id="image_url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              )}

              {productForm.image_url && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-600">Preview:</Label>
                  <div className="mt-2 w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={productForm.image_url || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={saveProduct}
              className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white"
            >
              {editingProduct ? "Atualizar Produto" : "Criar Produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configurações */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-600 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="delivery_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo de Entrega (minutos)
              </Label>
              <Input
                id="delivery_time"
                value={settings.delivery_time}
                onChange={(e) => setSettings((prev) => ({ ...prev, delivery_time: e.target.value }))}
                placeholder="30-45"
              />
            </div>

            <div>
              <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                value={settings.delivery_fee}
                onChange={(e) => setSettings((prev) => ({ ...prev, delivery_fee: e.target.value }))}
                placeholder="5.00"
              />
            </div>

            <div>
              <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
              <Input
                id="min_order_value"
                type="number"
                step="0.01"
                value={settings.min_order_value}
                onChange={(e) => setSettings((prev) => ({ ...prev, min_order_value: e.target.value }))}
                placeholder="20.00"
              />
            </div>

            <div>
              <Label htmlFor="payment_methods" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Métodos de Pagamento
              </Label>
              <Input
                id="payment_methods"
                value={settings.payment_methods}
                onChange={(e) => setSettings((prev) => ({ ...prev, payment_methods: e.target.value }))}
                placeholder="dinheiro,pix,cartao"
              />
              <p className="text-xs text-gray-500 mt-1">Separar por vírgula: dinheiro,pix,cartao</p>
            </div>

            <div>
              <Label htmlFor="store_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone da Loja
              </Label>
              <Input
                id="store_phone"
                value={settings.store_phone}
                onChange={(e) => setSettings((prev) => ({ ...prev, store_phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="store_address">Endereço da Loja</Label>
              <Textarea
                id="store_address"
                value={settings.store_address}
                onChange={(e) => setSettings((prev) => ({ ...prev, store_address: e.target.value }))}
                placeholder="Rua das Flores, 123 - Centro"
                rows={2}
              />
            </div>

            <Button
              onClick={saveSettings}
              className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700"
            >
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

