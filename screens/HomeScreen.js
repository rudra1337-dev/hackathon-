import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Title, Paragraph, FAB } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../config/firebase';
import { getSecurely } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const userSession = await getSecurely('user_session');
        setUser(userSession);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        setUser({
          uid: userAuth.uid,
          email: userAuth.email,
          displayName: userAuth.displayName
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmergencyAction = () => {
    navigation.navigate('Emergency');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.appTitle}>MediPass</Text>
        <Text style={styles.appSubtitle}>Your Medical History Wallet</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Emergency Access Button */}
        <TouchableOpacity onPress={handleEmergencyAction}>
          <Card style={styles.emergencyCard}>
            <Card.Content>
              <Title style={styles.emergencyTitle}>Emergency Access</Title>
              <Paragraph style={styles.emergencyText}>
                Quick access to critical medical information for emergency responders
              </Paragraph>
            </Card.Content>
          </Card>
        </TouchableOpacity>
        
        {user ? (
          <>
            <Text style={styles.sectionTitle}>My Health Dashboard</Text>
            
            <Card style={styles.featureCard} onPress={() => navigation.navigate('Profile')}>
              <Card.Content>
                <Title>My Profile</Title>
                <Paragraph>Manage your personal profile and account settings</Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard} onPress={() => navigation.navigate('MedicalInfo')}>
              <Card.Content>
                <Title>Medical Information</Title>
                <Paragraph>Manage your medical history, conditions, and medications</Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard} onPress={() => navigation.navigate('Documents')}>
              <Card.Content>
                <Title>Medical Documents</Title>
                <Paragraph>Upload and manage your medical documents and records</Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard} onPress={() => navigation.navigate('Share')}>
              <Card.Content>
                <Title>Share Records</Title>
                <Paragraph>Securely share your medical information with healthcare providers</Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard} onPress={() => navigation.navigate('Settings')}>
              <Card.Content>
                <Title>Settings</Title>
                <Paragraph>Configure app settings and preferences</Paragraph>
              </Card.Content>
            </Card>
          </>
        ) : (
          <>
            <Card style={styles.authCard}>
              <Card.Content>
                <Title style={styles.authTitle}>Welcome to MediPass</Title>
                <Paragraph style={styles.authText}>
                  Store, access, and share your medical history securely
                </Paragraph>
                
                <View style={styles.authButtons}>
                  <Button 
                    mode="contained" 
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    Login
                  </Button>
                  
                  <Button 
                    mode="outlined" 
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                  >
                    Create Account
                  </Button>
                </View>
              </Card.Content>
            </Card>
            
            <Text style={styles.sectionTitle}>Why use MediPass?</Text>
            
            <Card style={styles.featureCard}>
              <Card.Content>
                <Title>Quick Emergency Access</Title>
                <Paragraph>
                  Let emergency responders access vital information like allergies and blood type when you can't communicate
                </Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard}>
              <Card.Content>
                <Title>Secure Data Storage</Title>
                <Paragraph>
                  Your health information is encrypted and secured with industry-standard protection
                </Paragraph>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard}>
              <Card.Content>
                <Title>Easy Information Sharing</Title>
                <Paragraph>
                  Share your medical history with healthcare providers via QR code or secure link
                </Paragraph>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
      
      {user && (
        <FAB
          style={styles.fab}
          icon="medical-bag"
          label="Emergency"
          color="#FFFFFF"
          onPress={handleEmergencyAction}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0066CC'
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  appSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5
  },
  content: {
    flex: 1,
    padding: 15
  },
  emergencyCard: {
    backgroundColor: '#FF4500',
    marginBottom: 20,
    borderRadius: 10
  },
  emergencyTitle: {
    color: '#FFFFFF',
    fontSize: 20
  },
  emergencyText: {
    color: '#FFFFFF'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 5
  },
  featureCard: {
    marginBottom: 15,
    borderRadius: 10
  },
  authCard: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF'
  },
  authTitle: {
    textAlign: 'center',
    fontSize: 22
  },
  authText: {
    textAlign: 'center',
    marginVertical: 10
  },
  authButtons: {
    marginTop: 20
  },
  loginButton: {
    marginBottom: 10,
    backgroundColor: '#0066CC'
  },
  registerButton: {
    borderColor: '#0066CC'
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF4500'
  }
});

export default HomeScreen; 