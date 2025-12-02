export function isValidEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(barcode[i] ?? "0", 10)
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return Number.parseInt(barcode[12] ?? "0", 10) === checkDigit
}

export function generateEAN13(): string {
  // Indian GS1 prefix '890' + 9 random digits + checksum
  let barcode = "890"
  for (let i = 0; i < 9; i++) {
    barcode += Math.floor(Math.random() * 10).toString()
  }

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(barcode[i] ?? "0", 10)
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return barcode + checkDigit.toString()
}


