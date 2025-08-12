// 상수들은 api-helpers로 이동됨
export { 
  ORDER_LIMITS, 
  TIME_SLOTS, 
  getCurrentTimeSlot 
} from '@/lib/utils/api-helpers'

// 하위 호환성을 위한 별칭
export const DAILY_ORDER_LIMIT = 1