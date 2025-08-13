import { DailyOrder } from '@/types/coffee'
import { getCurrentTimeSlot, QUANTITY_RESTRICTIONS } from '@/lib/config/order-restrictions'

export interface OrderStatusInfo {
  // 개인 상태
  userCanOrder: boolean
  userOrderCount: number
  userRemainingOrders: number
  
  // 전체 상태
  currentTimeslotOrders: number
  currentTimeslotAvailable: boolean
  totalOrdersToday: number
  
  // 시간대별 상태
  morningOrders: number
  afternoonOrders: number
  morningAvailable: boolean
  afternoonAvailable: boolean
  
  // UI 메시지
  orderButtonMessage: string
  orderButtonDisabled: boolean
}

export function calculateOrderStatus(
  userOrders: DailyOrder[],
  allOrders: DailyOrder[],
  orderTimeAvailable: boolean,
  nextOrderTime: string
): OrderStatusInfo {
  const currentTimeSlot = getCurrentTimeSlot()
  
  // 개인 상태 계산
  const userOrderCount = userOrders.length
  const userRemainingOrders = Math.max(0, QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT - userOrderCount)
  const userCanOrder = userRemainingOrders > 0
  
  // 전체 주문 분석
  const morningOrders = allOrders.filter(order => order.timeSlot === 'morning').length
  const afternoonOrders = allOrders.filter(order => order.timeSlot === 'afternoon').length
  const totalOrdersToday = allOrders.length
  
  // 시간대별 가용성
  const morningAvailable = morningOrders < QUANTITY_RESTRICTIONS.MAX_ORDER_PER_TIMESLOT
  const afternoonAvailable = afternoonOrders < QUANTITY_RESTRICTIONS.MAX_ORDER_PER_TIMESLOT
  
  // 현재 시간대 상태
  let currentTimeslotOrders = 0
  let currentTimeslotAvailable = false
  
  if (currentTimeSlot === 'morning') {
    currentTimeslotOrders = morningOrders
    currentTimeslotAvailable = morningAvailable
  } else if (currentTimeSlot === 'afternoon') {
    currentTimeslotOrders = afternoonOrders
    currentTimeslotAvailable = afternoonAvailable
  }
  
  // 주문 버튼 상태 결정
  let orderButtonMessage = '주문하기'
  let orderButtonDisabled = false
  
  if (!userCanOrder) {
    orderButtonMessage = '일일 주문 완료'
    orderButtonDisabled = true
  } else if (!orderTimeAvailable) {
    orderButtonMessage = `주문 불가 시간 (${nextOrderTime})`
    orderButtonDisabled = true
  } else if (!currentTimeslotAvailable && currentTimeSlot) {
    orderButtonMessage = '현재 시간대 마감'
    orderButtonDisabled = true
  }
  
  return {
    userCanOrder,
    userOrderCount,
    userRemainingOrders,
    currentTimeslotOrders,
    currentTimeslotAvailable,
    totalOrdersToday,
    morningOrders,
    afternoonOrders,
    morningAvailable,
    afternoonAvailable,
    orderButtonMessage,
    orderButtonDisabled
  }
}