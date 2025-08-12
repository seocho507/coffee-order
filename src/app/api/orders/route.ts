import { NextRequest } from 'next/server'
import { OrderService } from '@/lib/services/order-service'
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse, 
  validateRequiredFields,
  getTodayString 
} from '@/lib/utils/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 필수 필드 검증
    const validationError = validateRequiredFields(body, ['userId', 'userName', 'coffeeId'])
    if (validationError) {
      return errorResponse(validationError)
    }

    const { userId, userName, coffeeId } = body

    // 데이터 검증
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return errorResponse('유효한 사용자 ID를 입력해주세요.')
    }

    if (typeof userName !== 'string' || userName.trim().length === 0) {
      return errorResponse('유효한 사용자 이름을 입력해주세요.')
    }

    if (typeof coffeeId !== 'string' || coffeeId.trim().length === 0) {
      return errorResponse('유효한 커피 ID를 입력해주세요.')
    }

    const order = await OrderService.createOrder({
      userId: userId.trim(),
      userName: userName.trim(),
      coffeeId: coffeeId.trim()
    })

    return successResponse({ order }, '주문이 성공적으로 생성되었습니다.')

  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return serverErrorResponse(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date') || getTodayString()
    const all = searchParams.get('all')

    let orders
    
    if (userId && !all) {
      // 특정 사용자의 주문 조회
      orders = await OrderService.getUserOrdersForDate(userId, date)
    } else {
      // 모든 주문 조회
      orders = await OrderService.getAllOrdersForDate(date)
    }

    return successResponse({ orders })

  } catch (error) {
    return serverErrorResponse(error)
  }
}