import localforage from "localforage"

type ProductRecord = any
type CustomerRecord = any
type SaleRecord = any
type PartyRecord = any
type ExpenseRecord = any
type LiabilityRecord = any

const STORE_NAME = "apnidukaan-portal"

if (typeof window !== "undefined") {
  localforage.config({
    name: STORE_NAME,
    storeName: "inventory",
    driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  })
}

const cache: {
  products: ProductRecord[] | null
  customers: CustomerRecord[] | null
  sales: SaleRecord[] | null
  parties: PartyRecord[] | null
  lastUpdate: number
} = {
  products: null,
  customers: null,
  sales: null,
  parties: null,
  lastUpdate: 0,
}

const CACHE_DURATION = 5 * 60 * 1000

const isCacheValid = (key: keyof typeof cache) => {
  return cache[key] !== null && Date.now() - cache.lastUpdate < CACHE_DURATION
}

const migrateLocalStorageToLocalForage = async (key: string) => {
  if (typeof window === "undefined") return
  const localStorageData = window.localStorage.getItem(key)
  if (!localStorageData) return

  try {
    const parsedData = JSON.parse(localStorageData)
    const localforageData = await localforage.getItem(key)
    if (!localforageData || (Array.isArray(localforageData) && localforageData.length === 0)) {
      await localforage.setItem(key, parsedData)
      window.localStorage.removeItem(key)
    }
  } catch (error) {
    console.error(`Error migrating '${key}' from localStorage to localForage:`, error)
  }
}

export const getProducts = async (): Promise<ProductRecord[]> => {
  try {
    if (isCacheValid("products")) {
      return cache.products || []
    }

    await migrateLocalStorageToLocalForage("products")
    const products = ((await localforage.getItem("products")) as ProductRecord[] | null) || []
    cache.products = products
    cache.lastUpdate = Date.now()
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return cache.products || []
  }
}

export const saveProducts = async (products: ProductRecord[]) => {
  try {
    await localforage.setItem("products", products)
    cache.products = products
    cache.lastUpdate = Date.now()
  } catch (error) {
    console.error("Error saving products:", error)
  }
}

export const getCustomers = async (): Promise<CustomerRecord[]> => {
  try {
    if (isCacheValid("customers")) {
      return cache.customers || []
    }

    await migrateLocalStorageToLocalForage("customers")
    const customers = ((await localforage.getItem("customers")) as CustomerRecord[] | null) || []
    cache.customers = customers
    cache.lastUpdate = Date.now()
    return customers
  } catch (error) {
    console.error("Error fetching customers:", error)
    return cache.customers || []
  }
}

export const saveCustomers = async (customers: CustomerRecord[]) => {
  try {
    await localforage.setItem("customers", customers)
    cache.customers = customers
    cache.lastUpdate = Date.now()
  } catch (error) {
    console.error("Error saving customers:", error)
  }
}

export const getSales = async (): Promise<SaleRecord[]> => {
  try {
    if (isCacheValid("sales")) {
      return cache.sales || []
    }
    await migrateLocalStorageToLocalForage("sales")
    const sales = ((await localforage.getItem("sales")) as SaleRecord[] | null) || []
    cache.sales = sales
    cache.lastUpdate = Date.now()
    return sales
  } catch (error) {
    console.error("Error fetching sales:", error)
    return cache.sales || []
  }
}

export const saveSales = async (sales: SaleRecord[]) => {
  try {
    await localforage.setItem("sales", sales)
    cache.sales = sales
    cache.lastUpdate = Date.now()
  } catch (error) {
    console.error("Error saving sales:", error)
  }
}

export const getParties = async (): Promise<PartyRecord[]> => {
  try {
    if (isCacheValid("parties")) {
      return cache.parties || []
    }
    await migrateLocalStorageToLocalForage("parties")
    const parties = ((await localforage.getItem("parties")) as PartyRecord[] | null) || []
    cache.parties = parties
    cache.lastUpdate = Date.now()
    return parties
  } catch (error) {
    console.error("Error fetching parties:", error)
    return cache.parties || []
  }
}

export const saveParties = async (parties: PartyRecord[]) => {
  try {
    await localforage.setItem("parties", parties)
    cache.parties = parties
    cache.lastUpdate = Date.now()
  } catch (error) {
    console.error("Error saving parties:", error)
  }
}

export const clearCache = () => {
  cache.products = null
  cache.customers = null
  cache.sales = null
  cache.parties = null
  cache.lastUpdate = 0
}

export const getExpenses = async (): Promise<ExpenseRecord[]> => {
  try {
    if (typeof window === "undefined") return []
    const expensesJson = window.localStorage.getItem("expenses_data")
    return expensesJson ? (JSON.parse(expensesJson) as ExpenseRecord[]) : []
  } catch (error) {
    console.error("Error getting expenses from storage:", error)
    return []
  }
}

export const saveExpenses = async (expenses: ExpenseRecord[]) => {
  try {
    if (typeof window === "undefined") return
    window.localStorage.setItem("expenses_data", JSON.stringify(expenses))
  } catch (error) {
    console.error("Error saving expenses to storage:", error)
  }
}

export const getLiabilities = async (): Promise<LiabilityRecord[]> => {
  try {
    if (typeof window === "undefined") return []
    const liabilitiesJson = window.localStorage.getItem("liabilities_data")
    return liabilitiesJson ? (JSON.parse(liabilitiesJson) as LiabilityRecord[]) : []
  } catch (error) {
    console.error("Error getting liabilities from storage:", error)
    return []
  }
}

export const saveLiabilities = async (liabilities: LiabilityRecord[]) => {
  try {
    if (typeof window === "undefined") return
    window.localStorage.setItem("liabilities_data", JSON.stringify(liabilities))
  } catch (error) {
    console.error("Error saving liabilities to storage:", error)
  }
}

export const getNextBillNumber = async (): Promise<number> => {
  try {
    const currentBillNumber = ((await localforage.getItem("current_bill_number")) as number | null) || 0
    const nextBillNumber = currentBillNumber + 1
    await localforage.setItem("current_bill_number", nextBillNumber)
    return nextBillNumber
  } catch (error) {
    console.error("Error getting next bill number:", error)
    return 1
  }
}

export const getCurrentBillNumber = async (): Promise<number> => {
  try {
    return ((await localforage.getItem("current_bill_number")) as number | null) || 0
  } catch (error) {
    console.error("Error getting current bill number:", error)
    return 0
  }
}


