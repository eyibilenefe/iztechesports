import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../../context/AuthContext'

const ProfileScreen = () => {
  const { profile } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>
        {profile?.full_name || 'Kullanıcı'} profil sayfası
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})

export default ProfileScreen 