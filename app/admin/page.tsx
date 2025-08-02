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
import { Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    category_id: "",
    stock_quantity: "",
    image_url: "",
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
    await Promise.all([fetchProducts(), fetchCategories(), fetchOrders(), fetchStats()])
  }

  // Vou corrigir a função fetchProducts no painel admin também

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) return
    try {
      // Buscar produtos
      const { data: productsData, error: productsError } = await supabase.from("products").select("*").order("name")

      if (productsError) throw productsError

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) throw categoriesError

      // Combinar os dados
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

      // Pedidos de hoje
      const { data: todayOrdersData } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)

      const todayOrders = todayOrdersData?.length || 0
      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Total de produtos
      const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

      // Produtos com estoque baixo
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Super Mercado Rocha</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.todayRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <Package className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          {/* Aba Produtos */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestão de Produtos</CardTitle>
                  <Button onClick={() => openProductDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="relative">
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
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Preço:</strong> R$ {product.price.toFixed(2)}
                          </p>
                          <p>
                            <strong>Estoque:</strong> {product.stock_quantity}
                          </p>
                          {product.categories && (
                            <Badge variant="secondary" className="text-xs">
                              {product.categories.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => openProductDialog(product)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)}>
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

          {/* Aba Pedidos */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{order.customer_name}</h3>
                            <p className="text-sm text-gray-600">{order.customer_phone}</p>
                            <p className="text-sm text-gray-600">{order.customer_address}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">R$ {order.total_amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>

                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-40">
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
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium mb-2">Itens do pedido:</h4>
                            <div className="space-y-1">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>
                                    {item.quantity}x {item.product_name}
                                  </span>
                                  <span>R$ {item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.notes && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium mb-1">Observações:</h4>
                            <p className="text-sm text-gray-600">{order.notes}</p>
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

      {/* Dialog de Produto */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do produto"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do produto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço de Venda *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
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
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={productForm.category_id}
                onValueChange={(value) => setProductForm((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
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

            <div>
              <Label htmlFor="stock">Quantidade em Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={productForm.image_url}
                onChange={(e) => setProductForm((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <Button onClick={saveProduct} className="w-full">
              {editingProduct ? "Atualizar Produto" : "Criar Produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
