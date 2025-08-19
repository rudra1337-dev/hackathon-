import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Avatar, Title, Card, Snackbar, ActivityIndicator } from 'react-native-paper';
import { getSecurely } from '../utils/storage';
import { getUserProfile } from '../utils/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userSession = await getSecurely('user_session');
        
        if (!userSession) {
          navigation.replace('Login');
          return;
        }
        
        setUser(userSession);
        
        // Load profile data
        const result = await getUserProfile(userSession.uid);
        
        if (result.success && result.data) {
          setProfile({
            fullName: result.data.fullName || '',
            email: result.data.email || '',
            phoneNumber: result.data.phoneNumber || '',
            address: result.data.address || '',
            emergencyContact: result.data.emergencyContact || '',
            emergencyPhone: result.data.emergencyPhone || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showSnackbar('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigation]);

  // Show snackbar message
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Handle profile changes
  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save profile information
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      
      showSnackbar('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Avatar.Text 
            size={80} 
            label={profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'U'} 
            style={styles.avatar} 
            color="#FFFFFF"
            backgroundColor="#0066CC"
          />
          <Title style={styles.name}>{profile.fullName}</Title>
          <Text style={styles.email}>{profile.email}</Text>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Personal Information</Title>
            
            <TextInput
              label="Full Name"
              value={profile.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="Email"
              value={profile.email}
              onChangeText={(text) => handleInputChange('email', text)}
              style={styles.input}
              mode="outlined"
              disabled={true}
              left={<TextInput.Icon icon="email" />}
            />
            
            <TextInput
              label="Phone Number"
              value={profile.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />
            
            <TextInput
              label="Address"
              value={profile.address}
              onChangeText={(text) => handleInputChange('address', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
              left={<TextInput.Icon icon="home" />}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Emergency Contact</Title>
            
            <TextInput
              label="Emergency Contact Name"
              value={profile.emergencyContact}
              onChangeText={(text) => handleInputChange('emergencyContact', text)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account-alert" />}
            />
            
            <TextInput
              label="Emergency Contact Phone"
              value={profile.emergencyPhone}
              onChangeText={(text) => handleInputChange('emergencyPhone', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone-alert" />}
            />
          </Card.Content>
        </Card>
        
        <Button
          mode="contained"
          onPress={handleSaveProfile}
          style={styles.saveButton}
          loading={saving}
          disabled={saving}
        >
          Save Profile
        </Button>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  avatar: {
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    color: '#666',
    marginTop: 5,
  },
  card: {
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#0066CC',
  },
  input: {
    marginBottom: 15,
  },
  saveButton: {
    margin: 20,
    paddingVertical: 8,
    backgroundColor: '#0066CC',
  },
});

export default ProfileScreen; 