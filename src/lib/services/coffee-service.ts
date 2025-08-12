import { supabaseAdmin } from '@/lib/supabase/config'
import { Coffee } from '@/types/coffee'
import { ORDER_LIMITS } from '@/lib/utils/api-helpers'

export class CoffeeService {
  // 모든 커피 조회
  static async getAllCoffees(): Promise<Coffee[]> {
    const { data, error } = await supabaseAdmin
      .from('coffees')
      .select('*')
      .eq('available', true)
      .order('name')

    if (error) {
      throw new Error(`커피 목록 조회 실패: ${error.message}`)
    }

    return data?.map(coffee => ({
      id: coffee.id,
      name: coffee.name,
      price: coffee.price,
      remainingGrams: coffee.remaining_grams,
      available: coffee.available
    })) || []
  }

  // 특정 커피 조회
  static async getCoffeeById(id: string): Promise<Coffee | null> {
    const { data, error } = await supabaseAdmin
      .from('coffees')
      .select('*')
      .eq('id', id)
      .eq('available', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`커피 조회 실패: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      remainingGrams: data.remaining_grams,
      available: data.available
    }
  }

  // 커피 생성
  static async createCoffee(coffeeData: {
    name: string
    price: number
    remainingGrams: number
  }): Promise<Coffee> {
    const { data, error } = await supabaseAdmin
      .from('coffees')
      .insert([{
        name: coffeeData.name,
        price: coffeeData.price,
        remaining_grams: coffeeData.remainingGrams,
        available: true
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`커피 생성 실패: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      remainingGrams: data.remaining_grams,
      available: data.available
    }
  }

  // 커피 업데이트
  static async updateCoffee(
    id: string, 
    updateData: Partial<Omit<Coffee, 'id'>>
  ): Promise<Coffee> {
    const dbUpdateData: any = {}
    if (updateData.name !== undefined) dbUpdateData.name = updateData.name
    if (updateData.price !== undefined) dbUpdateData.price = updateData.price
    if (updateData.remainingGrams !== undefined) dbUpdateData.remaining_grams = updateData.remainingGrams
    if (updateData.available !== undefined) dbUpdateData.available = updateData.available
    dbUpdateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('coffees')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`커피 업데이트 실패: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      remainingGrams: data.remaining_grams,
      available: data.available
    }
  }

  // 커피 삭제
  static async deleteCoffee(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('coffees')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`커피 삭제 실패: ${error.message}`)
    }
  }

  // 재고 차감
  static async decreaseStock(id: string, grams: number = ORDER_LIMITS.GRAMS_PER_CUP): Promise<void> {
    const coffee = await this.getCoffeeById(id)
    if (!coffee) {
      throw new Error('커피를 찾을 수 없습니다.')
    }

    await this.updateCoffee(id, {
      remainingGrams: coffee.remainingGrams - grams
    })
  }

  // 재고 복구
  static async restoreStock(id: string, grams: number = ORDER_LIMITS.GRAMS_PER_CUP): Promise<void> {
    const coffee = await this.getCoffeeById(id)
    if (!coffee) {
      throw new Error('커피를 찾을 수 없습니다.')
    }

    await this.updateCoffee(id, {
      remainingGrams: coffee.remainingGrams + grams
    })
  }

  // 주문 가능 여부 체크
  static async canOrder(id: string): Promise<{ canOrder: boolean; reason?: string }> {
    const coffee = await this.getCoffeeById(id)
    
    if (!coffee) {
      return { canOrder: false, reason: '커피를 찾을 수 없습니다.' }
    }

    if (!coffee.available) {
      return { canOrder: false, reason: '현재 주문할 수 없는 커피입니다.' }
    }

    if (coffee.remainingGrams < ORDER_LIMITS.MIN_GRAMS_REQUIRED) {
      return { canOrder: false, reason: '커피 재고가 부족합니다.' }
    }

    return { canOrder: true }
  }
}