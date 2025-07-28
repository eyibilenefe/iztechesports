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
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { useAuth } from '../../context/AuthContext'
import { Colors } from '../../constants/Colors'

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const { email, password, confirmPassword } = formData

    if (!email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun')
      return false
    }

    if (!email.endsWith('@std.iyte.edu.tr')) {
      Alert.alert('Hata', 'Sadece @std.iyte.edu.tr uzantılı e-posta adresleri kabul edilir')
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor')
      return false
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır')
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)
    const { email, password } = formData
    
    const result = await signUp(email, password, {})
    
    if (!result.success) {
      Alert.alert('Kayıt Hatası', result.error)
    } else {
      Alert.alert(
        'Başarılı!', 
        'Hesabınız oluşturuldu. E-posta adresinizi doğrulayın.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
      )
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
          {/* Header */}
          <Animatable.View animation="slideInDown" style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/iyte-esports-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>İYTE E-Spor'a Katıl</Text>
          </Animatable.View>

          {/* Form */}
          <Animatable.View animation="fadeInUp" delay={300} style={styles.formContainer}>
            <View style={styles.formCard}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta Adresi"
                  placeholderTextColor={Colors.text.disabled}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
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
                  placeholder="Şifre"
                  placeholderTextColor={Colors.text.disabled}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
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

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Şifre Tekrarı"
                  placeholderTextColor={Colors.text.disabled}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={Colors.gradients.success}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <Text style={styles.buttonText}>Hesap Oluşturuluyor...</Text>
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={20} color={Colors.text.white} />
                      <Text style={styles.buttonText}>  HESAP OLUŞTUR</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Giriş Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>

          {/* Terms */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Hesap oluşturarak{' '}
              <Text style={styles.termsLink}>Kullanım Şartları</Text> ve{' '}
              <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
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
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    padding: 10,
    zIndex: 1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
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
  registerButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonDisabled: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsContainer: {
    paddingHorizontal: 10,
  },
  termsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.text.white,
    fontWeight: 'bold',
  },
})

export default RegisterScreen 