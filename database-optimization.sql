-- 데이터베이스 쿼리 최적화를 위한 인덱스 및 설정

-- 1. 기존 인덱스 확인 및 추가 최적화
-- 주문 테이블 최적화
CREATE INDEX IF NOT EXISTS idx_daily_orders_user_date_time ON daily_orders(user_id, order_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_daily_orders_coffee_date ON daily_orders(coffee_id, order_date);
CREATE INDEX IF NOT EXISTS idx_daily_orders_created_at ON daily_orders(created_at DESC);

-- 커피 테이블 최적화
CREATE INDEX IF NOT EXISTS idx_coffees_available_grams ON coffees(available, remaining_grams);
CREATE INDEX IF NOT EXISTS idx_coffees_name ON coffees(name);

-- 2. 통계 수집 활성화 (PostgreSQL 기준)
-- Supabase에서 자동으로 관리되므로 일반적으로 불필요하지만 참고용
-- ANALYZE daily_orders;
-- ANALYZE coffees;

-- 3. 파티셔닝 준비 (대용량 데이터 대비)
-- 월별 파티션 테이블 예시 (필요시 적용)
/*
CREATE TABLE daily_orders_y2025m01 PARTITION OF daily_orders
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE daily_orders_y2025m02 PARTITION OF daily_orders  
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
*/

-- 4. 자주 사용되는 쿼리 최적화를 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_orders_optimized 
ON daily_orders(order_date, user_id, created_at DESC);

-- 5. 부분 인덱스 (활성 커피만 대상)
CREATE INDEX IF NOT EXISTS idx_coffees_available_only 
ON coffees(id, remaining_grams) WHERE available = true;

-- 6. 문자열 검색 최적화 (필요시)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_coffees_name_trgm ON coffees USING gin(name gin_trgm_ops);

-- 7. 성능 모니터링을 위한 뷰 (선택사항)
CREATE OR REPLACE VIEW order_stats AS
SELECT 
  order_date,
  COUNT(*) as total_orders,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN time_slot = 'morning' THEN 1 END) as morning_orders,
  COUNT(CASE WHEN time_slot = 'afternoon' THEN 1 END) as afternoon_orders
FROM daily_orders 
GROUP BY order_date 
ORDER BY order_date DESC;

-- 8. 커피별 통계 뷰
CREATE OR REPLACE VIEW coffee_popularity AS
SELECT 
  c.id,
  c.name,
  c.remaining_grams,
  COUNT(o.id) as order_count,
  COUNT(o.id) * 20 as total_grams_consumed
FROM coffees c
LEFT JOIN daily_orders o ON c.id = o.coffee_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.name, c.remaining_grams
ORDER BY order_count DESC;