import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BabyRoad | 베이비로드',
    template: '%s | BabyRoad',
  },
  description: '임신부터 학교가기 전까지, 우리 아이 성장 로드맵',
  keywords: ['육아', '아이 성장', '예방접종', '발달', '베이비로드', 'babyroad'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
