import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 성능 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 프로덕션에서 console.log 제거
  },
  
  // 번들 분석 및 최적화
  experimental: {
    optimizePackageImports: ['react-hot-toast', '@supabase/supabase-js'],
  },
  
  // 압축 최적화
  compress: true,
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
  },
  
  // 정적 파일 최적화
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
