'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCoffees } from '@/hooks/useCoffees'
import { useOrders } from '@/hooks/useOrders'
import {
  getNextOrderTime,
  isOrderTimeAvailable,
  QUANTITY_RESTRICTIONS,
  validateDailyOrderLimit
} from '@/lib/config/order-restrictions'
import { Coffee } from '@/types/coffee'
import toast from 'react-hot-toast'
import { Suspense, lazy, useMemo, useCallback } from 'react'

// 컴포넌트들을 동적 import로 코드 분할
const OrderStatus = lazy(() => import('@/components/dashboard/OrderStatus'))
const CoffeeMenu = lazy(() => import('@/components/dashboard/CoffeeMenu'))

export default function Dashboard() {
    const router = useRouter()
    const { user, loading: authLoading, signOut } = useAuth()
    const { coffees, loading: coffeesLoading, refetch: refetchCoffees } = useCoffees()
    const {
        orders: userOrders,
        loading: ordersLoading,
        createOrder,
        refetch: refetchOrders,
        isCreatingOrder
    } = useOrders(user?.id)

    const {
        orders: allOrders,
        loading: allOrdersLoading,
        refetch: refetchAllOrders
    } = useOrders(undefined, true)

    // 주문 처리 함수 (메모이제이션)
    const handleOrder = useCallback(async (coffee: Coffee) => {
        if (!user) return

        if (!isOrderTimeAvailable()) {
            const nextTime = getNextOrderTime()
            toast.error(`주문 가능한 시간이 아닙니다. ${nextTime}에 다시 시도해주세요.`)
            return
        }

        const currentUserOrders = userOrders || []
        const dailyLimitValidation = validateDailyOrderLimit(currentUserOrders.length)
        if (!dailyLimitValidation.canOrder) {
            toast.error(dailyLimitValidation.reason!)
            return
        }

        const success = await createOrder(coffee.id, user.email || '')
        if (success) {
            // 모든 데이터 새로고침
            refetchOrders()
            refetchAllOrders()
            refetchCoffees()
        }
    }, [user, userOrders, createOrder, refetchOrders, refetchAllOrders, refetchCoffees])

    // 로그아웃 처리 (메모이제이션)
    const handleLogout = useCallback(() => {
        signOut()
        router.push('/')
    }, [signOut, router])

    // 계산된 값들 (메모이제이션으로 최적화)
    const { remainingOrders, orderTimeAvailable, nextOrderTime } = useMemo(() => {
        const userCount = userOrders?.length || 0
        const remaining = Math.max(0, QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT - userCount)
        const timeAvailable = isOrderTimeAvailable()
        const nextTime = getNextOrderTime()
        
        return {
            remainingOrders: remaining,
            orderTimeAvailable: timeAvailable,
            nextOrderTime: nextTime
        }
    }, [userOrders])

    const isLoading = authLoading || coffeesLoading || ordersLoading || allOrdersLoading

    // 인증되지 않은 사용자 리다이렉트
    if (!authLoading && !user) {
        router.push('/')
        return null
    }

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        )
    }

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
                    <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
                        <OrderStatus 
                            userOrders={userOrders || []}
                            allOrders={allOrders || []}
                            isOrderTimeAvailable={orderTimeAvailable}
                            nextOrderTime={nextOrderTime}
                        />
                    </Suspense>

                    <Suspense fallback={<div className="text-center py-8">메뉴 로딩 중...</div>}>
                        <CoffeeMenu 
                            coffees={coffees}
                            coffeesLoading={coffeesLoading}
                            remainingOrders={remainingOrders}
                            orderTimeAvailable={orderTimeAvailable}
                            nextOrderTime={nextOrderTime}
                            onOrder={handleOrder}
                            isCreatingOrder={isCreatingOrder}
                        />
                    </Suspense>
                </div>
            </main>
        </div>
    )
}