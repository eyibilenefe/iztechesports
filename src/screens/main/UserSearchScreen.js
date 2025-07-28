import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Modal, 
  Alert,
  ActivityIndicator 
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { dbService } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const UserSearchScreen = ({ navigation }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Kullanıcı arama
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await dbService.searchUsers(searchQuery.trim())
      if (!error) {
        setSearchResults(data || [])
      } else {
        Alert.alert('Hata', 'Kullanıcılar aranamadı.')
      }
    } catch (error) {
      Alert.alert('Hata', 'Arama sırasında bir hata oluştu.')
    }
    setLoading(false)
  }

  // Kullanıcı profili görüntüleme
  const handleViewProfile = async (userData) => {
    setSelectedUser(userData)
    setProfileModalVisible(true)
    setLoadingProfile(true)

    try {
      // Kullanıcının detaylı bilgilerini al
      const { data: profileData, error } = await dbService.getUserDetailedProfile(userData.id)
      if (!error) {
        setUserProfile(profileData)
      } else {
        Alert.alert('Hata', 'Profil bilgileri yüklenemedi.')
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil yüklenirken bir hata oluştu.')
    }
    setLoadingProfile(false)
  }

  // Kullanıcıya mesaj gönderme (gelecekte implement edilecek)
  const handleSendMessage = (userId) => {
    Alert.alert('Bilgi', 'Mesaj özelliği yakında eklenecek!')
  }

  // Kullanıcıyı takip etme (gelecekte implement edilecek)
  const handleFollowUser = (userId) => {
    Alert.alert('Bilgi', 'Takip özelliği yakında eklenecek!')
  }

  return (
    <View style={styles.container}>
      {/* Arama Başlığı */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Kullanıcı Ara</Text>
        <Text style={styles.headerSubtitle}>Oyuncuları bul ve profillerini incele</Text>
      </View>

      {/* Arama Kutusu */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kullanıcı adı veya isim ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Ara</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Arama Sonuçları */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {searchResults.length > 0 ? (
          searchResults.map((userData, index) => (
            <TouchableOpacity
              key={userData.id}
              style={styles.userCard}
              onPress={() => handleViewProfile(userData)}
              activeOpacity={0.7}
            >
              <View style={styles.userCardHeader}>
                <Image
                  source={
                    userData.profile_picture_url
                      ? { uri: userData.profile_picture_url }
                      : require('../../../assets/icon.png')
                  }
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{userData.username}</Text>
                  <Text style={styles.fullName}>{userData.full_name || 'İsim belirtilmemiş'}</Text>
                  <Text style={styles.userStats}>
                    {userData.tournament_count || 0} Turnuva • {userData.match_count || 0} Maç
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
              </View>
            </TouchableOpacity>
          ))
        ) : searchQuery.length > 0 && !loading ? (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.noResultsText}>Kullanıcı bulunamadı</Text>
            <Text style={styles.noResultsSubtext}>
              "{searchQuery}" için sonuç bulunamadı
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyStateText}>Kullanıcı aramaya başlayın</Text>
            <Text style={styles.emptyStateSubtext}>
              Kullanıcı adı veya isim ile arama yapın
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Kullanıcı Profil Modalı */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedUser && (
                <>
                  {/* Profil Başlığı */}
                  <View style={styles.profileHeader}>
                    <Image
                      source={
                        selectedUser.profile_picture_url
                          ? { uri: selectedUser.profile_picture_url }
                          : require('../../../assets/icon.png')
                      }
                      style={styles.profileAvatar}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{selectedUser.username}</Text>
                      <Text style={styles.profileFullName}>
                        {selectedUser.full_name || 'İsim belirtilmemiş'}
                      </Text>
                      <Text style={styles.profileEmail}>{selectedUser.email}</Text>
                    </View>
                  </View>

                  {/* Aksiyon Butonları */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleFollowUser(selectedUser.id)}
                    >
                      <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
                      <Text style={styles.actionButtonText}>Takip Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.messageButton]}
                      onPress={() => handleSendMessage(selectedUser.id)}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mesaj</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Detaylı Profil Bilgileri */}
                  {loadingProfile ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.loadingText}>Profil yükleniyor...</Text>
                    </View>
                  ) : userProfile ? (
                    <View style={styles.profileDetails}>
                      {/* İstatistikler */}
                      <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>📊 İstatistikler</Text>
                        <View style={styles.statsGrid}>
                          <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{userProfile.tournament_count || 0}</Text>
                            <Text style={styles.statLabel}>Turnuva</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{userProfile.match_count || 0}</Text>
                            <Text style={styles.statLabel}>Maç</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{userProfile.win_count || 0}</Text>
                            <Text style={styles.statLabel}>Galibiyet</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                              {userProfile.win_rate ? `${userProfile.win_rate}%` : '0%'}
                            </Text>
                            <Text style={styles.statLabel}>Kazanma Oranı</Text>
                          </View>
                        </View>
                      </View>

                      {/* Oyun Profilleri */}
                      <View style={styles.gameProfilesSection}>
                        <Text style={styles.sectionTitle}>🎮 Oyun Profilleri</Text>
                        {userProfile.game_profiles && userProfile.game_profiles.length > 0 ? (
                          userProfile.game_profiles.map((profile, index) => (
                            <View key={index} style={styles.gameProfileItem}>
                              <Text style={styles.gameName}>{profile.games?.name || 'Bilinmeyen Oyun'}</Text>
                              <View style={styles.gameProfileDetails}>
                                <Text style={styles.nickname}>Nickname: {profile.nickname}</Text>
                                {profile.rank && (
                                  <Text style={styles.rank}>Rank: {profile.rank}</Text>
                                )}
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noGameProfiles}>Henüz oyun profili yok</Text>
                        )}
                      </View>

                      {/* Son Aktiviteler */}
                      <View style={styles.activitiesSection}>
                        <Text style={styles.sectionTitle}>⚡ Son Aktiviteler</Text>
                        {userProfile.recent_matches && userProfile.recent_matches.length > 0 ? (
                          userProfile.recent_matches.slice(0, 3).map((match, index) => (
                            <View key={index} style={styles.activityItem}>
                              <Text style={styles.activityText}>
                                {match.tournaments?.name || 'Turnuva'} - {match.result || 'Bilinmeyen'}
                              </Text>
                              <Text style={styles.activityDate}>
                                {new Date(match.created_at).toLocaleDateString('tr-TR')}
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noActivities}>Henüz aktivite yok</Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.errorText}>Profil bilgileri yüklenemedi</Text>
                  )}
                </>
              )}
            </ScrollView>

            {/* Modal Kapatma Butonu */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  userStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileFullName: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  messageButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  profileDetails: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  gameProfilesSection: {
    marginBottom: 20,
  },
  gameProfileItem: {
    backgroundColor: Colors.card.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  gameProfileDetails: {
    gap: 4,
  },
  nickname: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  rank: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  noGameProfiles: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  activitiesSection: {
    marginBottom: 20,
  },
  activityItem: {
    backgroundColor: Colors.card.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  activityText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  noActivities: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    paddingVertical: 20,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default UserSearchScreen 