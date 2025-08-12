import { useState } from 'react'
import { Coffee } from '@/types/coffee'
import { useCoffees } from './useCoffees'
import toast from 'react-hot-toast'

export function useCoffeeManagement() {
  const { coffees, loading, refetch } = useCoffees()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Coffee>>({})
  const [newCoffeeForm, setNewCoffeeForm] = useState({
    name: '',
    price: '',
    remainingGrams: ''
  })
  const [showNewCoffeeForm, setShowNewCoffeeForm] = useState(false)

  const createCoffee = async () => {
    try {
      const response = await fetch('/api/coffees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCoffeeForm.name,
          price: parseInt(newCoffeeForm.price),
          remainingGrams: parseInt(newCoffeeForm.remainingGrams)
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || '커피가 추가되었습니다.')
        setNewCoffeeForm({ name: '', price: '', remainingGrams: '' })
        setShowNewCoffeeForm(false)
        await refetch()
        return true
      } else {
        toast.error(data.error || '커피 추가 실패')
        return false
      }
    } catch (error) {
      console.error('커피 추가 실패:', error)
      toast.error('커피 추가 중 오류가 발생했습니다.')
      return false
    }
  }

  const updateCoffee = async () => {
    if (!isEditing || !editForm) return false

    try {
      const response = await fetch(`/api/coffees/${isEditing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || '커피 정보가 업데이트되었습니다.')
        setIsEditing(null)
        setEditForm({})
        await refetch()
        return true
      } else {
        toast.error(data.error || '업데이트 실패')
        return false
      }
    } catch (error) {
      console.error('커피 업데이트 실패:', error)
      toast.error('업데이트 중 오류가 발생했습니다.')
      return false
    }
  }

  const deleteCoffee = async (coffeeId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return false

    try {
      const response = await fetch(`/api/coffees/${coffeeId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || '커피가 삭제되었습니다.')
        await refetch()
        return true
      } else {
        toast.error(data.error || '삭제 실패')
        return false
      }
    } catch (error) {
      console.error('커피 삭제 실패:', error)
      toast.error('삭제 중 오류가 발생했습니다.')
      return false
    }
  }

  const startEdit = (coffee: Coffee) => {
    setIsEditing(coffee.id)
    setEditForm(coffee)
  }

  const cancelEdit = () => {
    setIsEditing(null)
    setEditForm({})
  }

  return {
    // 데이터
    coffees,
    loading,
    
    // 새 커피 추가
    newCoffeeForm,
    setNewCoffeeForm,
    showNewCoffeeForm,
    setShowNewCoffeeForm,
    createCoffee,
    
    // 커피 수정
    isEditing,
    editForm,
    setEditForm,
    startEdit,
    cancelEdit,
    updateCoffee,
    
    // 커피 삭제
    deleteCoffee,
    
    // 새로고침
    refetch
  }
}