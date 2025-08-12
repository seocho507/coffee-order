import { NextRequest } from 'next/server'
import { OrderService } from '@/lib/services/order-service'
import { 
  successResponse, 
  serverErrorResponse 
} from '@/lib/utils/api-helpers'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id || typeof id !== 'string') {
      return serverErrorResponse(new Error('유효한 주문 ID가 필요합니다.'))
    }

    await OrderService.deleteOrder(id)
    return successResponse(null, '주문이 성공적으로 삭제되었습니다.')

  } catch (error) {
    return serverErrorResponse(error)
  }
}