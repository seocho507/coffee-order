/**
 * API 요청 중복 방지 미들웨어
 */
import { NextRequest } from 'next/server'

// 진행 중인 요청을 추적하는 Map
const pendingRequests = new Map<string, Promise<any>>()

// 요청 키 생성 함수 (사용자ID + 액션 + 시간대별 그룹화)
export function generateRequestKey(userId: string, action: string, timeWindow: number = 5000): string {
  const timeGroup = Math.floor(Date.now() / timeWindow)
  return `${userId}:${action}:${timeGroup}`
}

// 중복 요청 검사 및 방지
export async function withRequestDeduplication<T>(
  requestKey: string,
  operation: () => Promise<T>
): Promise<T> {
  // 이미 진행 중인 동일한 요청이 있는지 확인
  if (pendingRequests.has(requestKey)) {
    // 기존 요청의 결과를 기다림
    return await pendingRequests.get(requestKey)!
  }

  // 새로운 요청 등록
  const promise = operation()
  pendingRequests.set(requestKey, promise)

  try {
    const result = await promise
    return result
  } finally {
    // 요청 완료 후 Map에서 제거
    pendingRequests.delete(requestKey)
  }
}

// 주문 생성용 중복 방지 래퍼
export async function withOrderCreationDeduplication<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  const requestKey = generateRequestKey(userId, 'create_order', 3000) // 3초 윈도우
  return withRequestDeduplication(requestKey, operation)
}

// 주문 삭제용 중복 방지 래퍼
export async function withOrderDeletionDeduplication<T>(
  userId: string,
  orderId: string,
  operation: () => Promise<T>
): Promise<T> {
  const requestKey = generateRequestKey(userId, `delete_order:${orderId}`, 2000) // 2초 윈도우
  return withRequestDeduplication(requestKey, operation)
}

// 요청 헤더에서 중복 방지 토큰 검증
export function validateIdempotencyToken(request: NextRequest): string | null {
  const token = request.headers.get('x-idempotency-key')
  
  if (!token) {
    return null
  }

  // 간단한 토큰 형식 검증 (UUID 형태)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    throw new Error('유효하지 않은 중복 방지 토큰입니다.')
  }

  return token
}

// 메모리 정리 함수 (주기적으로 호출)
export function cleanupPendingRequests() {
  // 5분 이상 된 요청들은 강제로 정리
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  
  for (const [key] of pendingRequests.entries()) {
    // 키에서 타임스탬프 추출
    const parts = key.split(':')
    if (parts.length >= 3) {
      const timeGroup = parseInt(parts[2])
      const requestTime = timeGroup * 5000 // 기본 윈도우 크기
      
      if (requestTime < fiveMinutesAgo) {
        pendingRequests.delete(key)
      }
    }
  }
}

// 주기적 정리 작업 시작
setInterval(cleanupPendingRequests, 60000) // 1분마다 정리