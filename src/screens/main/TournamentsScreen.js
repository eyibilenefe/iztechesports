import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'

import { useAuth } from '../../context/AuthContext'
import { dbService } from '../../services/supabase'
import { Colors, GameColors } from '../../constants/Colors'

const { width, height } = Dimensions.get('window')

const TournamentsScreen = ({ navigation }) => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tournaments, setTournaments] = useState([])
  const [filteredTournaments, setFilteredTournaments] = useState([])
  const [selectedGame, setSelectedGame] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [games, setGames] = useState([])
  const [userParticipations, setUserParticipations] = useState([])

  const searchRef = useRef()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTournaments()
  }, [tournaments, selectedGame, searchQuery])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tournamentsRes, gamesRes, participationsRes] = await Promise.all([
        dbService.getTournaments(),
        dbService.getGames(),
        user ? dbService.getUserTournamentParticipations(user.id) : { data: [] }
      ])

      setTournaments(tournamentsRes.data || [])
      setGames(gamesRes.data || [])
      setUserParticipations(participationsRes.data || [])
    } catch (error) {
      console.error('Turnuva veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const filterTournaments = () => {
    let filtered = [...tournaments]

    // Oyun filtresi
    if (selectedGame !== 'all') {
      filtered = filtered.filter(t => t.game_id === parseInt(selectedGame))
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.games?.name.toLowerCase().includes(query)
      )
    }

    setFilteredTournaments(filtered)
  }

  const getTournamentStatus = (tournament) => {
    const now = new Date()
    const startDate = new Date(tournament.start_date)
    const endDate = new Date(tournament.end_date)
    const registrationEnd = new Date(tournament.registration_end_date)

    if (now < startDate) {
      return { status: 'upcoming', text: 'Yakında', color: Colors.warning }
    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', text: 'Devam Ediyor', color: Colors.success }
    } else if (now > endDate) {
      return { status: 'completed', text: 'Tamamlandı', color: Colors.text.disabled }
    } else if (now > registrationEnd) {
      return { status: 'registration_closed', text: 'Kayıt Kapalı', color: Colors.error }
    }
    return { status: 'open', text: 'Kayıt Açık', color: Colors.primary }
  }

  const isUserParticipating = (tournamentId) => {
    return userParticipations.some(p => p.tournament_id === tournamentId)
  }

  const getPrizeText = (prize) => {
    if (!prize) return 'Ödül belirtilmemiş'
    return prize
  }

  const TournamentCard = ({ tournament, index }) => {
    const status = getTournamentStatus(tournament)
    const participating = isUserParticipating(tournament.id)

    return (
      <Animatable.View 
        animation="fadeInUp" 
        delay={index * 100}
        style={styles.tournamentCard}
      >
        <LinearGradient
          colors={[Colors.card.background, Colors.card.background]}
          style={styles.cardGradient}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.gameInfo}>
              <View style={[styles.gameIcon, { backgroundColor: GameColors[tournament.games?.name] || GameColors.default }]}>
                <Ionicons name="game-controller" size={20} color={Colors.text.white} />
              </View>
              <Text style={styles.gameName}>{tournament.games?.name}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.tournamentTitle}>{tournament.name}</Text>
          
          {/* Description */}
          {tournament.description && (
            <Text style={styles.tournamentDescription} numberOfLines={2}>
              {tournament.description}
            </Text>
          )}

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {new Date(tournament.start_date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="people" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {tournament.max_participants || 'Sınırsız'} katılımcı
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="trophy" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {getPrizeText(tournament.prize)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {tournament.entry_fee ? `${tournament.entry_fee}₺` : 'Ücretsiz'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.detailsButton]}
              onPress={() => navigation.navigate('TournamentDetails', { tournament })}
            >
              <Ionicons name="information-circle" size={16} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Detaylar</Text>
            </TouchableOpacity>

            {status.status === 'open' && !participating && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => handleJoinTournament(tournament.id)}
              >
                <Ionicons name="add-circle" size={16} color={Colors.text.white} />
                <Text style={[styles.actionButtonText, { color: Colors.text.white }]}>Katıl</Text>
              </TouchableOpacity>
            )}

            {participating && (
              <View style={[styles.actionButton, styles.participatingButton]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[styles.actionButtonText, { color: Colors.success }]}>Katılıyorsun</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animatable.View>
    )
  }

  const handleJoinTournament = async (tournamentId) => {
    try {
      // Burada turnuvaya katılma işlemi yapılacak
      console.log('Turnuvaya katılma:', tournamentId)
      // TODO: Implement tournament participation
    } catch (error) {
      console.error('Turnuvaya katılma hatası:', error)
    }
  }

  const GameFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, selectedGame === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedGame('all')}
        >
          <Text style={[styles.filterChipText, selectedGame === 'all' && styles.filterChipTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
        
        {games.map(game => (
          <TouchableOpacity
            key={game.id}
            style={[styles.filterChip, selectedGame === game.id.toString() && styles.filterChipActive]}
            onPress={() => setSelectedGame(game.id.toString())}
          >
            <Text style={[styles.filterChipText, selectedGame === game.id.toString() && styles.filterChipTextActive]}>
              {game.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Turnuvalar yükleniyor...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏆 Turnuvalar</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTournaments.length} turnuva bulundu
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} 
            tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.text.secondary} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Turnuva ara..."
              placeholderTextColor={Colors.text.disabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Game Filters */}
        <GameFilter />

        {/* Tournaments List */}
        <View style={styles.tournamentsContainer}>
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament, index) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={80} color={Colors.text.disabled} />
              <Text style={styles.emptyTitle}>Turnuva Bulunamadı</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedGame !== 'all' 
                  ? 'Arama kriterlerinize uygun turnuva bulunamadı'
                  : 'Henüz aktif turnuva bulunmuyor'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text.primary,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.text.white,
  },
  tournamentsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tournamentCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: Colors.card.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  gameName: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tournamentDescription: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  detailText: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  detailsButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  participatingButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.success,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
})

export default TournamentsScreen 