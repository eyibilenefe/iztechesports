import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { useAuth } from '../../context/AuthContext'
import { dbService } from '../../services/supabase'
import { Colors, GameColors } from '../../constants/Colors'

const TournamentJoinModal = ({ 
  visible, 
  onClose, 
  tournament, 
  onSuccess 
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [gameProfile, setGameProfile] = useState(null)
  const [nickname, setNickname] = useState('')
  const [rank, setRank] = useState('')
  const [creatingProfile, setCreatingProfile] = useState(false)

  useEffect(() => {
    if (visible && tournament) {
      loadGameProfile()
    }
  }, [visible, tournament])

  const loadGameProfile = async () => {
    if (!tournament?.game_id) return

    try {
      const { data, error } = await dbService.getUserGameProfile(user.id, tournament.game_id)
      if (!error && data) {
        setGameProfile(data)
        setNickname(data.nickname)
        setRank(data.rank || '')
      } else {
        setGameProfile(null)
        setNickname('')
        setRank('')
      }
    } catch (error) {
      console.error('Oyun profili yükleme hatası:', error)
    }
  }

  const handleJoinTournament = async () => {
    if (!nickname.trim()) {
      Alert.alert('Hata', 'Lütfen nickname girin.')
      return
    }

    setLoading(true)
    try {
      const { error } = await dbService.joinTournamentWithGameProfile(
        tournament.id,
        user.id,
        tournament.game_id,
        nickname.trim(),
        rank.trim() || null
      )

      if (error) throw error

      Alert.alert('Başarılı', 'Turnuvaya başarıyla katıldınız!')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Turnuvaya katılma hatası:', error)
      Alert.alert('Hata', 'Turnuvaya katılamadınız!')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!nickname.trim()) {
      Alert.alert('Hata', 'Lütfen nickname girin.')
      return
    }

    setCreatingProfile(true)
    try {
      const { error } = await dbService.createOrUpdateUserGameProfile(
        user.id,
        tournament.game_id,
        nickname.trim(),
        rank.trim() || null
      )

      if (error) throw error

      setGameProfile({ ...gameProfile, nickname: nickname.trim(), rank: rank.trim() })
      setCreatingProfile(false)
      Alert.alert('Başarılı', 'Oyun profili güncellendi!')
    } catch (error) {
      console.error('Profil güncelleme hatası:', error)
      Alert.alert('Hata', 'Profil güncellenemedi!')
      setCreatingProfile(false)
    }
  }

  const getGameColor = (gameName) => {
    return GameColors[gameName] || GameColors.default
  }

  if (!tournament) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Turnuvaya Katıl</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Tournament Info */}
          <View style={styles.tournamentInfo}>
            <View style={styles.gameInfo}>
              <View style={[
                styles.gameIcon,
                { backgroundColor: getGameColor(tournament.games?.name) }
              ]}>
                <Ionicons name="game-controller" size={20} color={Colors.text.white} />
              </View>
              <View>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.gameName}>{tournament.games?.name}</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Game Profile Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {gameProfile ? 'Oyun Profiliniz' : 'Oyun Profili Oluşturun'}
              </Text>
              
              {gameProfile && (
                <View style={styles.existingProfile}>
                  <View style={styles.profileInfo}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.profileText}>
                      Mevcut profil: @{gameProfile.nickname}
                    </Text>
                  </View>
                  {gameProfile.rank && (
                    <Text style={styles.rankText}>Rank: {gameProfile.rank}</Text>
                  )}
                </View>
              )}

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

              {/* Update Profile Button */}
              {gameProfile && (
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdateProfile}
                  disabled={creatingProfile}
                >
                  {creatingProfile ? (
                    <ActivityIndicator size="small" color={Colors.text.white} />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={16} color={Colors.text.white} />
                      <Text style={styles.updateButtonText}>Profili Güncelle</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Tournament Rules */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Turnuva Kuralları</Text>
              <View style={styles.rulesList}>
                <View style={styles.ruleItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.ruleText}>Oyun profili zorunludur</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.ruleText}>Turnuva sırasında aynı nickname kullanılmalıdır</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.ruleText}>Katılım sonrası profil değiştirilemez</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinTournament}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.text.white} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={16} color={Colors.text.white} />
                  <Text style={styles.joinButtonText}>Turnuvaya Katıl</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  tournamentInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  gameName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  existingProfile: {
    backgroundColor: Colors.success + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileText: {
    color: Colors.text.primary,
    fontSize: 14,
    marginLeft: 8,
  },
  rankText: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginLeft: 28,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
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
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  updateButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  rulesList: {
    marginTop: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
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
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  joinButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
})

export default TournamentJoinModal 