import { NextResponse } from 'next/server'

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 성공 응답 헬퍼
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  } as ApiResponse<T>)
}

// 에러 응답 헬퍼
export function errorResponse(error: string, status: number = 400): NextResponse {
  return NextResponse.json({
    success: false,
    error
  } as ApiResponse, { status })
}

// 서버 에러 응답 헬퍼
export function serverErrorResponse(error: unknown): NextResponse {
  console.error('API Error:', error)
  return NextResponse.json({
    success: false,
    error: '서버 오류가 발생했습니다.'
  } as ApiResponse, { status: 500 })
}

// 요청 데이터 검증 헬퍼
export function validateRequiredFields(
  data: Record<string, any>, 
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      return `${field}는 필수 항목입니다.`
    }
  }
  return null
}

// 날짜 유틸리티
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// 주문 제한 관련 함수들은 order-restrictions로 이동됨
// 하위 호환성을 위해 재내보내기
export { 
  getCurrentTimeSlot,
  ORDER_LIMITS,
  TIME_SLOTS 
} from '@/lib/config/order-restrictions'