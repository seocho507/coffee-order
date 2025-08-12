import { TIME_SLOTS } from '@/lib/utils/api-helpers'

export function isOrderTimeAvailable(): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  
  return (currentHour >= TIME_SLOTS.morning.start && currentHour < TIME_SLOTS.morning.end) || 
         (currentHour >= TIME_SLOTS.afternoon.start && currentHour < TIME_SLOTS.afternoon.end)
}

export function getNextOrderTime(): string {
  const now = new Date()
  const currentHour = now.getHours()
  
  if (currentHour < TIME_SLOTS.morning.start) {
    return "오전 10시"
  } else if (currentHour >= TIME_SLOTS.morning.end && currentHour < TIME_SLOTS.afternoon.start) {
    return "오후 1시"
  } else if (currentHour >= TIME_SLOTS.afternoon.end) {
    return "내일 오전 10시"
  }
  return ""
}

export function formatOrderTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}