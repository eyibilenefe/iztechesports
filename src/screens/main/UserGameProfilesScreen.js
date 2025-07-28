import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Animatable from 'react-native-animatable'

import { useAuth } from '../../context/AuthContext'
import { dbService } from '../../services/supabase'
import { Colors, GameColors } from '../../constants/Colors'

const UserGameProfilesScreen = ({ navigation }) => {
  const { user, profile } = useAuth()
  const [gameProfiles, setGameProfiles] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [nickname, setNickname] = useState('')
  const [rank, setRank] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profilesRes, gamesRes] = await Promise.all([
        dbService.getAllUserGameProfiles(user.id),
        dbService.getGames()
      ])

      setGameProfiles(profilesRes.data || [])
      setGames(gamesRes.data || [])
    } catch (error) {
      console.error('Oyun profilleri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = () => {
    setEditingProfile(null)
    setNickname('')
    setRank('')
    setSelectedGame(null)
    setModalVisible(true)
  }

  const handleEditProfile = (profile) => {
    setEditingProfile(profile)
    setNickname(profile.nickname)
    setRank(profile.rank || '')
    setSelectedGame(profile.game_id)
    setModalVisible(true)
  }

  const handleSaveProfile = async () => {
    if (!selectedGame || !nickname.trim()) {
      Alert.alert('Hata', 'Lütfen oyun seçin ve nickname girin.')
      return
    }

    setSaving(true)
    try {
      if (editingProfile) {
        // Güncelleme
        const { error } = await dbService.createOrUpdateUserGameProfile(
          user.id,
          selectedGame,
          nickname.trim(),
          rank.trim() || null
        )
        if (error) throw error
      } else {
        // Yeni oluşturma
        const { error } = await dbService.createOrUpdateUserGameProfile(
          user.id,
          selectedGame,
          nickname.trim(),
          rank.trim() || null
        )
        if (error) throw error
      }

      setModalVisible(false)
      loadData()
      Alert.alert('Başarılı', 'Oyun profili kaydedildi!')
    } catch (error) {
      console.error('Profil kaydetme hatası:', error)
      Alert.alert('Hata', 'Profil kaydedilemedi!')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProfile = (profile) => {
    Alert.alert(
      'Profil Sil',
      `${profile.games?.name} oyun profilinizi silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await dbService.deleteUserGameProfile(user.id, profile.game_id)
              if (error) throw error
              loadData()
              Alert.alert('Başarılı', 'Profil silindi!')
            } catch (error) {
              console.error('Profil silme hatası:', error)
              Alert.alert('Hata', 'Profil silinemedi!')
            }
          }
        }
      ]
    )
  }

  const getGameColor = (gameName) => {
    return GameColors[gameName] || GameColors.default
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Oyun profilleri yükleniyor...</Text>
      </View>
    )
  }

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
          <Text style={styles.headerTitle}>🎮 Oyun Profilleri</Text>
          <Text style={styles.headerSubtitle}>
            {gameProfiles.length} oyun profili
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Create Profile Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProfile}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primary]}
            style={styles.createButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color={Colors.text.white} />
            <Text style={styles.createButtonText}>Yeni Oyun Profili Ekle</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Game Profiles List */}
        <View style={styles.profilesContainer}>
          {gameProfiles.length > 0 ? (
            gameProfiles.map((profile, index) => (
              <Animatable.View
                key={profile.id}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.profileCard}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.gameInfo}>
                    <View style={[
                      styles.gameIcon,
                      { backgroundColor: getGameColor(profile.games?.name) }
                    ]}>
                      <Ionicons name="game-controller" size={20} color={Colors.text.white} />
                    </View>
                    <View style={styles.gameDetails}>
                      <Text style={styles.gameName}>{profile.games?.name}</Text>
                      <Text style={styles.nickname}>@{profile.nickname}</Text>
                    </View>
                  </View>
                  <View style={styles.profileActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditProfile(profile)}
                    >
                      <Ionicons name="pencil" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteProfile(profile)}
                    >
                      <Ionicons name="trash" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {profile.rank && (
                  <View style={styles.rankContainer}>
                    <Ionicons name="trophy" size={16} color={Colors.warning} />
                    <Text style={styles.rankText}>{profile.rank}</Text>
                  </View>
                )}

                <Text style={styles.createdAt}>
                  Oluşturulma: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="game-controller-outline" size={80} color={Colors.text.disabled} />
              <Text style={styles.emptyTitle}>Oyun Profili Bulunamadı</Text>
              <Text style={styles.emptyText}>
                Henüz hiç oyun profili oluşturmamışsınız. Turnuvalara katılmak için oyun profillerinizi oluşturun.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProfile ? 'Profil Düzenle' : 'Yeni Oyun Profili'}
            </Text>

            {/* Game Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Oyun Seçin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {games.map(game => (
                  <TouchableOpacity
                    key={game.id}
                    style={[
                      styles.gameOption,
                      selectedGame === game.id && styles.gameOptionSelected
                    ]}
                    onPress={() => setSelectedGame(game.id)}
                  >
                    <View style={[
                      styles.gameOptionIcon,
                      { backgroundColor: getGameColor(game.name) }
                    ]}>
                      <Ionicons name="game-controller" size={16} color={Colors.text.white} />
                    </View>
                    <Text style={[
                      styles.gameOptionText,
                      selectedGame === game.id && styles.gameOptionTextSelected
                    ]}>
                      {game.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Nickname Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nickname *</Text>
              <TextInput
                style={styles.textInput}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Oyun içi kullanıcı adınız"
                placeholderTextColor={Colors.text.disabled}
              />
            </View>

            {/* Rank Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Rank (İsteğe bağlı)</Text>
              <TextInput
                style={styles.textInput}
                value={rank}
                onChangeText={setRank}
                placeholder="Örn: Diamond, Global Elite, Challenger"
                placeholderTextColor={Colors.text.disabled}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.text.white} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingProfile ? 'Güncelle' : 'Oluştur'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.text.secondary,
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  createButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profilesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nickname: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankText: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginLeft: 6,
  },
  createdAt: {
    color: Colors.text.disabled,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  gameOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  gameOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gameOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  gameOptionText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  gameOptionTextSelected: {
    color: Colors.text.white,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.card.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default UserGameProfilesScreen 