import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { dbService } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const TournamentDetailsScreen = ({ route, navigation }) => {
  const { tournament } = route.params || {}
  const { user } = useAuth()
  const [lobbies, setLobbies] = useState([])
  const [loadingLobbies, setLoadingLobbies] = useState(true)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [lobbyName, setLobbyName] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('8')
  const [creating, setCreating] = useState(false)
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [lobbyDetailModalVisible, setLobbyDetailModalVisible] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Yeni state'ler
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participantProfileModalVisible, setParticipantProfileModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (tournament?.id) {
      fetchLobbies()
    }
  }, [tournament?.id])

  const fetchLobbies = async () => {
    setLoadingLobbies(true)
    const { data, error } = await dbService.getLobbiesByTournament(tournament.id)
    if (!error) setLobbies(data || [])
    setLoadingLobbies(false)
  }

  const handleCreateLobby = async () => {
    setCreateModalVisible(true)
  }

  const handleSubmitLobby = async () => {
    if (!user || !tournament?.id) return
    if (!maxParticipants || isNaN(Number(maxParticipants)) || Number(maxParticipants) < 2) {
      Alert.alert('Hata', 'Maksimum katılımcı sayısı en az 2 olmalı.')
      return
    }
    setCreating(true)
    const { data, error } = await dbService.createLobby({
      creator_user_id: user.id,
      game_id: tournament.game_id,
      tournament_id: tournament.id,
      max_participants: Number(maxParticipants),
      name: lobbyName,
      status: 'open',
    })
    setCreating(false)
    if (!error) {
      setCreateModalVisible(false)
      setLobbyName('')
      setMaxParticipants('8')
      fetchLobbies()
    } else {
      Alert.alert('Hata', 'Lobi oluşturulamadı!')
    }
  }

  // Kullanıcı bu lobide mi?
  const isUserInLobby = (lobby) => {
    if (!user) return false;
    if (!lobby.lobby_participants || !Array.isArray(lobby.lobby_participants)) return false;
    return lobby.lobby_participants.some(p => p.user_id === user.id);
  };

  // Kullanıcı bu lobiye istek göndermiş mi?
  const isUserRequested = (lobby) => {
    if (!user) return false;
    if (!lobby.lobby_join_requests || !Array.isArray(lobby.lobby_join_requests)) return false;
    return lobby.lobby_join_requests.some(r => r.user_id === user.id && r.status === 'pending');
  };

  // Database'den istek durumunu kontrol et
  const [requestStatus, setRequestStatus] = useState({});
  
  // Lobi için istek durumunu kontrol et
  const checkRequestStatus = async (lobbyId) => {
    if (!user) return;
    
    const { data, error } = await dbService.checkLobbyJoinRequest(lobbyId, user.id);
    setRequestStatus(prev => ({
      ...prev,
      [lobbyId]: data ? 'requested' : 'not_requested'
    }));
  };

  // Turnuva için oyun profili kontrolü
  const checkGameProfile = async () => {
    if (!user || !tournament?.id) return { hasProfile: false, missingGame: null };
    
    try {
      const { hasRequiredProfiles, missingGame, error } = await dbService.checkRequiredGameProfiles(user.id, tournament.id);
      
      if (error) {
        console.error('Oyun profili kontrol hatası:', error);
        return { hasProfile: false, missingGame: null };
      }
      
      return { hasProfile: hasRequiredProfiles, missingGame };
    } catch (error) {
      console.error('Oyun profili kontrol hatası:', error);
      return { hasProfile: false, missingGame: null };
    }
  };

  // Katıl butonu (artık istek gönderiyor)
  const handleRequestJoinLobby = async (lobbyId) => {
    if (!user) return;
    
    // Önce oyun profili kontrolü yap
    const { hasProfile, missingGame } = await checkGameProfile();
    
    if (!hasProfile) {
      Alert.alert(
        'Oyun Profili Gerekli', 
        'Bu turnuvaya katılmak için önce oyun profilinizi oluşturmanız gerekiyor. Profil ekranından oyun profillerinizi yönetebilirsiniz.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Profil Oluştur', 
            onPress: () => navigation.navigate('UserGameProfiles')
          }
        ]
      );
      return;
    }
    
    const { error } = await dbService.requestJoinLobby(lobbyId, user.id);
    if (!error) {
      Alert.alert('İstek Gönderildi', 'Katılım isteğiniz gönderildi, lobi sahibi onaylarsa katılacaksınız.');
      fetchLobbies();
      // İstek durumunu güncelle
      checkRequestStatus(lobbyId);
    } else {
      Alert.alert('Hata', 'İstek gönderilemedi!');
    }
  };

  // Katılım isteğini geri çek
  const handleCancelJoinRequest = async (lobbyId) => {
    if (!user) return;
    
    // Önce database'den istek durumunu kontrol et
    const { data: request, error: checkError } = await dbService.checkLobbyJoinRequest(lobbyId, user.id);
    
    if (checkError || !request) {
      Alert.alert('Hata', 'İstek bulunamadı veya zaten iptal edilmiş.');
      fetchLobbies();
      return;
    }
    
    const { error } = await dbService.cancelJoinRequest(lobbyId, user.id);
    if (!error) {
      Alert.alert('Başarılı', 'Katılım isteğiniz iptal edildi.');
      fetchLobbies();
      // İstek durumunu güncelle
      setRequestStatus(prev => ({
        ...prev,
        [lobbyId]: 'not_requested'
      }));
    } else {
      Alert.alert('Hata', 'İstek geri alınamadı!');
    }
  };

  // Sil butonu
  const handleDeleteLobby = async (lobbyId) => {
    Alert.alert('Lobi Sil', 'Bu lobiyi silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        const { error } = await dbService.deleteLobby(lobbyId);
        if (!error) fetchLobbies();
        else Alert.alert('Hata', 'Lobi silinemedi!');
      }}
    ]);
  };

  // Lobi detay modalı açıldığında join request'leri yükle
  useEffect(() => {
    if (selectedLobby && user && selectedLobby.creator_user_id === user.id) {
      loadJoinRequests(selectedLobby.id);
    } else {
      setJoinRequests([]);
    }
    
    // Kullanıcı lobi sahibi değilse istek durumunu kontrol et
    if (selectedLobby && user && selectedLobby.creator_user_id !== user.id) {
      checkRequestStatus(selectedLobby.id);
    }
  }, [selectedLobby, user]);

  const loadJoinRequests = async (lobbyId) => {
    setLoadingRequests(true);
    const { data, error } = await dbService.getLobbyJoinRequests(lobbyId);
    if (!error) setJoinRequests(data || []);
    setLoadingRequests(false);
  };

  // Katılım isteğini onayla/reddet
  const handleRespondJoinRequest = async (requestId, status, lobbyId, userId) => {
    const { error } = await dbService.respondLobbyJoinRequest(requestId, status, lobbyId, userId);
    if (!error) {
      loadJoinRequests(lobbyId);
      fetchLobbies();
    } else {
      Alert.alert('Hata', 'İşlem başarısız!');
    }
  };

  // Katılımcı profili görüntüleme
  const handleViewParticipantProfile = (participant) => {
    setSelectedParticipant(participant);
    setParticipantProfileModalVisible(true);
  };

  // Davet gönderme
  const handleInviteUser = async () => {
    if (!inviteUsername.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı giriniz.');
      return;
    }

    setInviting(true);
    try {
      // Kullanıcıyı bul
      const { data: userData, error: userError } = await dbService.getUserByUsername(inviteUsername.trim());
      
      if (userError || !userData) {
        Alert.alert('Hata', 'Kullanıcı bulunamadı.');
        setInviting(false);
        return;
      }

      // Kullanıcı zaten lobide mi kontrol et
      const isAlreadyInLobby = selectedLobby.lobby_participants?.some(p => p.user_id === userData.id);
      if (isAlreadyInLobby) {
        Alert.alert('Hata', 'Bu kullanıcı zaten lobide.');
        setInviting(false);
        return;
      }

      // Davet gönder
      const { error: inviteError } = await dbService.inviteUserToLobby(selectedLobby.id, userData.id, user.id);
      
      if (!inviteError) {
        Alert.alert('Başarılı', 'Davet gönderildi!');
        setInviteModalVisible(false);
        setInviteUsername('');
      } else {
        Alert.alert('Hata', 'Davet gönderilemedi.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu.');
    }
    setInviting(false);
  };

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Turnuva bilgisi bulunamadı.</Text>
      </View>
    )
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>{tournament.name}</Text>
      <View style={styles.row}>
        <Ionicons name="game-controller" size={20} color={Colors.primary} />
        <Text style={styles.label}>{tournament.games?.name}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="calendar" size={20} color={Colors.primary} />
        <Text style={styles.label}>Başlangıç: {new Date(tournament.start_date).toLocaleString('tr-TR')}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="calendar" size={20} color={Colors.primary} />
        <Text style={styles.label}>Bitiş: {new Date(tournament.end_date).toLocaleString('tr-TR')}</Text>
      </View>
      {tournament.description && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{tournament.description}</Text>
        </View>
      )}
      {/* Lobi Listesi */}
      <View style={{ marginTop: 32 }}>
        <Text style={styles.sectionTitle}>Lobiler</Text>
        <TouchableOpacity
          style={{ backgroundColor: Colors.primary, padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' }}
          onPress={handleCreateLobby}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Lobi Oluştur</Text>
        </TouchableOpacity>
        {/* Lobi oluşturma modalı */}
        <Modal
          visible={createModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCreateModalVisible(false)}
        >
          <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Lobi Oluştur</Text>
              <TextInput
                placeholder="Lobi Adı (isteğe bağlı)"
                value={lobbyName}
                onChangeText={setLobbyName}
                style={{ borderWidth: 1, borderColor: Colors.card.border, borderRadius: 8, padding: 10, marginBottom: 12 }}
              />
              <TextInput
                placeholder="Maksimum Katılımcı (örn: 8)"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="number-pad"
                style={{ borderWidth: 1, borderColor: Colors.card.border, borderRadius: 8, padding: 10, marginBottom: 16 }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => setCreateModalVisible(false)}
                  style={{ marginRight: 16 }}
                  disabled={creating}
                >
                  <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitLobby}
                  style={{ backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 }}
                  disabled={creating}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{creating ? 'Oluşturuluyor...' : 'Oluştur'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Lobi oluşturma modalı sonu */}
        {loadingLobbies ? (
          <Text>Yükleniyor...</Text>
        ) : lobbies.length === 0 ? (
          <Text style={{ color: Colors.text.secondary }}>Bu turnuvaya ait açık lobi yok.</Text>
        ) : (
          lobbies.map(lobby => {
            // Katılımcı ve istek sayısı
            const participantCount = Array.isArray(lobby.lobby_participants)
              ? lobby.lobby_participants.length
              : (typeof lobby.lobby_participants?.count === 'number' ? lobby.lobby_participants.count : 1);
            const maxCount = lobby.max_participants || 8;
            const isOwner = user && lobby.creator_user_id === user.id;
            const userInLobby = isUserInLobby(lobby);
            const userRequested = isUserRequested(lobby);
            return (
              <TouchableOpacity key={lobby.id} onPress={() => { setSelectedLobby(lobby); setLobbyDetailModalVisible(true); }} activeOpacity={0.85} style={{ padding: 12, borderWidth: 1, borderColor: Colors.card.border, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{lobby.profiles?.username || 'Kullanıcı'}</Text>
                <Text style={{ color: Colors.text.secondary }}>Katılımcı: {participantCount}/{maxCount}</Text>
                <Text style={{ color: Colors.text.secondary }}>Oluşturulma: {new Date(lobby.created_at).toLocaleString('tr-TR')}</Text>
                                 <View style={{ flexDirection: 'row', marginTop: 8 }}>
                   {!isOwner && !userInLobby && !userRequested && participantCount < maxCount && (
                     <TouchableOpacity
                       style={{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, marginRight: 10 }}
                       onPress={() => handleRequestJoinLobby(lobby.id)}
                     >
                       <Text style={{ color: '#fff', fontWeight: 'bold' }}>Katıl</Text>
                     </TouchableOpacity>
                   )}
                   {!isOwner && (userRequested || requestStatus[lobby.id] === 'requested') && (
                     <TouchableOpacity
                       style={{ backgroundColor: Colors.card.border, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, marginRight: 10 }}
                       onPress={() => handleCancelJoinRequest(lobby.id)}
                     >
                       <Text style={{ color: Colors.text.secondary, fontWeight: 'bold' }}>İsteği Geri Al</Text>
                     </TouchableOpacity>
                   )}
                  {!isOwner && userInLobby && (
                    <View style={{ backgroundColor: Colors.success, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, marginRight: 10 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Katılımcısınız</Text>
                    </View>
                  )}
                  {isOwner && (
                    <TouchableOpacity
                      style={{ backgroundColor: Colors.error, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 }}
                      onPress={() => handleDeleteLobby(lobby.id)}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sil</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
      {/* Lobi Detay Modalı */}
      <Modal
        visible={lobbyDetailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLobbyDetailModalVisible(false)}
      >
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%', maxHeight: '80%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Lobi Detayları</Text>
              {selectedLobby && (
                <>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{selectedLobby.name || 'Lobi'}</Text>
                  {selectedLobby.description ? <Text style={{ color: Colors.text.secondary, marginBottom: 6 }}>{selectedLobby.description}</Text> : null}
                  <Text style={{ color: Colors.text.secondary }}>Oluşturan: {selectedLobby.profiles?.username || 'Kullanıcı'}</Text>
                  <Text style={{ color: Colors.text.secondary }}>Maksimum Katılımcı: {selectedLobby.max_participants}</Text>
                  <Text style={{ color: Colors.text.secondary }}>Oluşturulma: {new Date(selectedLobby.created_at).toLocaleString('tr-TR')}</Text>
                  {/* Katıl butonu modalda */}
                  {(() => {
                    const userInLobby = isUserInLobby(selectedLobby);
                    const userRequested = isUserRequested(selectedLobby);
                    const isOwner = user && selectedLobby.creator_user_id === user.id;
                    const participantCount = Array.isArray(selectedLobby.lobby_participants)
                      ? selectedLobby.lobby_participants.length
                      : (typeof selectedLobby.lobby_participants?.count === 'number' ? selectedLobby.lobby_participants.count : 1);
                    const maxCount = selectedLobby.max_participants || 8;
                    if (!isOwner && !userInLobby && !userRequested && participantCount < maxCount) {
                      return (
                        <TouchableOpacity
                          style={{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 10, marginBottom: 10 }}
                          onPress={() => handleRequestJoinLobby(selectedLobby.id)}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Katıl</Text>
                        </TouchableOpacity>
                      );
                                         } else if (!isOwner && (userRequested || requestStatus[selectedLobby.id] === 'requested')) {
                       return (
                         <TouchableOpacity
                           style={{ backgroundColor: Colors.card.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 10, marginBottom: 10 }}
                           onPress={() => handleCancelJoinRequest(selectedLobby.id)}
                         >
                           <Text style={{ color: Colors.text.secondary, fontWeight: 'bold' }}>İsteği Geri Al</Text>
                         </TouchableOpacity>
                       );
                     } else if (!isOwner && userInLobby) {
                      return (
                        <View style={{ backgroundColor: Colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 10, marginBottom: 10 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Katılımcısınız</Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Davet butonu - sadece lobi sahibi için */}
                  {user && selectedLobby.creator_user_id === user.id && (
                    <TouchableOpacity
                      style={{ backgroundColor: Colors.warning, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 10, marginBottom: 10 }}
                      onPress={() => setInviteModalVisible(true)}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kullanıcı Davet Et</Text>
                    </TouchableOpacity>
                  )}
                  
                  <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Katılımcılar:</Text>
                  {Array.isArray(selectedLobby.lobby_participants) && selectedLobby.lobby_participants.length > 0 ? (
                    selectedLobby.lobby_participants.map((p, idx) => (
                      <TouchableOpacity 
                        key={p.user_id || idx} 
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, marginBottom: 8, padding: 8, backgroundColor: Colors.card.background, borderRadius: 8 }}
                        onPress={() => handleViewParticipantProfile(p)}
                      >
                        {p.profiles?.profile_picture_url && (
                          <Image source={{ uri: p.profiles.profile_picture_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: Colors.text.primary, fontWeight: 'bold' }}>
                            {p.profiles?.username || p.user_id}
                          </Text>
                          <Text style={{ color: Colors.text.secondary, fontSize: 12 }}>
                            {p.profiles?.full_name || 'İsim belirtilmemiş'}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{ color: Colors.text.secondary, marginLeft: 8 }}>Henüz katılımcı yok.</Text>
                  )}
                  
                  {/* Lobi sahibi için gelen istekler */}
                  {user && selectedLobby.creator_user_id === user.id && (
                    <View style={{ marginTop: 18 }}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Gelen Katılım İstekleri:</Text>
                      {loadingRequests ? (
                        <Text>Yükleniyor...</Text>
                      ) : joinRequests.length === 0 ? (
                        <Text style={{ color: Colors.text.secondary }}>Bekleyen istek yok.</Text>
                      ) : (
                        joinRequests.filter(r => r.status === 'pending').map(req => (
                          <View key={req.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ flex: 1 }}>{req.profiles?.username || req.user_id}</Text>
                            <TouchableOpacity onPress={() => handleRespondJoinRequest(req.id, 'approved', selectedLobby.id, req.user_id)} style={{ backgroundColor: Colors.success, padding: 6, borderRadius: 6, marginRight: 8 }}>
                              <Text style={{ color: '#fff' }}>Onayla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRespondJoinRequest(req.id, 'rejected', selectedLobby.id, req.user_id)} style={{ backgroundColor: Colors.error, padding: 6, borderRadius: 6 }}>
                              <Text style={{ color: '#fff' }}>Reddet</Text>
                            </TouchableOpacity>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setLobbyDetailModalVisible(false)}
              style={{ marginTop: 20, alignSelf: 'flex-end' }}
            >
              <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Katılımcı Profil Modalı */}
      <Modal
        visible={participantProfileModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setParticipantProfileModalVisible(false)}
      >
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' }}>
            {selectedParticipant && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  {selectedParticipant.profiles?.profile_picture_url && (
                    <Image 
                      source={{ uri: selectedParticipant.profiles.profile_picture_url }} 
                      style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }} 
                    />
                  )}
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary }}>
                    {selectedParticipant.profiles?.username || 'Kullanıcı'}
                  </Text>
                  <Text style={{ color: Colors.text.secondary, marginTop: 4 }}>
                    {selectedParticipant.profiles?.full_name || 'İsim belirtilmemiş'}
                  </Text>
                </View>
                
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Profil Bilgileri:</Text>
                  <Text style={{ color: Colors.text.secondary, marginBottom: 4 }}>
                    Kullanıcı ID: {selectedParticipant.user_id}
                  </Text>
                  <Text style={{ color: Colors.text.secondary, marginBottom: 4 }}>
                    Katılım Tarihi: {new Date(selectedParticipant.joined_at).toLocaleString('tr-TR')}
                  </Text>
                </View>
                
                {/* Oyun profilleri buraya eklenebilir */}
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Oyun Profilleri:</Text>
                <Text style={{ color: Colors.text.secondary }}>
                  Oyun profilleri yakında eklenecek...
                </Text>
              </>
            )}
            <TouchableOpacity
              onPress={() => setParticipantProfileModalVisible(false)}
              style={{ marginTop: 20, alignSelf: 'flex-end' }}
            >
              <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Davet Modalı */}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Kullanıcı Davet Et</Text>
            <TextInput
              placeholder="Kullanıcı adı girin"
              value={inviteUsername}
              onChangeText={setInviteUsername}
              style={{ borderWidth: 1, borderColor: Colors.card.border, borderRadius: 8, padding: 12, marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setInviteModalVisible(false)}
                style={{ marginRight: 16 }}
                disabled={inviting}
              >
                <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleInviteUser}
                style={{ backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 }}
                disabled={inviting}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  {inviting ? 'Gönderiliyor...' : 'Davet Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
})

export default TournamentDetailsScreen 