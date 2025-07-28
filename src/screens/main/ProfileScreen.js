import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../context/AuthContext'
import { Colors } from '../../constants/Colors'

const ProfileScreen = ({ navigation }) => {
  const { profile, signOut } = useAuth()

  const menuItems = [
    {
      id: 'userSearch',
      title: '👥 Kullanıcı Ara',
      subtitle: 'Oyuncuları bul ve profillerini incele',
      icon: 'search',
      onPress: () => navigation.navigate('UserSearch'),
    },
    {
      id: 'gameProfiles',
      title: '🎮 Oyun Profilleri',
      subtitle: 'Oyun içi profillerinizi yönetin',
      icon: 'game-controller',
      onPress: () => navigation.navigate('UserGameProfiles'),
    },
    {
      id: 'notifications',
      title: '🔔 Bildirim Ayarları',
      subtitle: 'Bildirim tercihlerinizi düzenleyin',
      icon: 'notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'settings',
      title: '⚙️ Ayarlar',
      subtitle: 'Uygulama ayarlarını düzenleyin',
      icon: 'settings',
      onPress: () => console.log('Ayarlar'),
    },
    {
      id: 'help',
      title: '❓ Yardım',
      subtitle: 'Sık sorulan sorular ve destek',
      icon: 'help-circle',
      onPress: () => console.log('Yardım'),
    },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <View style={styles.profilePicture}>
              <Ionicons name="person" size={40} color={Colors.text.white} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {profile?.full_name || profile?.username || 'Kullanıcı'}
              </Text>
              <Text style={styles.profileUsername}>
                @{profile?.username || 'kullanici'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons name={item.icon} size={24} color={Colors.primary} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
        >
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    color: Colors.text.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileUsername: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.card.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})

export default ProfileScreen 