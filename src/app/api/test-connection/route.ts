import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // auth.users 테이블로 연결 테스트 (인증 시스템에서 기본 제공)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // 연결 자체가 성공하면 OK (사용자 로그인 여부와 관계없이)
    return NextResponse.json({
      status: 'success',
      message: 'Supabase 연결 성공',
      timestamp: new Date().toISOString(),
      authenticated: !!user
    })

  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      status: 'error',
      message: '데이터베이스 연결 테스트 실패',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}