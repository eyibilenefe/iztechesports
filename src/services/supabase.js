import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'

// Supabase konfigürasyonu - Çevre değişkenlerinden alınan değerler
const supabaseUrl = SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Debug için konsola yazdır (production'da kaldırın)
if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key başlangıcı:', supabaseAnonKey?.substring(0, 20) + '...')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Auth helper fonksiyonları
export const authService = {
  // Kullanıcı girişi
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Kullanıcı kaydı
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Çıkış
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Mevcut kullanıcıyı al
  getCurrentUser() {
    return supabase.auth.getUser()
  },

  // Session dinleyicisi
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper fonksiyonları
export const dbService = {
  // Kullanıcı profili al
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Kullanıcı profili güncelle
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  },

  // Kullanıcı adına göre kullanıcı bul
  async getUserByUsername(username) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    return { data, error }
  },

  // Kullanıcının lobiye istek gönderip göndermediğini kontrol et
  async checkLobbyJoinRequest(lobby_id, user_id) {
    const { data, error } = await supabase
      .from('lobby_join_requests')
      .select('*')
      .eq('lobby_id', lobby_id)
      .eq('user_id', user_id)
      .eq('status', 'pending')
      .single()
    return { data, error }
  },

  // Kullanıcının oyun profili var mı kontrol et
  async checkUserGameProfile(user_id, game_id) {
    const { data, error } = await supabase
      .from('user_game_profiles')
      .select('*')
      .eq('user_id', user_id)
      .eq('game_id', game_id)
      .maybeSingle()
    return { data, error }
  },

  // Kullanıcının turnuvaya katılmak için gerekli oyun profillerini kontrol et
  async checkRequiredGameProfiles(user_id, tournament_id) {
    try {
      // Önce turnuvanın oyununu al
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('game_id')
        .eq('id', tournament_id)
        .single()

      if (tournamentError || !tournament) {
        return { hasRequiredProfiles: false, missingGame: null, error: tournamentError }
      }

      // Kullanıcının bu oyun için profili var mı kontrol et
      const { data: profile, error: profileError } = await supabase
        .from('user_game_profiles')
        .select('*')
        .eq('user_id', user_id)
        .eq('game_id', tournament.game_id)
        .maybeSingle()

      // maybeSingle() null döndürürse profil yok demektir
      if (!profile) {
        return { 
          hasRequiredProfiles: false, 
          missingGame: tournament.game_id, 
          error: null 
        }
      }

      return { hasRequiredProfiles: true, missingGame: null, error: null }
    } catch (error) {
      console.error('Oyun profili kontrol hatası:', error)
      return { hasRequiredProfiles: false, missingGame: null, error }
    }
  },

  // Kullanıcı arama (kullanıcı adı veya isim ile)
  async searchUsers(query) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        tournament_participants(count),
        tournament_matches(count)
      `)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)
      .order('username')
    return { data, error }
  },

  // Kullanıcının detaylı profil bilgilerini al
  async getUserDetailedProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_game_profiles(
          *,
          games(name, icon_url)
        ),
        tournament_participants(
          tournaments(name)
        ),
        tournament_matches(
          tournaments(name),
          result
        )
      `)
      .eq('id', userId)
      .single()

    if (!error && data) {
      // İstatistikleri hesapla
      const tournamentCount = data.tournament_participants?.length || 0
      const matchCount = data.tournament_matches?.length || 0
      const winCount = data.tournament_matches?.filter(m => m.result === 'win').length || 0
      const winRate = matchCount > 0 ? Math.round((winCount / matchCount) * 100) : 0

      // Son 3 maçı al
      const recentMatches = data.tournament_matches?.slice(0, 3) || []

      return {
        data: {
          ...data,
          tournament_count: tournamentCount,
          match_count: matchCount,
          win_count: winCount,
          win_rate: winRate,
          recent_matches: recentMatches,
          game_profiles: data.user_game_profiles || []
        },
        error: null
      }
    }

    return { data: null, error }
  },

  // Oyunları al
  async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data, error }
  },

  // Duyuruları al
  async getAnnouncements(limit = 20) {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles!announcements_user_id_fkey(username, full_name, profile_picture_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Bracket sistemi için yeni servisler
  // Turnuva bracket'ını oluştur
  async createTournamentBracket(tournamentId, participants) {
    const { data, error } = await supabase
      .from('tournament_matches')
      .insert(participants.map((participant, index) => ({
        tournament_id: tournamentId,
        round: 1,
        match_number: Math.floor(index / 2) + 1,
        team1_id: participant.team_id,
        user1_id: participant.user_id,
        status: 'scheduled'
      })))
    return { data, error }
  },

  // Turnuva bracket'ını getir
  async getTournamentBracket(tournamentId) {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        teams!tournament_matches_team1_id_fkey(name, tag, logo_url),
        teams!tournament_matches_team2_id_fkey(name, tag, logo_url),
        profiles!tournament_matches_user1_id_fkey(username, full_name),
        profiles!tournament_matches_user2_id_fkey(username, full_name)
      `)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true })
    return { data, error }
  },

  // Maç skorunu güncelle
  async updateMatchScore(matchId, score, winnerId, format = 'Bo3') {
    const { data, error } = await supabase
      .from('tournament_matches')
      .update({
        score: score,
        winner_team_id: winnerId,
        status: 'completed'
      })
      .eq('id', matchId)
    return { data, error }
  },

  // Set skorunu kaydet
  async saveSetScore(matchId, setData) {
    const { data, error } = await supabase
      .from('match_sets')
      .insert({
        match_id: matchId,
        set_number: setData.set_number,
        team1_score: setData.team1_score,
        team2_score: setData.team2_score,
        winner_team_id: setData.winner_team_id,
        map_name: setData.map_name,
        duration: setData.duration
      })
    return { data, error }
  },

  // Maç setlerini getir
  async getMatchSets(matchId) {
    const { data, error } = await supabase
      .from('match_sets')
      .select('*')
      .eq('match_id', matchId)
      .order('set_number', { ascending: true })
    return { data, error }
  },

  // Turnuva katılımcılarını getir
  async getTournamentParticipants(tournamentId) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select(`
        *,
        teams(name, tag, logo_url),
        profiles(username, full_name)
      `)
      .eq('tournament_id', tournamentId)
      .order('joined_at', { ascending: true })
    return { data, error }
  },

  // Bracket formatını belirle (Bo3/Bo5)
  getBracketFormat(participantCount) {
    if (participantCount <= 8) return 'Bo3'
    if (participantCount <= 16) return 'Bo3'
    return 'Bo5'
  },

  // Bracket pozisyonlarını hesapla
  generateBracketPositions(participants) {
    const count = participants.length
    const positions = []
    
    // 2'nin kuvveti olmayan sayılar için bye pozisyonları
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(count)))
    const byes = nextPowerOf2 - count
    
    // Pozisyonları oluştur
    for (let i = 0; i < nextPowerOf2; i++) {
      if (i < count) {
        positions.push({
          position: i + 1,
          participant: participants[i],
          isBye: false
        })
      } else {
        positions.push({
          position: i + 1,
          participant: null,
          isBye: true
        })
      }
    }
    
    return positions
  },

  // Lobileri al
  async getLobbies(gameId = null) {
    let query = supabase
      .from('lobbies')
      .select(`
        *,
        games(name, icon_url),
        profiles!lobbies_creator_user_id_fkey(username, full_name, profile_picture_url),
        lobby_participants(count)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Belirli bir turnuvaya ait lobileri al
  async getLobbiesByTournament(tournamentId) {
    let query = supabase
      .from('lobbies')
      .select(`
        *,
        games(name, icon_url),
        profiles!lobbies_creator_user_id_fkey(username, full_name, profile_picture_url),
        lobby_participants(user_id, profiles(username, full_name, profile_picture_url)),
        lobby_join_requests(user_id, status)
      `)
      .eq('status', 'open')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false })

    const { data, error } = await query
    return { data, error }
  },

  // Turnuvaları al
  async getTournaments(gameId = null) {
    let query = supabase
      .from('tournaments')
      .select(`
        *,
        games(name, icon_url)
      `)
      .gte('end_date', new Date().toISOString())
      .order('start_date')

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Kullanıcının takım üyeliği ve takım bilgisi
  async getUserTeam(userId) {
    // Kullanıcının üye olduğu takımı ve takım bilgilerini getir
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        teams(*),
        teams:teams!inner(*, team_members(*, profiles(username, full_name, profile_picture_url, role)))
      `)
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  },

  // Kullanıcının maç geçmişi ve istatistikleri
  async getUserMatchHistory(userId, limit = 10) {
    // Kullanıcının katıldığı maçları ve istatistiklerini getir
    const { data, error } = await supabase
      .from('match_participants')
      .select(`
        *,
        match_history(id, game_id, tournament_id, completion_time, result_summary, games(name, icon_url), tournaments(name)),
        team_id,
        is_winner,
        stats
      `)
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Kullanıcının oyun içi profillerini al
  async getUserGameProfiles(userId) {
    const { data, error } = await supabase
      .from('user_game_profiles')
      .select(`
        *,
        games(name, icon_url)
      `)
      .eq('user_id', userId)
      .order('id')
    return { data, error }
  },

  // Kullanıcının bildirimlerini al
  async getUserNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Kullanıcının turnuva katılımlarını al
  async getUserTournamentParticipations(userId) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('tournament_id')
      .eq('user_id', userId)
    return { data, error }
  },

  // Lobi oluştur
  async createLobby({ creator_user_id, game_id, max_participants, status = 'open', tournament_id = null, name = null, updated_at = null }) {
    const insertObj = {
      creator_user_id,
      game_id,
      max_participants,
      status,
      tournament_id,
    };
    if (name) insertObj.name = name;
    if (updated_at) insertObj.updated_at = updated_at;
    const { data, error } = await supabase
      .from('lobbies')
      .insert([insertObj])
      .select()
      .single();
    return { data, error };
  },

  // Lobiye katıl
  async joinLobby(lobby_id, user_id) {
    const { data, error } = await supabase
      .from('lobby_participants')
      .insert([
        { lobby_id, user_id }
      ])
      .select()
      .single();
    return { data, error };
  },

  // Lobiyi sil
  async deleteLobby(lobby_id) {
    // Önce lobby_participants kayıtlarını sil, sonra lobiyi sil
    await supabase.from('lobby_participants').delete().eq('lobby_id', lobby_id);
    const { data, error } = await supabase
      .from('lobbies')
      .delete()
      .eq('id', lobby_id)
      .select()
      .single();
    return { data, error };
  },

  // Lobiye katılım isteği gönder
  async requestJoinLobby(lobby_id, user_id) {
    const { data, error } = await supabase
      .from('lobby_join_requests')
      .insert([
        { lobby_id, user_id, status: 'pending' }
      ])
      .select()
      .single();
    if (!error && data) {
      // Lobi sahibini bul
      const lobbyRes = await supabase.from('lobbies').select('creator_user_id').eq('id', lobby_id).single();
      const ownerId = lobbyRes.data?.creator_user_id;
      if (ownerId && ownerId !== user_id) {
        await supabase.from('notifications').insert([
          {
            user_id: ownerId,
            content: 'Lobine katılmak için yeni bir istek var!',
            link: null
          }
        ]);
      }
    }
    return { data, error };
  },

  // Lobiye gelen katılım isteklerini getir (sadece lobi sahibi için)
  async getLobbyJoinRequests(lobby_id) {
    const { data, error } = await supabase
      .from('lobby_join_requests')
      .select(`*, profiles: user_id (username, full_name, profile_picture_url)`)
      .eq('lobby_id', lobby_id)
      .order('requested_at', { ascending: true });
    return { data, error };
  },

  // Katılım isteğine yanıt ver (onayla/reddet)
  async respondLobbyJoinRequest(request_id, status, lobby_id, user_id) {
    // status: 'approved' veya 'rejected'
    const { data, error } = await supabase
      .from('lobby_join_requests')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', request_id)
      .select()
      .single();
    // Onaylandıysa katılımcı olarak ekle
    if (!error && status === 'approved') {
      const { error: joinError } = await supabase
        .from('lobby_participants')
        .insert([{ 
          lobby_id, 
          user_id,
          joined_at: new Date().toISOString()
        }]);
      if (joinError) {
        console.error('Lobi katılım hatası:', joinError);
        return { data, error: joinError };
      }
    }
    return { data, error };
  },

  // Katılım isteğini geri çek
  async cancelJoinRequest(lobby_id, user_id) {
    const { error } = await supabase
      .from('lobby_join_requests')
      .delete()
      .eq('lobby_id', lobby_id)
      .eq('user_id', user_id);
    return { error };
  },

  // Lobi katılımcısını sil
  async removeLobbyParticipant(lobby_id, user_id) {
    const { error } = await supabase
      .from('lobby_participants')
      .delete()
      .eq('lobby_id', lobby_id)
      .eq('user_id', user_id);
    return { error };
  },

  // Turnuva katılımcısını sil
  async removeTournamentParticipant(tournament_id, user_id) {
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournament_id)
      .eq('user_id', user_id);
    return { error };
  },

  // Kullanıcı davet et
  async inviteUserToLobby(lobby_id, invited_user_id, inviter_user_id) {
    // Önce davet kaydı oluştur
    const { data, error } = await supabase
      .from('lobby_invitations')
      .insert([
        { 
          lobby_id, 
          invited_user_id, 
          inviter_user_id, 
          status: 'pending',
          invited_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (!error && data) {
      // Davet edilen kullanıcıya bildirim gönder
      await supabase.from('notifications').insert([
        {
          user_id: invited_user_id,
          content: 'Bir lobiye davet edildiniz!',
          link: `lobby:${lobby_id}`
        }
      ]);
    }

    return { data, error };
  },

  // Turnuva davet et
  async inviteUserToTournament(tournament_id, invited_user_id, inviter_user_id) {
    // Önce davet kaydı oluştur
    const { data, error } = await supabase
      .from('tournament_invitations')
      .insert([
        { 
          tournament_id, 
          invited_user_id, 
          inviter_user_id, 
          status: 'pending',
          invited_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (!error && data) {
      // Davet edilen kullanıcıya bildirim gönder
      await supabase.from('notifications').insert([
        {
          user_id: invited_user_id,
          content: 'Bir turnuvaya davet edildiniz!',
          link: `tournament:${tournament_id}`
        }
      ]);
    }

    return { data, error };
  },

  // Davetleri getir
  async getUserInvitations(user_id) {
    const { data, error } = await supabase
      .from('lobby_invitations')
      .select(`
        *,
        lobbies(name, games(name)),
        profiles!lobby_invitations_inviter_user_id_fkey(username, full_name)
      `)
      .eq('invited_user_id', user_id)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });
    return { data, error };
  },

  // Turnuva davetlerini getir
  async getUserTournamentInvitations(user_id) {
    const { data, error } = await supabase
      .from('tournament_invitations')
      .select(`
        *,
        tournaments(name, games(name)),
        profiles!tournament_invitations_inviter_user_id_fkey(username, full_name)
      `)
      .eq('invited_user_id', user_id)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });
    return { data, error };
  },

  // Davet yanıtla
  async respondToInvitation(invitation_id, status, invitation_type = 'lobby') {
    const table = invitation_type === 'tournament' ? 'tournament_invitations' : 'lobby_invitations';
    const { data, error } = await supabase
      .from(table)
      .update({ 
        status, 
        responded_at: new Date().toISOString() 
      })
      .eq('id', invitation_id)
      .select()
      .single();
    return { data, error };
  },

  // Kullanıcı oyun profili oluştur/güncelle
  async createOrUpdateUserGameProfile(user_id, game_id, nickname, rank = null) {
    // Önce mevcut profili kontrol et
    const { data: existingProfile } = await supabase
      .from('user_game_profiles')
      .select('*')
      .eq('user_id', user_id)
      .eq('game_id', game_id)
      .single();

    if (existingProfile) {
      // Mevcut profili güncelle
      const { data, error } = await supabase
        .from('user_game_profiles')
        .update({ 
          nickname, 
          rank,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
      return { data, error };
    } else {
      // Yeni profil oluştur
      const { data, error } = await supabase
        .from('user_game_profiles')
        .insert([
          { 
            user_id, 
            game_id, 
            nickname, 
            rank,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      return { data, error };
    }
  },

  // Kullanıcının belirli bir oyun için profilini getir
  async getUserGameProfile(user_id, game_id) {
    const { data, error } = await supabase
      .from('user_game_profiles')
      .select('*')
      .eq('user_id', user_id)
      .eq('game_id', game_id)
      .single();
    return { data, error };
  },

  // Turnuvaya katılırken oyun profili kontrol et/oluştur
  async joinTournamentWithGameProfile(tournament_id, user_id, game_id, nickname, rank = null) {
    // Önce oyun profilini oluştur/güncelle
    const profileResult = await this.createOrUpdateUserGameProfile(user_id, game_id, nickname, rank);
    
    if (profileResult.error) {
      return profileResult;
    }

    // Sonra turnuvaya katıl
    const { data, error } = await supabase
      .from('tournament_participants')
      .insert([
        { 
          tournament_id, 
          user_id, 
          participant_type: 'individual',
          joined_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    return { data, error };
  },

  // Lobiyi davet ile katılırken oyun profili kontrol et/oluştur
  async joinLobbyWithGameProfile(lobby_id, user_id, game_id, nickname, rank = null) {
    // Önce oyun profilini oluştur/güncelle
    const profileResult = await this.createOrUpdateUserGameProfile(user_id, game_id, nickname, rank);
    
    if (profileResult.error) {
      return profileResult;
    }

    // Sonra lobiye katıl
    const { data, error } = await supabase
      .from('lobby_participants')
      .insert([
        { 
          lobby_id, 
          user_id,
          joined_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    return { data, error };
  },

  // Kullanıcının tüm oyun profillerini getir
  async getAllUserGameProfiles(user_id) {
    const { data, error } = await supabase
      .from('user_game_profiles')
      .select(`
        *,
        games(name, icon_url)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Oyun profili sil
  async deleteUserGameProfile(user_id, game_id) {
    const { error } = await supabase
      .from('user_game_profiles')
      .delete()
      .eq('user_id', user_id)
      .eq('game_id', game_id);
    return { error };
  },
} 