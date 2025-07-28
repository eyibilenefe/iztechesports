// İYTE E-Spor Renk Paleti - Gerçek İYTE Renkleri
export const Colors = {
  // Ana İYTE Renkleri
  primary: '#8B0000',           // İYTE Koyu Kırmızı (Dark Red)
  primaryLight: '#B22222',      // Açık Kırmızı
  primaryDark: '#660000',       // Çok Koyu Kırmızı
  
  // E-Spor Temalı Accent Renkler
  gaming: {
    gold: '#FFD700',            // Altın
    silver: '#C0C0C0',          // Gümüş
    electric: '#00BFFF',        // Elektrik Mavi
    neon: '#39FF14',            // Neon Yeşil
    purple: '#9932CC',          // Mor
  },
  
  // Sistem Renkleri - Temiz ve Modern
  background: '#FFFFFF',        // Beyaz arka plan
  surface: '#F8F9FA',           // Açık gri kartlar
  surfaceLight: '#FFFFFF',      // Beyaz yüzey
  surfaceDark: '#E9ECEF',       // Koyu gri
  
  // Metin Renkleri
  text: {
    primary: '#212529',         // Koyu gri metin
    secondary: '#6C757D',       // Orta gri
    disabled: '#ADB5BD',        // Açık gri
    accent: '#8B0000',          // Kırmızı vurgu
    white: '#FFFFFF',           // Beyaz metin
  },
  
  // Status colors
  success: '#28a745',
  warning: '#ffc107', 
  error: '#dc3545',
  info: '#17A2B8',              // Mavi
  
  // Gradient'ler
  gradients: {
    primary: ['#8B0000', '#B22222'],           // Kırmızı gradient
    secondary: ['#F8F9FA', '#FFFFFF'],         // Beyaz-gri gradient  
    gaming: ['#FFD700', '#FFA500'],            // Altın gradient
    success: ['#28A745', '#20C997'],           // Yeşil gradient
    warning: ['#FFC107', '#FF8C00'],           // Sarı gradient
    error: ['#DC3545', '#FF6B6B'],             // Kırmızı gradient
    elegant: ['#8B0000', '#FFFFFF'],           // Kırmızı-beyaz
  },
  
  // Tab ve Navigation
  tabBar: {
    active: '#8B0000',          // Kırmızı aktif
    inactive: '#6C757D',        // Gri pasif
    background: '#FFFFFF',      // Beyaz arka plan
  },
  
  // Kartlar
  card: {
    background: '#FFFFFF',      // Beyaz kart
    border: '#DEE2E6',          // Açık gri kenar
    shadow: '#00000020',        // Hafif gölge
  },
  
  // Butonlar
  button: {
    primary: '#8B0000',         // Kırmızı ana buton
    secondary: '#6C757D',       // Gri ikincil
    danger: '#DC3545',          // Hata butonu
    success: '#28A745',         // Başarı butonu
  }
}

// Oyun türlerine göre renkler - Daha canlı ve temiz
export const GameColors = {
  'CS:GO': '#FF4500',           // Turuncu
  'Valorant': '#FF1744',        // Kırmızı
  'League of Legends': '#C9AA71', // Altın
  'DOTA 2': '#D32F2F',          // Koyu kırmızı
  'Overwatch': '#FF9800',       // Turuncu
  'Rocket League': '#2196F3',   // Mavi
  'FIFA': '#4CAF50',            // Yeşil
  'Call of Duty': '#424242',    // Koyu gri
  'Apex Legends': '#FF6D00',    // Turuncu
  'Minecraft': '#8BC34A',       // Yeşil
  default: '#6C757D',           // Gri
} 