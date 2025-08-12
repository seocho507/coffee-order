import { useState, useEffect } from 'react'
import { Coffee } from '@/types/coffee'
import toast from 'react-hot-toast'

export function useCoffees() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCoffees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/coffees')
      const data = await response.json()
      
      if (data.success) {
        setCoffees(data.data.coffees)
      } else {
        throw new Error(data.error || '커피 목록을 불러올 수 없습니다.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '커피 목록 로드 실패'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoffees()
  }, [])

  return {
    coffees,
    loading,
    error,
    refetch: loadCoffees
  }
}