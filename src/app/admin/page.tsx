'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useCoffeeManagement } from '@/hooks/useCoffeeManagement'
import { useOrders } from '@/hooks/useOrders'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin, signOut } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<'coffees' | 'orders'>('coffees')
  
  // 커피 관리
  const {
    coffees,
    loading: coffeesLoading,
    newCoffeeForm,
    setNewCoffeeForm,
    showNewCoffeeForm,
    setShowNewCoffeeForm,
    createCoffee,
    isEditing,
    editForm,
    setEditForm,
    startEdit,
    cancelEdit,
    updateCoffee,
    deleteCoffee,
    refetch: refetchCoffees
  } = useCoffeeManagement()

  // 주문 관리  
  const {
    orders,
    loading: ordersLoading,
    deleteOrder,
    refetch: refetchOrders
  } = useOrders(undefined, true)

  const isLoading = authLoading || coffeesLoading || ordersLoading

  // 주문 삭제 (재고 복구 포함)
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('이 주문을 삭제하시겠습니까? 커피 재고가 복구됩니다.')) return

    const success = await deleteOrder(orderId)
    if (success) {
      refetchCoffees() // 재고 업데이트 반영
    }
  }

  // 커피 폼 제출
  const handleCreateCoffee = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCoffee()
  }

  // 로그아웃
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

  // 관리자 권한 없음
  if (!isAdmin) {
    return null // useAdminAuth에서 이미 리다이렉트 처리
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                대시보드로
              </button>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 탭 네비게이션 */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('coffees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'coffees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                커피 관리
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                주문 관리
              </button>
            </nav>
          </div>

          {/* 커피 관리 탭 */}
          {activeTab === 'coffees' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">커피 목록</h2>
                  <button
                    onClick={() => setShowNewCoffeeForm(!showNewCoffeeForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    새 커피 추가
                  </button>
                </div>

                {/* 새 커피 추가 폼 */}
                {showNewCoffeeForm && (
                  <form onSubmit={handleCreateCoffee} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-medium mb-4">새 커피 추가</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">이름</label>
                        <input
                          type="text"
                          required
                          value={newCoffeeForm.name}
                          onChange={(e) => setNewCoffeeForm(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">가격</label>
                        <input
                          type="number"
                          required
                          value={newCoffeeForm.price}
                          onChange={(e) => setNewCoffeeForm(prev => ({ ...prev, price: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">재고(g)</label>
                        <input
                          type="number"
                          required
                          value={newCoffeeForm.remainingGrams}
                          onChange={(e) => setNewCoffeeForm(prev => ({ ...prev, remainingGrams: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        추가
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewCoffeeForm(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                )}

                {/* 커피 목록 */}
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이름
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          가격
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          재고
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {coffees.map((coffee) => (
                        <tr key={coffee.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing === coffee.id ? (
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{coffee.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing === coffee.id ? (
                              <input
                                type="number"
                                value={editForm.price || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">₩{coffee.price.toLocaleString()}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing === coffee.id ? (
                              <input
                                type="number"
                                value={editForm.remainingGrams || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, remainingGrams: parseInt(e.target.value) }))}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">{coffee.remainingGrams}g</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing === coffee.id ? (
                              <select
                                value={editForm.available ? 'true' : 'false'}
                                onChange={(e) => setEditForm(prev => ({ ...prev, available: e.target.value === 'true' }))}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="true">활성</option>
                                <option value="false">비활성</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                coffee.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {coffee.available ? '활성' : '비활성'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {isEditing === coffee.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={updateCoffee}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(coffee)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => deleteCoffee(coffee.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 주문 관리 탭 */}
          {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">오늘의 주문 내역</h2>
                  <button
                    onClick={refetchOrders}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    새로고침
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  총 주문 수: {orders.length}건
                </div>

                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          주문 시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          커피
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          시간대
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.coffeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.timeSlot === 'morning' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {order.timeSlot === 'morning' ? '오전' : '오후'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      오늘 주문 내역이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}