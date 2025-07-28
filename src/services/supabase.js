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
      await supabase.from('lobby_participants').insert([{ lobby_id, user_id }]);
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
} 