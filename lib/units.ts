export type UnitType = "piece" | "weight" | "volume" | "length"

export const UNIT_TYPES: Record<Uppercase<UnitType>, UnitType> = {
  PIECE: "piece",
  WEIGHT: "weight",
  VOLUME: "volume",
  LENGTH: "length",
}

export interface UnitDef {
  id: string
  name: string
  type: UnitType
  baseMultiplier: number
  symbol: string
}

export const UNITS: Record<string, UnitDef> = {
  PIECE: { id: "pc", name: "Piece", type: UNIT_TYPES.PIECE, baseMultiplier: 1, symbol: "pc" },
  DOZEN: { id: "dozen", name: "Dozen", type: UNIT_TYPES.PIECE, baseMultiplier: 12, symbol: "dozen" },

  GRAM: { id: "g", name: "Gram", type: UNIT_TYPES.WEIGHT, baseMultiplier: 1, symbol: "g" },
  KILOGRAM: { id: "kg", name: "Kilogram", type: UNIT_TYPES.WEIGHT, baseMultiplier: 1000, symbol: "kg" },

  MILLILITER: { id: "ml", name: "Milliliter", type: UNIT_TYPES.VOLUME, baseMultiplier: 1, symbol: "ml" },
  LITER: { id: "l", name: "Liter", type: UNIT_TYPES.VOLUME, baseMultiplier: 1000, symbol: "l" },

  CENTIMETER: { id: "cm", name: "Centimeter", type: UNIT_TYPES.LENGTH, baseMultiplier: 1, symbol: "cm" },
  METER: { id: "m", name: "Meter", type: UNIT_TYPES.LENGTH, baseMultiplier: 100, symbol: "m" },
}

export function getUnitsByType(type: UnitType): UnitDef[] {
  return Object.values(UNITS).filter((unit) => unit.type === type)
}

export function getUnitById(id: string | null | undefined): UnitDef | undefined {
  if (!id) return undefined
  return Object.values(UNITS).find((unit) => unit.id === id)
}

export function convertToBaseUnit(quantity: number, unitId: string): number {
  const unit = getUnitById(unitId)
  if (!unit) return quantity
  return quantity * unit.baseMultiplier
}

export function convertFromBaseUnit(baseQuantity: number, unitId: string): number {
  const unit = getUnitById(unitId)
  if (!unit) return baseQuantity
  return baseQuantity / unit.baseMultiplier
}

export function formatQuantityWithUnit(quantity: number, unitId: string): string {
  const unit = getUnitById(unitId)
  if (!unit) return `${quantity}`

  let formattedQuantity: string
  if (unit.type === UNIT_TYPES.WEIGHT && quantity < 1) {
    formattedQuantity = quantity.toFixed(3).replace(/\.?0+$/, "")
  } else if (unit.type === UNIT_TYPES.PIECE) {
    formattedQuantity = Math.floor(quantity).toString()
  } else {
    formattedQuantity = quantity.toFixed(2).replace(/\.?0+$/, "")
  }

  return `${formattedQuantity} ${unit.symbol}`
}

export function getCommonWeights() {
  return [
    { value: 0.1, label: "100g", unitId: "kg" },
    { value: 0.15, label: "150g", unitId: "kg" },
    { value: 0.25, label: "250g", unitId: "kg" },
    { value: 0.5, label: "500g", unitId: "kg" },
    { value: 1, label: "1kg", unitId: "kg" },
    { value: 2, label: "2kg", unitId: "kg" },
    { value: 5, label: "5kg", unitId: "kg" },
  ]
}


