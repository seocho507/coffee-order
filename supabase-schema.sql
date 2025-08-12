-- 커피 테이블
CREATE TABLE coffees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  remaining_grams INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE daily_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  coffee_id UUID NOT NULL REFERENCES coffees(id),
  coffee_name VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_daily_orders_user_date ON daily_orders(user_id, order_date);
CREATE INDEX idx_daily_orders_date ON daily_orders(order_date);
CREATE INDEX idx_coffees_available ON coffees(available);

-- 초기 커피 데이터 삽입
INSERT INTO coffees (name, price, remaining_grams, available) VALUES
('게이샤 블렌드', 3000, 140, true),
('콜롬비아 게이샤 워시드', 4000, 100, true),
('페루 게이샤 워시드', 4000, 60, true),
('코스타리카 게이샤 레드허니', 3000, 180, true),
('콜롬비아 게이샤 무산소 워시드', 4000, 160, true);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_orders ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 커피 목록을 조회할 수 있도록 허용
CREATE POLICY "Allow read access to coffees" ON coffees FOR SELECT USING (true);

-- 사용자는 자신의 주문만 조회 가능
CREATE POLICY "Users can view their own orders" ON daily_orders FOR SELECT USING (true);

-- 사용자는 자신의 주문만 생성 가능
CREATE POLICY "Users can insert their own orders" ON daily_orders FOR INSERT WITH CHECK (true);