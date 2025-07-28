iYTE E-spor Topluluğu Mobil Uygulaması Proje Tanımı ve Kuralları
Proje Amacı
iYTE E-spor Topluluğu mobil uygulaması, üniversite ve çevresindeki e-spor tutkunlarının bir araya gelerek turnuvalara katılabileceği, takım kurabileceği, anketlere katılabileceği, çekilişlerden faydalanabileceği ve genel duyuruları takip edebileceği etkileşimli bir platformdur.
Uygulama, oyuncuların oyun içi profillerini yönetmelerine, geçici lobilerde (takımlarda) buluşmalarına ve sosyal olarak etkileşime girmelerine olanak sağlar.

Uygulamanın Temel Özellikleri
1. Kullanıcı Profilleri
Supabase kimlik doğrulaması ile güvenli giriş/çıkış.

Profil sayfasında kullanıcı bilgileri, profil resmi, rol (üye, moderatör, admin) bilgisi gösterilir.

Her kullanıcı birden fazla oyun için oyun içi profillerini (nickname, rank vb.) kaydedebilir.

2. Oyunlar ve Turnuvalar
Platformda aktif olan oyunlar listelenir.

Turnuvalar oluşturulur ve oyunlara özel zaman aralıklarında düzenlenir.

Turnuvaya bireysel ya da takım olarak katılım sağlanabilir.

3. Duyurular ve Katılım
Duyurular, anketler, çekilişler ve lobiler gibi farklı türlerde etkinlikler oluşturulabilir.

Kullanıcılar duyurulara bağlı lobilere katılarak takım oluşturabilir veya var olan takımlara katılabilir.

Lobiler geçici olup, turnuva bitimiyle veya tamamlanmasıyla kapanır.

4. Sosyal Etkileşimler
Anketler ile topluluk görüşü alınabilir.

Çekilişlere katılım ve kazanan belirleme mekanizması mevcuttur.

Kullanıcılar etkinlikler hakkında bildirim alır.

5. Maç ve Performans Takibi
Tamamlanmış maçlar kaydedilir ve genel sonuçlar özetlenir.

Her oyuncunun maç içindeki bireysel performans istatistikleri detaylı tutulur.

Kullanım Kuralları ve Davranış İlkeleri
Genel Kurallar
Uygulama sadece iYTE e-spor topluluğu üyeleri için tasarlanmıştır; üyelik dışındaki kullanıcıların erişimi sınırlıdır.

Kullanıcılar, diğer katılımcılara karşı saygılı, hoşgörülü ve destekleyici davranmak zorundadır.

Irk, cinsiyet, din, etnik köken veya başka herhangi bir ayrımcılık kesinlikle yasaktır.

Hile, sahtekarlık ve dolandırıcılık içeren faaliyetler tespit edildiğinde ilgili kullanıcıların hesapları askıya alınabilir veya silinebilir.

Turnuva ve Lobiler
Turnuva ve lobilere katılımda dürüstlük esas alınır; oyunun kurallarına uyulmalıdır.

Geçici lobiler sadece ilgili turnuva veya etkinlik süresince aktiftir; süre sonunda otomatik olarak kapanır.

Her kullanıcı sadece bir lobiye aynı anda katılabilir.

Anket ve Çekiliş Katılımı
Anketlerde verilen yanıtlar kullanıcıya özel ve gizlidir, adil sonuçlar için sahte cevaplar engellenir.

Çekilişler rastgele seçme usulü ile yapılır; sonuçlar uygulama üzerinden duyurulur.

Hile yapıldığı tespit edilen çekiliş katılımcıları diskalifiye edilir.

Bildirimler ve Medya
Kullanıcılar, uygulama içi ve push bildirimler ile etkinliklerden haberdar edilir.

Profil fotoğrafları ve duyuru görselleri, topluluk standartlarına uygun olmalıdır; müstehcen, saldırgan veya telif hakkı ihlali içeren içerikler yasaktır.

Teknik Notlar ve Entegrasyonlar
Kullanıcı kimlik doğrulama işlemleri Supabase auth.users tablosu üzerinden yönetilir.

Tüm veri ilişkileri, performans ve güvenlik odaklı olarak PostgreSQL’de normalleştirilmiştir.

Bildirim, medya ve sosyal etkileşimler için genişletilebilir modüler yapı tasarlanmıştır.

Mobil uygulama React Native kullanılarak geliştirilecek ve Supabase API ile entegre çalışacaktır.

Özet
Bu uygulama, iYTE e-spor topluluğunun dijital buluşma noktası olarak, kullanıcıların oyun bazlı etkileşimlerini kolaylaştırmayı, sosyal deneyimlerini zenginleştirmeyi ve topluluk bağlarını güçlendirmeyi hedefler.
Kurallar ve yapı, adil ve güvenli bir ortam sağlamak için titizlikle hazırlanmıştır.

