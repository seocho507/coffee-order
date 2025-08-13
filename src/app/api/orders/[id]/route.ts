import { NextRequest } from 'next/server'
import { OrderService } from '@/lib/services/order-service'
import { 
  successResponse, 
  serverErrorResponse 
} from '@/lib/utils/api-helpers'
import { withOrderDeletionDeduplication } from '@/lib/middleware/request-deduplication'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id || typeof id !== 'string') {
      return serverErrorResponse(new Error('유효한 주문 ID가 필요합니다.'))
    }

    // 사용자 ID 추출 (헤더 또는 요청에서)
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // 중복 요청 방지 래퍼로 주문 삭제
    await withOrderDeletionDeduplication(
      userId,
      id,
      () => OrderService.deleteOrder(id)
    )
    
    return successResponse(null, '주문이 성공적으로 삭제되었습니다.')

  } catch (error) {
    return serverErrorResponse(error)
  }
}