import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useAuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      toast.error('이메일과 비밀번호를 입력해주세요')
      return
    }

    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('이메일 또는 비밀번호가 올바르지 않습니다')
          } else {
            toast.error('로그인 실패: ' + error.message)
          }
        } else {
          toast.success('로그인 성공!')
          router.push('/dashboard')
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('이미 등록된 이메일입니다')
          } else {
            toast.error('회원가입 실패: ' + error.message)
          }
        } else {
          if (data.user?.email_confirmed_at) {
            toast.success('회원가입 성공! 로그인해주세요.')
            setIsLogin(true)
            setPassword('')
          } else {
            toast.success('회원가입 성공! 이메일을 확인해주세요.')
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setPassword('')
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setLoading(false)
  }

  return {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
    toggleMode,
    resetForm
  }
}