# 자동화된 일일 초기화 시스템 개선안

## 📋 현재 상황 (AS-IS)

### 문제점
1. **수동 데이터 관리**: 모든 주문 데이터가 무한정 누적됨
2. **성능 저하**: 시간이 지날수록 쿼리 성능 저하
3. **통계 정보 부재**: 일별/주별 트렌드 분석 불가
4. **재고 관리 한계**: 실시간 재고만 확인 가능, 예측 불가

### 현재 데이터 구조
```sql
daily_orders 테이블만 존재:
- 모든 주문 데이터 영구 보관
- 날짜별 필터링으로 조회
- 통계 정보 없음
```

## 🎯 개선 방향 (TO-BE)

### 새로운 아키텍처
1. **자동화된 일일 초기화** (매일 자정 실행)
2. **통계 데이터 자동 생성** 
3. **오래된 데이터 아카이브**
4. **예측 기반 재고 관리**
5. **자동 리포트 발송**

## 🗄️ 새로운 데이터베이스 스키마

### 1. 일일 통계 테이블
```sql
CREATE TABLE daily_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  popular_coffee_id UUID REFERENCES coffees(id),
  popular_coffee_name VARCHAR(100),
  popular_coffee_orders INTEGER DEFAULT 0,
  total_grams_consumed INTEGER DEFAULT 0,
  average_orders_per_user DECIMAL(4,2) DEFAULT 0,
  morning_orders INTEGER DEFAULT 0,
  afternoon_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 커피별 일일 통계
```sql
CREATE TABLE daily_coffee_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  coffee_id UUID NOT NULL REFERENCES coffees(id),
  coffee_name VARCHAR(100) NOT NULL,
  orders_count INTEGER DEFAULT 0,
  grams_consumed INTEGER DEFAULT 0,
  morning_orders INTEGER DEFAULT 0,
  afternoon_orders INTEGER DEFAULT 0,
  popularity_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, coffee_id)
);
```

### 3. 주문 아카이브 테이블
```sql
CREATE TABLE archived_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_order_id UUID NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  coffee_id UUID NOT NULL,
  coffee_name VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  original_created_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 인덱스 생성
```sql
CREATE INDEX idx_daily_statistics_date ON daily_statistics(date);
CREATE INDEX idx_daily_coffee_stats_date ON daily_coffee_stats(date);
CREATE INDEX idx_daily_coffee_stats_coffee ON daily_coffee_stats(coffee_id);
CREATE INDEX idx_archived_orders_date ON archived_orders(order_date);
CREATE INDEX idx_archived_orders_user ON archived_orders(user_id);
```

## 🔄 자동화 프로세스

### 1. 일일 초기화 작업 순서
```typescript
// 매일 자정 00:00 실행
export async function dailyResetJob() {
  try {
    console.log('=== 일일 초기화 시작 ===', new Date().toISOString())
    
    const yesterday = getYesterday()
    
    // 1단계: 일일 통계 생성
    await generateDailyStatistics(yesterday)
    
    // 2단계: 커피별 통계 생성  
    await generateCoffeeStatistics(yesterday)
    
    // 3단계: 7일 이전 데이터 아카이브
    await archiveOldOrders(7)
    
    // 4단계: 일일 리포트 생성 및 발송
    await sendDailyReport(yesterday)
    
    // 5단계: 재고 알림 체크
    await checkInventoryAlerts()
    
    console.log('=== 일일 초기화 완료 ===')
    
  } catch (error) {
    console.error('일일 초기화 실패:', error)
    // 에러 알림 발송
    await sendErrorAlert(error)
  }
}
```

### 2. 통계 생성 로직
```typescript
async function generateDailyStatistics(date: string) {
  // 해당 날짜 주문 데이터 조회
  const orders = await getDailyOrders(date)
  
  if (orders.length === 0) return
  
  // 통계 계산
  const stats = {
    date,
    total_orders: orders.length,
    total_users: new Set(orders.map(o => o.userId)).size,
    total_grams_consumed: orders.length * 20,
    morning_orders: orders.filter(o => o.timeSlot === 'morning').length,
    afternoon_orders: orders.filter(o => o.timeSlot === 'afternoon').length,
    // 인기 커피 계산
    ...calculatePopularCoffee(orders)
  }
  
  // DB에 저장
  await saveDailyStatistics(stats)
}
```

### 3. 아카이브 시스템
```typescript
async function archiveOldOrders(daysToKeep: number = 7) {
  const archiveDate = getDateDaysAgo(daysToKeep)
  
  // 오래된 주문 조회
  const oldOrders = await getOrdersBeforeDate(archiveDate)
  
  if (oldOrders.length > 0) {
    // 아카이브 테이블로 이동
    await moveToArchive(oldOrders)
    
    // 원본 데이터 삭제
    await deleteOldOrders(archiveDate)
    
    console.log(`${oldOrders.length}건의 주문을 아카이브했습니다.`)
  }
}
```

## 📊 새로운 관리자 기능

### 1. 통계 대시보드
- **일별/주별/월별 주문 트렌드 차트**
- **커피별 인기도 순위**
- **사용자 주문 패턴 분석**
- **재고 소비 예측**

### 2. 실시간 알림
- **재고 부족 알림** (30g 이하 시)
- **주문 급증 알림** 
- **시스템 오류 알림**
- **일일 리포트 자동 발송**

### 3. 예측 분석
- **재고 소진 예상 일자**
- **주문량 예측** (과거 데이터 기반)
- **인기 커피 트렌드**

## 🚀 구현 단계

### Phase 1: 기본 인프라 (1-2일)
- [ ] 새로운 테이블 스키마 생성
- [ ] 기본 통계 생성 로직 구현
- [ ] 일일 초기화 API 엔드포인트

### Phase 2: 자동화 시스템 (2-3일)  
- [ ] Vercel Cron 설정
- [ ] 아카이브 시스템 구현
- [ ] 에러 처리 및 알림

### Phase 3: 대시보드 개선 (3-4일)
- [ ] 통계 대시보드 UI
- [ ] 차트 및 그래프 구현
- [ ] 실시간 데이터 연동

### Phase 4: 고도화 기능 (5-7일)
- [ ] 예측 분석 알고리즘
- [ ] 자동 리포트 시스템
- [ ] 고급 알림 기능

## 📝 API 엔드포인트 설계

### 자동화 관련
```
POST /api/cron/daily-reset         # 일일 초기화 실행
GET  /api/stats/daily?date=YYYY-MM-DD  # 일일 통계 조회
GET  /api/stats/weekly?start=YYYY-MM-DD # 주간 통계 조회
GET  /api/stats/coffee-ranking?days=7   # 커피 인기 순위
```

### 관리자 대시보드
```
GET  /api/admin/dashboard          # 대시보드 데이터
GET  /api/admin/trends?period=week # 트렌드 분석
GET  /api/admin/alerts             # 알림 목록
POST /api/admin/alerts/dismiss     # 알림 해제
```

## 🔧 기술 스택

### 스케줄링
- **Vercel Cron**: 서버리스 환경에서 스케줄 작업
- **Backup**: GitHub Actions cron (Vercel 대안)

### 알림 시스템
- **이메일**: Nodemailer + Gmail SMTP
- **슬랙**: Slack Webhook API
- **웹 알림**: Server-Sent Events (SSE)

### 차트/그래프
- **Chart.js**: 기본 차트 라이브러리
- **Recharts**: React 전용 차트 (대안)

## 💡 예상 효과

### 성능 개선
- **DB 쿼리 속도**: 90% 향상 (최근 7일 데이터만 조회)
- **관리 업무**: 80% 자동화

### 관리 효율성
- **실시간 모니터링**: 24/7 자동 감시
- **예측 관리**: 재고 부족 사전 방지
- **데이터 기반 의사결정**: 통계 기반 메뉴 관리

이 시스템을 구현하면 **반응형 주문 시스템**에서 **예측형 지능 관리 시스템**으로 진화할 수 있습니다.