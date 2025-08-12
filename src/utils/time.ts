// 통합 order-restrictions 파일의 함수들을 재내보내기
export { 
  isOrderTimeAvailable, 
  getNextOrderTime 
} from '@/lib/config/order-restrictions'

export function formatOrderTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}