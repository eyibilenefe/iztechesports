import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { useAuth } from '../../context/AuthContext'
import { Colors } from '../../constants/Colors'

const { width, height } = Dimensions.get('window')

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun')
      return
    }

    setLoading(true)
    const result = await signIn(email, password)
    
    if (!result.success) {
      Alert.alert('Giriş Hatası', result.error)
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo ve Başlık */}
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/iyte-esports-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>İYTE E-SPOR</Text>
            <Text style={styles.subtitle}>Topluluğuna Hoş Geldin</Text>
            
            {/* Decorative elements */}
            <View style={styles.decorativeContainer}>
              <View style={[styles.decorativeCircle, { backgroundColor: Colors.gaming.gold }]} />
              <View style={[styles.decorativeCircle, { backgroundColor: Colors.text.white }]} />
              <View style={[styles.decorativeCircle, { backgroundColor: Colors.gaming.gold }]} />
            </View>
          </Animatable.View>

          {/* Giriş Formu */}
          <Animatable.View animation="fadeInUp" delay={300} style={styles.formContainer}>
            <View style={styles.formCard}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresin"
                  placeholderTextColor={Colors.text.disabled}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Şifren"
                  placeholderTextColor={Colors.text.disabled}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Şifremi Unuttum */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>

              {/* Giriş Butonu */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <Text style={styles.buttonText}>Giriş Yapılıyor...</Text>
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color={Colors.text.white} />
                      <Text style={styles.buttonText}>  GİRİŞ YAP</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Kayıt Ol */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Hesabın yok mu? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>

          {/* Alt Bilgi */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.footer}>
            <Text style={styles.footerText}>
              İzmir Yüksek Teknoloji Enstitüsü{'\n'}E-Spor Topluluğu
            </Text>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  formContainer: {
    marginBottom: 30,
  },
  formCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 25,
    shadowColor: Colors.card.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    marginBottom: 15,
    paddingRight: 15,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  inputIconContainer: {
    width: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  buttonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
})

export default LoginScreen 