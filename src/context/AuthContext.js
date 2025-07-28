import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, dbService } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const getSession = async () => {
      try {
        const { data: { user } } = await authService.getCurrentUser()
        setUser(user)
        setSession(user?.session || null)
        
        if (user) {
          // Kullanıcı profili bilgilerini al
          const { data: profileData } = await dbService.getProfile(user.id)
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Session kontrol hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Auth durumu değişikliklerini dinle
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          // Kullanıcı girişi yaptı, profil bilgilerini al
          const { data: profileData } = await dbService.getProfile(session.user.id)
          setProfile(profileData)
        } else {
          // Kullanıcı çıkış yaptı
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Giriş fonksiyonu
  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signIn(email, password)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Giriş hatası:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Kayıt fonksiyonu
  const signUp = async (email, password, userData) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signUp(email, password, userData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Kayıt hatası:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Çıkış fonksiyonu
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authService.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Çıkış hatası:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 