"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

type Props = {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  margin?: number
}

export function BarcodeDisplay({
  value,
  width = 2,
  height = 80,
  displayValue = false,
  fontSize = 14,
  margin = 4,
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!ref.current || !value) return
    try {
      JsBarcode(ref.current, value, {
        format: "EAN13",
        width,
        height,
        displayValue,
        fontSize,
        margin,
        text: value,
      })
    } catch (err) {
      console.error("Failed to render barcode", err)
    }
  }, [value, width, height, displayValue, fontSize, margin])

  if (!value) {
    return null
  }

  return (
    <div className="flex justify-center p-3">
      <svg ref={ref} className="h-auto w-full max-w-xs" />
    </div>
  )
}


