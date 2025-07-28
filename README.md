# iYTE E-spor Topluluğu Mobil Uygulaması

## Proje Amacı

iYTE E-spor Topluluğu mobil uygulaması, üniversite ve çevresindeki e-spor tutkunlarının bir araya gelerek turnuvalara katılabileceği, takım kurabileceği, anketlere katılabileceği, çekilişlerden faydalanabileceği ve genel duyuruları takip edebileceği etkileşimli bir platformdur. Kullanıcılar oyun içi profillerini yönetebilir, geçici lobilerde buluşabilir ve sosyal olarak etkileşime girebilir.

## Temel Özellikler

- **Kullanıcı Profilleri:** Supabase ile güvenli giriş/çıkış, profil yönetimi, rol (üye, moderatör, admin) gösterimi, birden fazla oyun profili ekleme.
- **Oyunlar ve Turnuvalar:** Aktif oyunlar listesi, turnuva oluşturma ve katılım (bireysel veya takım olarak).
- **Duyurular ve Katılım:** Duyuru, anket, çekiliş ve lobi oluşturma; lobilere katılım ve takım kurma.
- **Sosyal Etkileşimler:** Anketler, çekilişler, etkinlik bildirimleri.
- **Maç ve Performans Takibi:** Maç sonuçları ve oyuncu istatistikleri.

## Kurulum ve Çalıştırma

### Gereksinimler

- [Node.js](https://nodejs.org/) (18.x veya üzeri önerilir)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Bir Supabase hesabı ve proje anahtarları (çevresel değişkenler için)

### Adımlar

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/kullaniciadi/iztechesports.git
   cd iztechesports
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Çevresel Değişkenleri Ayarlayın:**
   - Supabase URL ve anahtarlarını `.env` dosyasına ekleyin (örnek: `.env.example` varsa onu kopyalayın).
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

4. **Uygulamayı Başlatın:**
   ```bash
   npm start
   ```
   veya
   ```bash
   expo start
   ```
   - Expo Go uygulaması ile QR kodu tarayarak mobil cihazınızda çalıştırabilirsiniz.

### Platforma Özel Komutlar

- **Android:** `npm run android`
- **iOS:** `npm run ios`
- **Web:** `npm run web`

## Kullanım Kuralları ve Davranış İlkeleri

- Uygulama sadece iYTE e-spor topluluğu üyeleri içindir.
- Herkes saygılı, hoşgörülü ve destekleyici olmalıdır.
- Ayrımcılık, hile ve dolandırıcılık yasaktır.
- Profil ve medya içerikleri topluluk standartlarına uygun olmalıdır.

## Teknik Bilgiler

- **Backend:** Supabase (PostgreSQL, Auth)
- **Frontend:** React Native (Expo)
- **Bildirimler:** Expo Notifications
- **Veri Modeli:** Normalleştirilmiş, güvenli ve performans odaklı

## Katkı Sağlamak

Pull request'ler ve öneriler memnuniyetle karşılanır. Lütfen önce bir issue açarak değişiklik teklifinizi tartışın.

