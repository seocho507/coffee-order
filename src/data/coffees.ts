import { Coffee } from '@/types/coffee'

export const DAILY_ORDER_LIMIT = 2

export const coffees: Coffee[] = [
  {
    id: '1',
    name: '게이샤 블렌드',
    price: 3000,
    remainingGrams: 140,
    available: true
  },
  {
    id: '2',
    name: '콜롬비아 게이샤 워시드',
    price: 4000,
    remainingGrams: 100,
    available: true
  },
  {
    id: '3',
    name: '페루 게이샤 워시드',
    price: 4000,
    remainingGrams: 60,
    available: true
  },
  {
    id: '4',
    name: '코스타리카 게이샤 레드허니',
    price: 3000,
    remainingGrams: 180,
    available: true
  },
  {
    id: '5',
    name: '콜롬비아 게이샤 무산소 워시드',
    price: 4000,
    remainingGrams: 160,
    available: true
  }
]