export interface Coffee {
  id: string
  name: string
  price: number
  remainingGrams: number
  available: boolean
}

export interface DailyOrder {
  id: string
  userId: string
  userName: string
  coffeeId: string
  coffeeName: string
  orderDate: string // YYYY-MM-DD 형태
  createdAt: string
}