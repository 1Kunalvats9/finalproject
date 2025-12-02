"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  getProducts as storageGetProducts,
  saveProducts,
  getCustomers as storageGetCustomers,
  saveCustomers,
  getSales as storageGetSales,
  saveSales,
  getExpenses,
  saveExpenses,
  getLiabilities,
  saveLiabilities,
  getNextBillNumber,
} from "@/lib/storage"

export type Product = {
  id: string
  name: string
  category?: string
  quantity: number
  // Optional cost price used for analytics/exports; kept local only
  costPrice?: number
  retailPrice: number
  wholesalePrice: number
  barcode: string
  hsnSacCode?: string
  unit: string
  originalPrice: number
  discountedPrice: number
  createdAt: string
  updatedAt: string
}

export type CartItem = Product & {
  cartQuantity: number
}

export type Cart = {
  id: string
  name: string
  items: CartItem[]
  customerPhone: string
  createdAt: string
  isActive: boolean
}

export type Customer = {
  id: string
  phoneNumber: string
  createdAt: string
}

export type Sale = {
  id: string
  billNumber: number
  customerId: string
  items: CartItem[]
  total: number
  date: string
}

type AppContextValue = {
  products: Product[]
  customers: Customer[]
  sales: Sale[]
  carts: Cart[]
  activeCartId: string
  loading: boolean
  analytics: {
    totalProducts: number
    inventoryWorth: number
    totalSales: number
    todaysIncome: number
  }
  addProduct: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product>
  updateProduct: (product: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  getProductByBarcode: (barcode: string) => Product | undefined
  getProductByHsnSacCode: (hsn: string) => Product | undefined

  getActiveCart: () => Cart
  getActiveCartItems: () => CartItem[]
  createNewCart: () => string
  deleteCart: (cartId: string) => void
  switchCart: (cartId: string) => void
  updateCartCustomer: (cartId: string, phone: string) => void

  addToCart: (product: Product, quantity?: number) => void
  clearCart: () => void
  checkout: (customerPhone: string, cartId?: string) => Promise<number | null>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [carts, setCarts] = useState<Cart[]>([
    {
      id: "cart-1",
      name: "Cart 1",
      items: [],
      customerPhone: "",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ])
  const [activeCartId, setActiveCartId] = useState("cart-1")
  const [loading, setLoading] = useState(true)

  const refreshFromStorage = useCallback(async () => {
    const [p, c, s] = await Promise.all([storageGetProducts(), storageGetCustomers(), storageGetSales()])
    setProducts(p as Product[])
    setCustomers(c as Customer[])
    setSales(s as Sale[])
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await refreshFromStorage()
      setLoading(false)
    })()
  }, [refreshFromStorage])

  const getActiveCart = useCallback((): Cart => {
    return carts.find((c) => c.id === activeCartId) || carts[0]
  }, [carts, activeCartId])

  const getActiveCartItems = useCallback((): CartItem[] => {
    return getActiveCart().items
  }, [getActiveCart])

  const createNewCart = useCallback((): string => {
    const id = `cart-${Date.now()}`
    const newCart: Cart = {
      id,
      name: `Cart ${carts.length + 1}`,
      items: [],
      customerPhone: "",
      createdAt: new Date().toISOString(),
      isActive: false,
    }
    setCarts((prev) => [...prev, newCart])
    return id
  }, [carts.length])

  const deleteCart = useCallback(
    (cartId: string) => {
      if (carts.length <= 1) return
      setCarts((prev) => {
        const filtered = prev.filter((c) => c.id !== cartId)
        if (cartId === activeCartId && filtered[0]) {
          setActiveCartId(filtered[0].id)
        }
        return filtered
      })
    },
    [carts.length, activeCartId],
  )

  const switchCart = useCallback((cartId: string) => {
    setActiveCartId(cartId)
    setCarts((prev) =>
      prev.map((c) => ({
        ...c,
        isActive: c.id === cartId,
      })),
    )
  }, [])

  const updateCartCustomer = useCallback((cartId: string, phone: string) => {
    setCarts((prev) =>
      prev.map((c) =>
        c.id === cartId
          ? {
              ...c,
              customerPhone: phone,
            }
          : c,
      ),
    )
  }, [])

  const addProduct = useCallback(
    async (data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
      const timestamp = new Date().toISOString()
      const next: Product = {
        ...data,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      const updated = [...products, next]
      setProducts(updated)
      await saveProducts(updated)
      return next
    },
    [products],
  )

  const updateProduct = useCallback(
    async (updatedProduct: Product) => {
      const updated = products.map((p) =>
        p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : p,
      )
      setProducts(updated)
      await saveProducts(updated)
    },
    [products],
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      const updated = products.filter((p) => p.id !== id)
      setProducts(updated)
      await saveProducts(updated)
    },
    [products],
  )

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      setCarts((prev) =>
        prev.map((cart) => {
          if (cart.id !== activeCartId) return cart
          const existingIndex = cart.items.findIndex((item) => item.id === product.id)
          if (existingIndex > -1) {
            const nextItems = [...cart.items]
            nextItems[existingIndex] = {
              ...nextItems[existingIndex],
              cartQuantity: nextItems[existingIndex].cartQuantity + quantity,
            }
            return { ...cart, items: nextItems }
          }
          return {
            ...cart,
            items: [...cart.items, { ...product, cartQuantity: quantity }],
          }
        }),
      )
    },
    [activeCartId],
  )

  const clearCart = useCallback(() => {
    setCarts((prev) =>
      prev.map((cart) => (cart.id === activeCartId ? { ...cart, items: [], customerPhone: "" } : cart)),
    )
  }, [activeCartId])

  const checkout = useCallback(
    async (customerPhone: string, cartId?: string): Promise<number | null> => {
      const targetId = cartId || activeCartId
      const cart = carts.find((c) => c.id === targetId)
      if (!cart || cart.items.length === 0) return null

      let currentCustomers = await storageGetCustomers()
      let customer = (currentCustomers as Customer[]).find((c) => c.phoneNumber === customerPhone)

      if (!customer) {
        customer = {
          id: uuidv4(),
          phoneNumber: customerPhone,
          createdAt: new Date().toISOString(),
        }
        currentCustomers = [...currentCustomers, customer]
        await saveCustomers(currentCustomers)
        setCustomers(currentCustomers as Customer[])
      }

      const updatedProducts = products.map((p) => {
        const cartItem = cart.items.find((i) => i.id === p.id)
        if (!cartItem) return p
        return {
          ...p,
          quantity: Math.max(0, p.quantity - cartItem.cartQuantity),
          updatedAt: new Date().toISOString(),
        }
      })

      const billNumber = await getNextBillNumber()
      const newSale: Sale = {
        id: uuidv4(),
        billNumber,
        customerId: customer.id,
        items: cart.items,
        total: cart.items.reduce((sum, item) => sum + item.discountedPrice * item.cartQuantity, 0),
        date: new Date().toISOString(),
      }

      const nextSales = [...sales, newSale]

      setProducts(updatedProducts)
      setSales(nextSales)

      await Promise.all([saveProducts(updatedProducts), saveSales(nextSales)])

      setCarts((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                items: [],
                customerPhone: "",
              }
            : c,
        ),
      )

      return billNumber
    },
    [activeCartId, carts, products, sales],
  )

  const analytics = useMemo(() => {
    const totalProducts = products.length
    const inventoryWorth = products.reduce((sum, p) => sum + p.discountedPrice * p.quantity, 0)
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0)
    const today = new Date().toDateString()
    const todaysIncome = sales
      .filter((s) => new Date(s.date).toDateString() === today)
      .reduce((sum, s) => sum + s.total, 0)

    return {
      totalProducts,
      inventoryWorth,
      totalSales,
      todaysIncome,
    }
  }, [products, sales])

  const value: AppContextValue = {
    products,
    customers,
    sales,
    carts,
    activeCartId,
    loading,
    analytics,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode: (barcode: string) =>
      products.find((p) => p.barcode === barcode),
    getProductByHsnSacCode: (hsn: string) =>
      products.find((p) => p.hsnSacCode && p.hsnSacCode.trim() === hsn.trim()),
    getActiveCart,
    getActiveCartItems,
    createNewCart,
    deleteCart,
    switchCart,
    updateCartCustomer,
    addToCart,
    clearCart,
    checkout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return ctx
}


