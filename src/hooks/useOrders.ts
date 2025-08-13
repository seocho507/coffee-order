import { useState, useEffect, useCallback } from 'react'
import { DailyOrder } from '@/types/coffee'
import toast from 'react-hot-toast'

export function useOrders(userId?: string, all: boolean = false) {
  const [orders, setOrders] = useState<DailyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isDeletingOrder, setIsDeletingOrder] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (userId && !all) params.set('userId', userId)
      if (all) params.set('all', 'true')
      
      const response = await fetch(`/api/orders?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data.orders)
      } else {
        throw new Error(data.error || '주문 내역을 불러올 수 없습니다.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '주문 내역 로드 실패'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [userId, all])

  const createOrder = async (coffeeId: string, userName: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다.')
      return false
    }

    // 중복 요청 방지
    if (isCreatingOrder) {
      toast.error('주문 처리 중입니다. 잠시만 기다려주세요.')
      return false
    }

    try {
      setIsCreatingOrder(true)
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          userId,
          userName,
          coffeeId,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || '주문이 완료되었습니다.')
        await loadOrders() // 주문 목록 새로고침
        return true
      } else {
        toast.error(data.error || '주문 실패')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '주문 중 오류가 발생했습니다.'
      toast.error(errorMessage)
      return false
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const deleteOrder = async (orderId: string) => {
    // 중복 요청 방지
    if (isDeletingOrder === orderId) {
      toast.error('삭제 처리 중입니다. 잠시만 기다려주세요.')
      return false
    }

    try {
      setIsDeletingOrder(orderId)
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId || 'anonymous',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || '주문이 삭제되었습니다.')
        await loadOrders() // 주문 목록 새로고침
        return true
      } else {
        toast.error(data.error || '삭제 실패')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.'
      toast.error(errorMessage)
      return false
    } finally {
      setIsDeletingOrder(null)
    }
  }

  useEffect(() => {
    if (userId || all) {
      loadOrders()
    }
  }, [userId, all, loadOrders])

  return {
    orders,
    loading,
    error,
    isCreatingOrder,
    isDeletingOrder,
    refetch: loadOrders,
    createOrder,
    deleteOrder
  }
}