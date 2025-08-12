'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCoffees } from '@/hooks/useCoffees'
import { useOrders } from '@/hooks/useOrders'
import { DAILY_ORDER_LIMIT } from '@/data/coffees'
import { isOrderTimeAvailable, getNextOrderTime } from '@/utils/time'
import { Coffee } from '@/types/coffee'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const { coffees, loading: coffeesLoading, refetch: refetchCoffees } = useCoffees()
  const { 
    orders: userOrders, 
    loading: ordersLoading, 
    createOrder, 
    refetch: refetchOrders 
  } = useOrders(user?.id)

  const { 
    orders: allOrders, 
    loading: allOrdersLoading, 
    refetch: refetchAllOrders 
  } = useOrders(undefined, true)

  const isLoading = authLoading || coffeesLoading || ordersLoading || allOrdersLoading

  // 인증되지 않은 사용자 리다이렉트
  if (!authLoading && !user) {
    router.push('/')
    return null
  }

  // 주문 처리 함수
  const handleOrder = async (coffee: Coffee) => {
    if (!user) return
    
    if (!isOrderTimeAvailable()) {
      const nextTime = getNextOrderTime()
      toast.error(`주문 가능한 시간이 아닙니다. ${nextTime}에 다시 시도해주세요.`)
      return
    }
    
    const currentUserOrders = userOrders || []
    if (currentUserOrders.length >= DAILY_ORDER_LIMIT) {
      toast.error(`하루에 ${DAILY_ORDER_LIMIT}잔만 주문 가능합니다.`)
      return
    }

    const success = await createOrder(coffee.id, user.email || '')
    if (success) {
      // 모든 데이터 새로고침
      refetchOrders()
      refetchAllOrders()
      refetchCoffees()
    }
  }

  // 로그아웃 처리
  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 계산된 값들 (안전한 기본값 제공)
  const userOrderCount = userOrders?.length || 0
  const allOrderCount = allOrders?.length || 0
  const remainingOrders = Math.max(0, DAILY_ORDER_LIMIT - userOrderCount)
  const orderTimeAvailable = isOrderTimeAvailable()
  const nextOrderTime = getNextOrderTime()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">커피 주문 시스템</h1>
            
            {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* 사용자 정보 */}
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
                <span className="text-sm text-gray-600 truncate max-w-[200px]">{user?.email}</span>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-purple-700 text-sm whitespace-nowrap"
                >
                  관리자
                </button>
              </div>
              
              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm w-full sm:w-auto"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 전체 주문 현황 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">오늘의 전체 주문 현황</h2>
              <div className="text-sm text-gray-600 mb-4">
                <p>전체 주문: {allOrderCount}잔</p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>* 매일 오전 10시에 주문 내역이 초기화됩니다</p>
                  <p>* 주문 가능 시간: 오전 10시~11시, 오후 1시~2시</p>
                  {!orderTimeAvailable && nextOrderTime && (
                    <p className="text-orange-600 font-medium">
                      현재 주문 불가 시간입니다. {nextOrderTime}에 다시 시도해주세요.
                    </p>
                  )}
                </div>
              </div>
              
              {allOrders && allOrders.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">전체 주문 내역</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allOrders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="text-sm">
                          <span className="font-medium">{order.coffeeName}</span>
                          <span className="text-gray-600 ml-2">- {order.userName}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 개인 주문 현황 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">나의 주문 현황</h2>
              <div className="text-sm text-gray-600">
                <p>오늘 내가 주문한 커피: {userOrderCount}잔</p>
                <p>남은 주문 가능량: {remainingOrders}잔 (일일 {DAILY_ORDER_LIMIT}잔 제한)</p>
              </div>
              
              {userOrders && userOrders.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">내 주문 내역</h3>
                  <ul className="space-y-2">
                    {userOrders.map((order) => (
                      <li key={order.id} className="text-sm text-gray-600">
                        {order.coffeeName} - {new Date(order.createdAt).toLocaleTimeString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 커피 메뉴 */}
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
                        onClick={() => handleOrder(coffee)}
                        disabled={!coffee.available || coffee.remainingGrams < 20 || remainingOrders <= 0 || !orderTimeAvailable}
                        className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!coffee.available 
                          ? '품절' 
                          : coffee.remainingGrams < 20
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
        </div>
      </main>
    </div>
  )
}