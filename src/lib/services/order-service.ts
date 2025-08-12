import { supabaseAdmin } from '@/lib/supabase/config'
import { DailyOrder, TimeSlot } from '@/types/coffee'
import { 
  getTodayString, 
  getCurrentTimeSlot, 
  ERROR_MESSAGES,
  validateOrderTime,
  validateDailyOrderLimit 
} from '@/lib/config/order-restrictions'
import { CoffeeService } from './coffee-service'

export class OrderService {
  // 주문 생성
  static async createOrder(orderData: {
    userId: string
    userName: string
    coffeeId: string
  }): Promise<DailyOrder> {
    const { userId, userName, coffeeId } = orderData

    // 현재 시간대 체크
    const timeValidation = validateOrderTime()
    if (!timeValidation.canOrder) {
      throw new Error(timeValidation.reason!)
    }
    
    const timeSlot = getCurrentTimeSlot()!

    // 커피 주문 가능 여부 체크
    const { canOrder, reason } = await CoffeeService.canOrder(coffeeId)
    if (!canOrder) {
      throw new Error(reason!)
    }

    // 일일 주문 제한 체크
    const todayOrders = await this.getUserOrdersForDate(userId, getTodayString())
    const dailyLimitValidation = validateDailyOrderLimit(todayOrders.length)
    if (!dailyLimitValidation.canOrder) {
      throw new Error(dailyLimitValidation.reason!)
    }

    // 커피 정보 가져오기
    const coffee = await CoffeeService.getCoffeeById(coffeeId)
    if (!coffee) {
      throw new Error(ERROR_MESSAGES.COFFEE_NOT_FOUND)
    }

    // 주문 생성
    const { data, error } = await supabaseAdmin
      .from('daily_orders')
      .insert([{
        user_id: userId,
        user_name: userName,
        coffee_id: coffeeId,
        coffee_name: coffee.name,
        order_date: getTodayString(),
        time_slot: timeSlot
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`주문 생성 실패: ${error.message}`)
    }

    // 커피 재고 차감
    try {
      await CoffeeService.decreaseStock(coffeeId)
    } catch (stockError) {
      // 주문은 생성되었지만 재고 차감 실패 - 로그만 남김
      console.error('재고 차감 실패:', stockError)
    }

    return this.formatOrder(data)
  }

  // 주문 삭제
  static async deleteOrder(orderId: string): Promise<void> {
    // 주문 정보 조회
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('daily_orders')
      .select('coffee_id')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND)
    }

    // 주문 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('daily_orders')
      .delete()
      .eq('id', orderId)

    if (deleteError) {
      throw new Error(`주문 삭제 실패: ${deleteError.message}`)
    }

    // 커피 재고 복구
    try {
      await CoffeeService.restoreStock(order.coffee_id)
    } catch (stockError) {
      console.error('재고 복구 실패:', stockError)
    }
  }

  // 사용자의 특정 날짜 주문 조회
  static async getUserOrdersForDate(userId: string, date: string): Promise<DailyOrder[]> {
    const { data, error } = await supabaseAdmin
      .from('daily_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('order_date', date)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`주문 조회 실패: ${error.message}`)
    }

    return data?.map(this.formatOrder) || []
  }

  // 특정 날짜의 모든 주문 조회
  static async getAllOrdersForDate(date: string): Promise<DailyOrder[]> {
    const { data, error } = await supabaseAdmin
      .from('daily_orders')
      .select('*')
      .eq('order_date', date)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`주문 조회 실패: ${error.message}`)
    }

    return data?.map(this.formatOrder) || []
  }

  // 주문 가능 여부 체크
  static async canUserOrder(userId: string): Promise<{ canOrder: boolean; reason?: string }> {
    // 시간대 체크
    const timeValidation = validateOrderTime()
    if (!timeValidation.canOrder) {
      return timeValidation
    }

    // 일일 주문 제한 체크
    const todayOrders = await this.getUserOrdersForDate(userId, getTodayString())
    const dailyLimitValidation = validateDailyOrderLimit(todayOrders.length)
    if (!dailyLimitValidation.canOrder) {
      return dailyLimitValidation
    }

    return { canOrder: true }
  }

  // DB 데이터를 DailyOrder 타입으로 변환
  private static formatOrder(dbOrder: any): DailyOrder {
    return {
      id: dbOrder.id,
      userId: dbOrder.user_id,
      userName: dbOrder.user_name,
      coffeeId: dbOrder.coffee_id,
      coffeeName: dbOrder.coffee_name,
      orderDate: dbOrder.order_date,
      timeSlot: dbOrder.time_slot as TimeSlot,
      createdAt: dbOrder.created_at
    }
  }
}