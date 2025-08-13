-- ========================================
-- 1단계: 사용자별 시간대 중복 주문 방지 (유니크 인덱스)
-- ========================================
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_daily_timeslot_order 
ON daily_orders (user_id, order_date, time_slot);

-- ========================================
-- 2단계: 시간대별 최대 주문 수 제한 함수
-- ========================================
CREATE OR REPLACE FUNCTION check_timeslot_order_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_orders_per_timeslot INTEGER := 1;
BEGIN
    SELECT COUNT(*) INTO current_count
    FROM daily_orders
    WHERE order_date = NEW.order_date 
    AND time_slot = NEW.time_slot;
    
    IF current_count >= max_orders_per_timeslot THEN
        RAISE EXCEPTION '현재 시간대 주문이 마감되었습니다. (최대 % 잔)', max_orders_per_timeslot;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3단계: 트리거 생성
-- ========================================
DROP TRIGGER IF EXISTS timeslot_order_limit_trigger ON daily_orders;
CREATE TRIGGER timeslot_order_limit_trigger
    BEFORE INSERT ON daily_orders
    FOR EACH ROW
    EXECUTE FUNCTION check_timeslot_order_limit();