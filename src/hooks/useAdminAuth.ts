import { useAuth } from './useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const ADMIN_EMAILS = ['floyd.lee@parksystems.com']

export function useAdminAuth() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }

      if (!ADMIN_EMAILS.includes(user.email || '')) {
        toast.error('관리자 권한이 필요합니다.')
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, router])

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')

  return {
    user,
    loading,
    isAdmin,
    signOut
  }
}