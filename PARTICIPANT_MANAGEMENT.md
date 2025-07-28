# Katılımcı Yönetimi Özellikleri

Bu dokümantasyon, uygulamaya eklenen yeni katılımcı yönetimi özelliklerini açıklamaktadır.

## 🎯 Eklenen Özellikler

### 1. Katılımcı Silme
- **Turnuva Katılımcıları**: Turnuva sahipleri katılımcıları turnuvadan çıkarabilir
- **Lobi Katılımcıları**: Lobi sahipleri katılımcıları lobiden çıkarabilir
- **Güvenlik**: Sadece sahipler katılımcı silebilir, kendilerini silemezler

### 2. Katılımcı Davet Etme
- **Turnuva Davetleri**: Kullanıcıları turnuvaya davet etme sistemi
- **Lobi Davetleri**: Kullanıcıları lobiye davet etme sistemi
- **Bildirim Sistemi**: Davet edilen kullanıcılara otomatik bildirim gönderimi
- **Davet Durumu Takibi**: Bekleyen, onaylanan, reddedilen davetler

### 3. Kullanıcı Oyun Profilleri
- **Profil Oluşturma**: Her oyun için ayrı nickname ve rank profili
- **Profil Yönetimi**: Profilleri düzenleme, silme, güncelleme
- **Turnuva Entegrasyonu**: Turnuvaya katılırken otomatik profil kontrolü
- **Zorunlu Profil**: Turnuvaya katılmak için oyun profili zorunlu

## 📱 Yeni Ekranlar

### 1. UserGameProfilesScreen
- **Konum**: `src/screens/main/UserGameProfilesScreen.js`
- **Özellikler**:
  - Oyun profillerini listeleme
  - Yeni profil oluşturma
  - Mevcut profilleri düzenleme
  - Profil silme
  - Oyun bazlı profil yönetimi

### 2. TournamentParticipantsScreen
- **Konum**: `src/screens/main/TournamentParticipantsScreen.js`
- **Özellikler**:
  - Turnuva katılımcılarını listeleme
  - Kullanıcı davet etme
  - Katılımcı çıkarma
  - Katılımcı oyun profillerini görüntüleme

### 3. TournamentJoinModal
- **Konum**: `src/screens/main/TournamentJoinModal.js`
- **Özellikler**:
  - Turnuvaya katılırken oyun profili kontrolü
  - Profil oluşturma/güncelleme
  - Turnuva kuralları gösterimi
  - Zorunlu profil doğrulaması

## 🔧 Veritabanı Değişiklikleri

### Yeni Tablolar

#### 1. lobby_invitations
```sql
CREATE TABLE public.lobby_invitations (
  id bigint NOT NULL DEFAULT nextval('lobby_invitations_id_seq'::regclass),
  lobby_id bigint NOT NULL,
  invited_user_id uuid NOT NULL,
  inviter_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT lobby_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT lobby_invitations_lobby_id_fkey FOREIGN KEY (lobby_id) REFERENCES public.lobbies(id),
  CONSTRAINT lobby_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id),
  CONSTRAINT lobby_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES public.profiles(id)
);
```

#### 2. tournament_invitations
```sql
CREATE TABLE public.tournament_invitations (
  id bigint NOT NULL DEFAULT nextval('tournament_invitations_id_seq'::regclass),
  tournament_id bigint NOT NULL,
  invited_user_id uuid NOT NULL,
  inviter_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT tournament_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_invitations_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT tournament_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id),
  CONSTRAINT tournament_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES public.profiles(id)
);
```

### Güncellenen Tablolar

#### user_game_profiles
- `created_at` ve `updated_at` alanları eklendi

## 🔐 Güvenlik (RLS Politikaları)

### Lobby Invitations
- Kullanıcılar sadece kendi davetlerini görebilir
- Sadece davet gönderen kişi davet oluşturabilir
- Davet edilen kişi daveti yanıtlayabilir/silebilir

### Tournament Invitations
- Kullanıcılar sadece kendi davetlerini görebilir
- Sadece davet gönderen kişi davet oluşturabilir
- Davet edilen kişi daveti yanıtlayabilir/silebilir

### User Game Profiles
- Kullanıcılar sadece kendi oyun profillerini görebilir
- Kullanıcılar kendi profillerini oluşturabilir/güncelleyebilir/silebilir

## 🚀 Yeni API Fonksiyonları

### dbService'e Eklenen Fonksiyonlar

#### Katılımcı Yönetimi
- `removeTournamentParticipant(tournament_id, user_id)`
- `removeLobbyParticipant(lobby_id, user_id)`

#### Davet Sistemi
- `inviteUserToLobby(lobby_id, invited_user_id, inviter_user_id)`
- `inviteUserToTournament(tournament_id, invited_user_id, inviter_user_id)`
- `getUserInvitations(user_id)`
- `getUserTournamentInvitations(user_id)`
- `respondToInvitation(invitation_id, status, invitation_type)`

#### Oyun Profilleri
- `createOrUpdateUserGameProfile(user_id, game_id, nickname, rank)`
- `getUserGameProfile(user_id, game_id)`
- `getAllUserGameProfiles(user_id)`
- `deleteUserGameProfile(user_id, game_id)`
- `joinTournamentWithGameProfile(tournament_id, user_id, game_id, nickname, rank)`
- `joinLobbyWithGameProfile(lobby_id, user_id, game_id, nickname, rank)`

## 🎮 Kullanım Senaryoları

### 1. Turnuvaya Katılma
1. Kullanıcı turnuvaya katılmak istediğinde "Katıl" butonuna tıklar
2. Sistem oyun profili kontrol eder
3. Profil yoksa oluşturma modalı açılır
4. Profil varsa güncelleme seçeneği sunulur
5. Profil oluşturulduktan sonra turnuvaya katılım gerçekleşir

### 2. Katılımcı Davet Etme
1. Turnuva sahibi "Kullanıcı Davet Et" butonuna tıklar
2. Kullanıcı adı girilir
3. Sistem kullanıcıyı bulur ve davet gönderir
4. Davet edilen kullanıcıya bildirim gönderilir
5. Davet edilen kullanıcı daveti kabul/red edebilir

### 3. Katılımcı Çıkarma
1. Turnuva sahibi katılımcı listesinde "Sil" butonuna tıklar
2. Onay modalı açılır
3. Onaylandıktan sonra katılımcı turnuvadan çıkarılır

### 4. Oyun Profili Yönetimi
1. Profil ekranından "Oyun Profilleri" seçilir
2. Mevcut profiller listelenir
3. Yeni profil oluşturulabilir
4. Mevcut profiller düzenlenebilir/silinebilir

## 🔄 Navigasyon Güncellemeleri

### Yeni Ekranlar
- `TournamentParticipants`: Turnuva katılımcıları yönetimi
- `UserGameProfiles`: Oyun profilleri yönetimi

### Güncellenen Ekranlar
- `TournamentsScreen`: Turnuva katılma modalı eklendi
- `TournamentDetailsScreen`: Katılımcılar bölümü eklendi
- `ProfileScreen`: Oyun profilleri menü öğesi eklendi

## 📋 Test Senaryoları

### 1. Oyun Profili Oluşturma
- [ ] Yeni oyun profili oluşturma
- [ ] Mevcut profili güncelleme
- [ ] Profil silme
- [ ] Geçersiz veri kontrolü

### 2. Turnuva Katılma
- [ ] Profil olmadan katılma denemesi
- [ ] Profil ile katılma
- [ ] Profil güncelleme ile katılma
- [ ] Aynı turnuvaya tekrar katılma kontrolü

### 3. Davet Sistemi
- [ ] Kullanıcı davet etme
- [ ] Davet kabul etme
- [ ] Davet reddetme
- [ ] Geçersiz kullanıcı davet etme

### 4. Katılımcı Yönetimi
- [ ] Katılımcı listeleme
- [ ] Katılımcı çıkarma
- [ ] Yetki kontrolü
- [ ] Kendini çıkarma kontrolü

## 🐛 Bilinen Sorunlar

1. **Turnuva Sahipliği**: Şu anda tüm kullanıcılar turnuva katılımcılarını yönetebiliyor. Gerçek turnuva sahipliği sistemi eklenmeli.
2. **Davet Bildirimleri**: Bildirim sistemi tam olarak entegre edilmeli.
3. **Profil Doğrulama**: Nickname benzersizlik kontrolü eklenmeli.

## 🔮 Gelecek Geliştirmeler

1. **Takım Davetleri**: Takım bazlı davet sistemi
2. **Toplu Davet**: Birden fazla kullanıcıyı aynı anda davet etme
3. **Davet Şablonları**: Önceden tanımlanmış davet mesajları
4. **Profil Doğrulama**: Oyun sunucuları ile entegrasyon
5. **İstatistikler**: Katılımcı istatistikleri ve analitikler 