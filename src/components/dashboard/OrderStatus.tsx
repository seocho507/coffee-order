'use client'

import { DailyOrder } from '@/types/coffee'
import { USER_MESSAGES } from '@/lib/config/order-restrictions'
import { OrderStatusInfo } from '@/lib/utils/order-status'

interface OrderStatusProps {
  userOrders: DailyOrder[]
  allOrders: DailyOrder[]
  orderStatus: OrderStatusInfo
}

export default function OrderStatus({ 
  userOrders, 
  allOrders, 
  orderStatus 
}: OrderStatusProps) {

  return (
    <>
      {/* 전체 주문 현황 */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">오늘의 전체 주문 현황</h2>
          <div className="text-sm text-gray-600 mb-4">
            <p className="text-orange-600 font-medium text-lg">
              전체 주문: {orderStatus.totalOrdersToday}잔 / 2잔 (오전: {orderStatus.morningOrders}잔, 오후: {orderStatus.afternoonOrders}잔)
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {USER_MESSAGES.ORDER_RULES.map((rule, index) => (
                <p key={index} className="text-lg mb-1">{rule}</p>
              ))}
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
            <p>오늘 내가 주문한 커피: {orderStatus.userOrderCount}잔</p>
            <p>남은 주문 가능량: {orderStatus.userRemainingOrders}잔 (개인별 일일 1잔 제한)</p>
            <p className={`mt-2 font-medium ${orderStatus.userCanOrder ? 'text-green-600' : 'text-red-600'}`}>
              개인 주문 상태: {orderStatus.userCanOrder ? '주문 가능' : '주문 완료'}
            </p>
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
    </>
  )
}