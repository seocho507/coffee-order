/**
 * 주문 제한사항 및 정책 관리
 * orderservice와 관련된 모든 제한사항을 중앙에서 관리
 */

// 시간 제한 설정
export const TIME_RESTRICTIONS = {
  MORNING_SLOT: {
    START_HOUR: 10,
    END_HOUR: 11,
    get LABEL() { return `오전 (${String(this.START_HOUR).padStart(2, '0')}:00-${String(this.END_HOUR).padStart(2, '0')}:00)` }
  },
  AFTERNOON_SLOT: {
    START_HOUR: 13,
    END_HOUR: 14,
    get LABEL() { return `오후 (${String(this.START_HOUR).padStart(2, '0')}:00-${String(this.END_HOUR).padStart(2, '0')}:00)` }
  }
} as const

// 수량 제한 설정
export const QUANTITY_RESTRICTIONS = {
  DAILY_ORDER_LIMIT: 2,          // 하루 최대 주문 가능 잔 수 (오전 1잔 + 오후 1잔)
  GRAMS_PER_CUP: 20,             // 커피 1잔당 원두 소모량 (그램)
  MIN_GRAMS_REQUIRED: 20,        // 주문을 위한 최소 원두 필요량
  MAX_ORDER_PER_TIMESLOT: 1      // 시간대별 최대 주문 가능 잔 수
} as const

// 시간 슬롯 타입
export type TimeSlot = 'morning' | 'afternoon'

// 시간 슬롯 정보
export const TIME_SLOTS = {
  morning: {
    start: TIME_RESTRICTIONS.MORNING_SLOT.START_HOUR,
    end: TIME_RESTRICTIONS.MORNING_SLOT.END_HOUR,
    label: TIME_RESTRICTIONS.MORNING_SLOT.LABEL
  },
  afternoon: {
    start: TIME_RESTRICTIONS.AFTERNOON_SLOT.START_HOUR,
    end: TIME_RESTRICTIONS.AFTERNOON_SLOT.END_HOUR,
    label: TIME_RESTRICTIONS.AFTERNOON_SLOT.LABEL
  }
} as const

// 에러 메시지 정의
export const ERROR_MESSAGES = {
  TIME_RESTRICTION: `주문 가능한 시간이 아닙니다. (오전 ${TIME_RESTRICTIONS.MORNING_SLOT.START_HOUR}:00-${TIME_RESTRICTIONS.MORNING_SLOT.END_HOUR}:00, 오후 ${TIME_RESTRICTIONS.AFTERNOON_SLOT.START_HOUR}:00-${TIME_RESTRICTIONS.AFTERNOON_SLOT.END_HOUR}:00)`,
  DAILY_LIMIT_EXCEEDED: `하루에 ${QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT}잔만 주문 가능합니다.`,
  INSUFFICIENT_STOCK: '커피 재고가 부족합니다.',
  COFFEE_NOT_FOUND: '커피 정보를 찾을 수 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.'
} as const

// 시간 검증 함수
export function getCurrentTimeSlot(): TimeSlot | null {
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  const hour = koreaTime.getHours()
  
  if (hour >= TIME_SLOTS.morning.start && hour < TIME_SLOTS.morning.end) {
    return 'morning'
  } else if (hour >= TIME_SLOTS.afternoon.start && hour < TIME_SLOTS.afternoon.end) {
    return 'afternoon'
  }
  
  return null
}

// 주문 가능 시간 체크
export function isOrderTimeAvailable(): boolean {
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  const currentHour = koreaTime.getHours()
  
  return (currentHour >= TIME_SLOTS.morning.start && currentHour < TIME_SLOTS.morning.end) || 
         (currentHour >= TIME_SLOTS.afternoon.start && currentHour < TIME_SLOTS.afternoon.end)
}

// 다음 주문 가능 시간 계산
export function getNextOrderTime(): string {
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  const currentHour = koreaTime.getHours()
  
  if (currentHour < TIME_SLOTS.morning.start) {
    return `${TIME_RESTRICTIONS.MORNING_SLOT.START_HOUR}시`
  } else if (currentHour >= TIME_SLOTS.morning.end && currentHour < TIME_SLOTS.afternoon.start) {
    return `${TIME_RESTRICTIONS.AFTERNOON_SLOT.START_HOUR}시`
  } else if (currentHour >= TIME_SLOTS.afternoon.end) {
    return `내일 ${TIME_RESTRICTIONS.MORNING_SLOT.START_HOUR}시`
  }
  
  return "현재 주문 가능"
}

// 주문 검증 결과 타입
export interface OrderValidationResult {
  canOrder: boolean
  reason?: string
}

// 시간 기반 주문 검증
export function validateOrderTime(): OrderValidationResult {
  const timeSlot = getCurrentTimeSlot()
  
  if (!timeSlot) {
    return {
      canOrder: false,
      reason: ERROR_MESSAGES.TIME_RESTRICTION
    }
  }
  
  return { canOrder: true }
}

// 일일 주문 수량 검증
export function validateDailyOrderLimit(currentOrderCount: number): OrderValidationResult {
  if (currentOrderCount >= QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT) {
    return {
      canOrder: false,
      reason: ERROR_MESSAGES.DAILY_LIMIT_EXCEEDED
    }
  }
  
  return { canOrder: true }
}

// 재고 검증
export function validateStock(remainingGrams: number): OrderValidationResult {
  if (remainingGrams < QUANTITY_RESTRICTIONS.MIN_GRAMS_REQUIRED) {
    return {
      canOrder: false,
      reason: ERROR_MESSAGES.INSUFFICIENT_STOCK
    }
  }
  
  return { canOrder: true }
}

// 시간대별 주문 수량 검증
export function validateTimeslotOrderLimit(currentTimeslotOrderCount: number): OrderValidationResult {
  if (currentTimeslotOrderCount >= QUANTITY_RESTRICTIONS.MAX_ORDER_PER_TIMESLOT) {
    return {
      canOrder: false,
      reason: `현재 시간대 주문이 마감되었습니다. (최대 ${QUANTITY_RESTRICTIONS.MAX_ORDER_PER_TIMESLOT}잔)`
    }
  }
  
  return { canOrder: true }
}

// 사용자 정의 메시지
export const USER_MESSAGES = {
  ORDER_RULES: [
    `* 하루 최대 ${QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT}잔의 주문을 각각 오전/오후 ${QUANTITY_RESTRICTIONS.MAX_ORDER_PER_TIMESLOT}잔씩 나누어 받습니다 (선착순)`,
    `* 매일 오전 ${TIME_RESTRICTIONS.MORNING_SLOT.START_HOUR}시에 주문 내역이 초기화됩니다`,
    `* 주문 가능 시간: 오전 ${TIME_RESTRICTIONS.MORNING_SLOT.START_HOUR}시~${TIME_RESTRICTIONS.MORNING_SLOT.END_HOUR}시, 오후 ${TIME_RESTRICTIONS.AFTERNOON_SLOT.START_HOUR}시~${TIME_RESTRICTIONS.AFTERNOON_SLOT.END_HOUR}시`
  ],
  ORDER_LIMIT_INFO: (userOrderCount: number, remainingOrders: number) => ({
    current: `오늘 내가 주문한 커피: ${userOrderCount}잔`,
    remaining: `남은 주문 가능량: ${remainingOrders}잔 (일일 ${QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT}잔 제한)`
  })
} as const

// 레거시 호환성을 위한 export (기존 코드와의 호환성 유지)
export const ORDER_LIMITS = QUANTITY_RESTRICTIONS
export const DAILY_ORDER_LIMIT = QUANTITY_RESTRICTIONS.DAILY_ORDER_LIMIT

// 날짜 유틸리티
export function getTodayString(): string {
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  return koreaTime.toISOString().split('T')[0]
}

export function getDateString(date: Date): string {
  const koreaTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  return koreaTime.toISOString().split('T')[0]
}