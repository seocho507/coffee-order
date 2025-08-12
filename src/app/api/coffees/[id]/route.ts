import { NextRequest } from 'next/server'
import { CoffeeService } from '@/lib/services/coffee-service'
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse 
} from '@/lib/utils/api-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // 업데이트할 데이터 검증
    const updateData: any = {}
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return errorResponse('유효한 커피 이름을 입력해주세요.')
      }
      updateData.name = body.name.trim()
    }
    
    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return errorResponse('가격은 0보다 큰 숫자여야 합니다.')
      }
      updateData.price = body.price
    }
    
    if (body.remainingGrams !== undefined) {
      if (typeof body.remainingGrams !== 'number' || body.remainingGrams < 0) {
        return errorResponse('재고는 0 이상의 숫자여야 합니다.')
      }
      updateData.remainingGrams = body.remainingGrams
    }
    
    if (body.available !== undefined) {
      if (typeof body.available !== 'boolean') {
        return errorResponse('유효한 상태값을 입력해주세요.')
      }
      updateData.available = body.available
    }

    const coffee = await CoffeeService.updateCoffee(id, updateData)
    return successResponse({ coffee }, '커피 정보가 성공적으로 업데이트되었습니다.')

  } catch (error) {
    if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
      return errorResponse('해당 커피를 찾을 수 없습니다.', 404)
    }
    return serverErrorResponse(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await CoffeeService.deleteCoffee(id)
    return successResponse(null, '커피가 성공적으로 삭제되었습니다.')

  } catch (error) {
    return serverErrorResponse(error)
  }
}