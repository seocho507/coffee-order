import { NextRequest } from 'next/server'
import { CoffeeService } from '@/lib/services/coffee-service'
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse, 
  validateRequiredFields 
} from '@/lib/utils/api-helpers'

export async function GET() {
  try {
    const coffees = await CoffeeService.getAllCoffees()
    return successResponse({ coffees })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 필수 필드 검증
    const validationError = validateRequiredFields(body, ['name', 'price', 'remainingGrams'])
    if (validationError) {
      return errorResponse(validationError)
    }

    const { name, price, remainingGrams } = body

    // 데이터 타입 검증
    if (typeof price !== 'number' || price <= 0) {
      return errorResponse('가격은 0보다 큰 숫자여야 합니다.')
    }

    if (typeof remainingGrams !== 'number' || remainingGrams < 0) {
      return errorResponse('재고는 0 이상의 숫자여야 합니다.')
    }

    const coffee = await CoffeeService.createCoffee({
      name: name.trim(),
      price,
      remainingGrams
    })

    return successResponse({ coffee }, '커피가 성공적으로 추가되었습니다.')
  } catch (error) {
    return serverErrorResponse(error)
  }
}