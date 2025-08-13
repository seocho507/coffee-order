'use client'

import { Coffee } from '@/types/coffee'
import { QUANTITY_RESTRICTIONS } from '@/lib/config/order-restrictions'

interface CoffeeMenuProps {
  coffees: Coffee[] | undefined
  coffeesLoading: boolean
  remainingOrders: number
  orderTimeAvailable: boolean
  nextOrderTime: string
  onOrder: (coffee: Coffee) => void
  isCreatingOrder?: boolean
}

export default function CoffeeMenu({ 
  coffees, 
  coffeesLoading, 
  remainingOrders, 
  orderTimeAvailable, 
  nextOrderTime, 
  onOrder,
  isCreatingOrder = false
}: CoffeeMenuProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">커피 메뉴</h2>

        {coffeesLoading ? (
          <div className="text-center py-8">
            <div className="text-lg">커피 메뉴 로딩 중...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coffees?.map((coffee) => (
              <div key={coffee.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{coffee.name}</h3>
                <p className="text-sm text-gray-600">₩{coffee.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">남은 용량: {coffee.remainingGrams}g</p>
                <button
                  onClick={() => onOrder(coffee)}
                  disabled={
                    isCreatingOrder ||
                    !coffee.available || 
                    coffee.remainingGrams < QUANTITY_RESTRICTIONS.MIN_GRAMS_REQUIRED || 
                    remainingOrders <= 0 || 
                    !orderTimeAvailable
                  }
                  className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingOrder
                    ? '주문 처리 중...'
                    : !coffee.available
                    ? '품절'
                    : coffee.remainingGrams < QUANTITY_RESTRICTIONS.MIN_GRAMS_REQUIRED
                    ? '재고 부족'
                    : remainingOrders <= 0
                    ? '오늘 주문 마감'
                    : !orderTimeAvailable
                    ? `주문 불가 시간 (${nextOrderTime})`
                    : '주문하기'
                  }
                </button>
              </div>
            )) || []}
          </div>
        )}
      </div>
    </div>
  )
}