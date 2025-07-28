import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'

import { useAuth } from '../../context/AuthContext'
import { dbService } from '../../services/supabase'
import { Colors, GameColors } from '../../constants/Colors'

const { width, height } = Dimensions.get('window')

const HomeScreen = ({ navigation }) => {
  const { user, profile, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState({
    announcements: [],
    games: [],
    tournaments: [],
    lobbies: [],
    team: null,
    matchHistory: [],
    gameProfiles: [],
    notifications: [],
    stats: { tournaments: 0, matches: 0, wins: 0 }
  })

  const headerRef = useRef()
  const statsRef = useRef()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [announcementsRes, gamesRes, tournamentsRes, lobbiesRes, teamRes, matchHistoryRes, gameProfilesRes, notificationsRes] = await Promise.all([
        dbService.getAnnouncements(5),
        dbService.getGames(),
        dbService.getTournaments(),
        dbService.getLobbies(),
        user ? dbService.getUserTeam(user.id) : { data: null },
        user ? dbService.getUserMatchHistory(user.id, 5) : { data: [] },
        user ? dbService.getUserGameProfiles(user.id) : { data: [] },
        user ? dbService.getUserNotifications(user.id, 10) : { data: [] }
      ])

      setData({
        announcements: announcementsRes.data || [],
        games: gamesRes.data || [],
        tournaments: tournamentsRes.data || [],
        lobbies: lobbiesRes.data || [],
        team: teamRes.data || null,
        matchHistory: matchHistoryRes.data || [],
        gameProfiles: gameProfilesRes.data || [],
        notifications: notificationsRes.data || [],
        stats: {
          tournaments: tournamentsRes.data?.length || 0,
          matches: matchHistoryRes.data?.length || 0,
          wins: matchHistoryRes.data?.filter(m => m.is_winner).length || 0
        }
      })
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName)
  }

  const GameCard = ({ game, index }) => (
    <Animatable.View 
      animation="slideInUp" 
      delay={index * 100}
      style={styles.gameCard}
    >
      <View style={[styles.gameCardContent, { borderLeftColor: GameColors[game.name] || GameColors.default }]}>
        <View style={[styles.gameIcon, { backgroundColor: GameColors[game.name] || GameColors.default }]}>
          <Ionicons 
            name="game-controller" 
            size={24} 
            color={Colors.text.white} 
          />
        </View>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{game.name}</Text>
          <Text style={styles.gameGenre}>{game.genre}</Text>
        </View>
      </View>
    </Animatable.View>
  )

  const AnnouncementCard = ({ announcement, index }) => (
    <Animatable.View 
      animation="fadeInRight" 
      delay={index * 150}
      style={styles.announcementCard}
    >
      <View style={styles.announcementHeader}>
        <View style={styles.announcementType}>
          <View style={styles.typeIcon}>
            <Ionicons 
              name={announcement.type === 'tournament' ? 'trophy' : 
                    announcement.type === 'poll' ? 'bar-chart' : 'gift'} 
              size={16} 
              color={Colors.text.white} 
            />
          </View>
          <Text style={styles.announcementTypeText}>
            {announcement.type === 'tournament' ? 'TURNUVA' : 
             announcement.type === 'poll' ? 'ANKET' : 'ÇEKİLİŞ'}
          </Text>
        </View>
        <Text style={styles.announcementTime}>
          {new Date(announcement.created_at).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      <Text style={styles.announcementTitle}>{announcement.title}</Text>
      <Text style={styles.announcementContent} numberOfLines={2}>
        {announcement.content}
      </Text>
      <View style={styles.announcementFooter}>
        <Text style={styles.announcementAuthor}>
          {announcement.profiles?.full_name || 'Admin'}
        </Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Devamını Oku</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  )

  // Takımım Kartı
  const TeamCard = () => {
    if (!data.team || !data.team.teams) return null
    const team = data.team.teams
    return (
      <Animatable.View animation="fadeInLeft" style={styles.teamCard}>
        <Text style={styles.sectionTitle}>👥 Takımım</Text>
        <View style={styles.teamInfo}>
          {team.logo_url ? (
            <Image source={{ uri: team.logo_url }} style={styles.teamLogo} />
          ) : (
            <Ionicons name="people" size={40} color={Colors.primary} />
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.teamName}>{team.name} <Text style={styles.teamTag}>[{team.tag}]</Text></Text>
            <Text style={styles.teamRole}>Rolün: {data.team.role}</Text>
          </View>
        </View>
        <View style={styles.teamMembers}>
          {team.team_members?.map(member => (
            <View key={member.user_id} style={styles.teamMember}>
              <Image source={{ uri: member.profiles?.profile_picture_url }} style={styles.teamMemberAvatar} />
              <Text style={styles.teamMemberName}>{member.profiles?.full_name || member.profiles?.username}</Text>
              <Text style={styles.teamMemberRole}>{member.role}</Text>
            </View>
          ))}
        </View>
      </Animatable.View>
    )
  }

  // Maç Geçmişi
  const MatchHistory = () => (
    <Animatable.View animation="fadeInRight" style={styles.matchHistoryContainer}>
      <Text style={styles.sectionTitle}>🕹️ Son Maçlarım</Text>
      {data.matchHistory.length === 0 ? (
        <Text style={styles.emptyText}>Henüz maç geçmişin yok</Text>
      ) : (
        data.matchHistory.map((m, i) => (
          <View key={m.id} style={styles.matchCard}>
            <Text style={styles.matchGame}>{m.match_history?.games?.name || 'Oyun'}</Text>
            <Text style={styles.matchResult}>{m.is_winner ? 'Kazandın' : 'Kaybettin'}</Text>
            <Text style={styles.matchScore}>Skor: {m.stats?.score ?? '-'}</Text>
            <Text style={styles.matchDate}>{new Date(m.match_history?.completion_time).toLocaleDateString('tr-TR')}</Text>
          </View>
        ))
      )}
    </Animatable.View>
  )

  // Anketler ve Çekilişler bölümlerini kaldırıyorum

  // Oyun İçi Profiller
  const GameProfiles = () => (
    <Animatable.View animation="fadeInUp" style={styles.gameProfilesContainer}>
      <Text style={styles.sectionTitle}>🎮 Oyun Profillerim</Text>
      {data.gameProfiles.length === 0 ? (
        <Text style={styles.emptyText}>Henüz oyun profili eklenmemiş</Text>
      ) : (
        data.gameProfiles.map((profile, i) => (
          <View key={profile.id} style={styles.gameProfileCard}>
            <Text style={styles.gameProfileName}>{profile.games?.name}</Text>
            <Text style={styles.gameProfileNickname}>Nickname: {profile.nickname}</Text>
            <Text style={styles.gameProfileRank}>Rank: {profile.rank || 'Belirtilmemiş'}</Text>
          </View>
        ))
      )}
    </Animatable.View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} 
            tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View 
          ref={headerRef}
          animation="slideInDown"
          style={styles.header}
        >
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.headerGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  {profile?.profile_picture_url ? (
                    <Image 
                      source={{ uri: profile.profile_picture_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.defaultAvatar}>
                      <Ionicons name="person" size={30} color={Colors.text.white} />
                    </View>
                  )}
                </View>
                <View>
                  <Text style={styles.welcomeText}>Hoş geldin,</Text>
                  <Text style={styles.userName}>
                    {profile?.full_name || profile?.username || profile?.email || 'Bilinmiyor'}
                  </Text>
                  <Text style={styles.userRole}>
                    {profile?.role === 'admin' ? '👑 Admin' : 
                     profile?.role === 'moderator' ? '🛡️ Moderatör' : 
                     profile?.role === 'user' ? '🎮 Oyuncu' : ''}
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications" size={24} color={Colors.text.white} />
                  {data.notifications.length > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{data.notifications.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
                  <Ionicons name="log-out-outline" size={24} color={Colors.text.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/iyte-esports-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>İYTE E-SPOR</Text>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* İstatistikler */}
        <Animatable.View 
          ref={statsRef}
          animation="slideInUp"
          delay={300}
          style={styles.statsContainer}
        >
          <Text style={styles.sectionTitle}>📊 İstatistiklerim</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trophy" size={30} color={Colors.gaming.gold} />
              </View>
              <Text style={styles.statNumber}>{data.stats.tournaments}</Text>
              <Text style={styles.statLabel}>Turnuva</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="game-controller" size={30} color={Colors.primary} />
              </View>
              <Text style={styles.statNumber}>{data.stats.matches}</Text>
              <Text style={styles.statLabel}>Maç</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="flame" size={30} color={Colors.success} />
              </View>
              <Text style={styles.statNumber}>{data.stats.wins}</Text>
              <Text style={styles.statLabel}>Galibiyet</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Oyunlar */}
        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>🎮 Aktif Oyunlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gamesScroll}>
              {data.games.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Oyun Profillerim */}
        <GameProfiles />

        {/* Takımım */}
        <TeamCard />
        
        {/* Son Maçlarım */}
        <MatchHistory />
        
        {/* Son Duyurular */}
        <View style={styles.announcementsContainer}>
          <Text style={styles.sectionTitle}>📢 Son Duyurular</Text>
          {data.announcements.length > 0 ? (
            data.announcements.map((announcement, index) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color={Colors.text.disabled} />
              <Text style={styles.emptyText}>Henüz duyuru bulunmuyor</Text>
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
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  userName: {
    color: Colors.text.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userRole: {
    color: Colors.gaming.gold,
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginRight: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.gaming.gold,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  logoText: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    minWidth: 100,
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
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  gamesContainer: {
    marginBottom: 30,
  },
  gamesScroll: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  gameCard: {
    marginRight: 15,
  },
  gameCardContent: {
    backgroundColor: Colors.card.background,
    borderRadius: 15,
    padding: 15,
    width: 160,
    borderLeftWidth: 4,
    shadowColor: Colors.card.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameGenre: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  announcementsContainer: {
    marginBottom: 30,
  },
  announcementCard: {
    backgroundColor: Colors.card.background,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
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
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  announcementTypeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  announcementTime: {
    color: Colors.text.disabled,
    fontSize: 12,
  },
  announcementTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  announcementContent: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementAuthor: {
    color: Colors.text.disabled,
    fontSize: 12,
  },
  readMoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  readMoreText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: Colors.text.disabled,
    fontSize: 16,
    marginTop: 10,
  },
  teamCard: {
    marginBottom: 30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.card.background,
    borderRadius: 15,
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
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  teamName: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamTag: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  teamRole: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  teamMembers: {
    marginTop: 10,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  teamMemberName: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamMemberRole: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  matchHistoryContainer: {
    marginBottom: 30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.card.background,
    borderRadius: 15,
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
  matchCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: Colors.card.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  matchGame: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchResult: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchScore: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginBottom: 5,
  },
  matchDate: {
    color: Colors.text.disabled,
    fontSize: 12,
  },
  gameProfilesContainer: {
    marginBottom: 30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.card.background,
    borderRadius: 15,
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
  gameProfileCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: Colors.card.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  gameProfileName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameProfileNickname: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginBottom: 5,
  },
  gameProfileRank: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
})

export default HomeScreen 