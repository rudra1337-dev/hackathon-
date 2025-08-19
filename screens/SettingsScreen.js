import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Switch, Divider, Button, Text, Portal, Dialog, TextInput, Snackbar } from 'react-native-paper';
import { getSecurely, deleteSecurely } from '../utils/storage';
import { signOut, resetPassword } from '../utils/auth';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    biometricAuth: false,
    autoBackup: true,
    darkMode: false,
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [email, setEmail] = useState('');
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
        setEmail(userSession.email || '');
        
        // Load settings
        const savedSettings = await getSecurely('user_settings');
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
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

  // Toggle setting
  const toggleSetting = async (setting) => {
    try {
      const updatedSettings = {
        ...settings,
        [setting]: !settings[setting]
      };
      
      setSettings(updatedSettings);
      await getSecurely('user_settings', updatedSettings);
    } catch (error) {
      console.error('Error saving setting:', error);
      showSnackbar('Failed to save setting');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
              showSnackbar('Error signing out');
            }
          }
        }
      ]
    );
  };

  // Handle reset password
  const handleResetPassword = async () => {
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setResetPasswordDialog(false);
        showSnackbar('Password reset email sent. Please check your inbox.');
      } else {
        showSnackbar(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showSnackbar('Error sending password reset email');
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            showSnackbar('Account deletion feature will be implemented in a future update');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          
          <List.Item
            title="Edit Profile"
            description="Edit your personal information"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => navigation.navigate('Profile')}
          />
          
          <List.Item
            title="Change Password"
            description="Reset your account password"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            onPress={() => setResetPasswordDialog(true)}
          />
          
          <Divider />
          
          <List.Subheader>Preferences</List.Subheader>
          
          <List.Item
            title="Notifications"
            description="Receive reminders and alerts"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => (
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                color="#0066CC"
              />
            )}
          />
          
          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID to access the app"
            left={props => <List.Icon {...props} icon="fingerprint" />}
            right={props => (
              <Switch
                value={settings.biometricAuth}
                onValueChange={() => toggleSetting('biometricAuth')}
                color="#0066CC"
              />
            )}
          />
          
          <List.Item
            title="Auto Backup"
            description="Automatically backup your data to the cloud"
            left={props => <List.Icon {...props} icon="cloud-upload" />}
            right={props => (
              <Switch
                value={settings.autoBackup}
                onValueChange={() => toggleSetting('autoBackup')}
                color="#0066CC"
              />
            )}
          />
          
          <List.Item
            title="Dark Mode"
            description="Enable dark theme for the app"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={props => (
              <Switch
                value={settings.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                color="#0066CC"
              />
            )}
          />
          
          <Divider />
          
          <List.Subheader>About</List.Subheader>
          
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => showSnackbar('Privacy Policy feature will be added in a future update')}
          />
          
          <List.Item
            title="Terms of Service"
            description="Read our terms of service"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => showSnackbar('Terms of Service feature will be added in a future update')}
          />
          
          <List.Item
            title="App Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              icon="logout" 
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </Button>
            
            <Button 
              mode="outlined" 
              icon="delete" 
              onPress={handleDeleteAccount}
              style={styles.deleteButton}
              textColor="#B00020"
            >
              Delete Account
            </Button>
          </View>
        </List.Section>
      </ScrollView>
      
      <Portal>
        <Dialog visible={resetPasswordDialog} onDismiss={() => setResetPasswordDialog(false)}>
          <Dialog.Title>Reset Password</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              We'll send a password reset link to your email address:
            </Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.emailInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetPasswordDialog(false)}>Cancel</Button>
            <Button onPress={handleResetPassword}>Send Reset Link</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
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
  buttonContainer: {
    padding: 20,
  },
  logoutButton: {
    marginBottom: 10,
    borderColor: '#0066CC',
  },
  deleteButton: {
    borderColor: '#B00020',
  },
  dialogText: {
    marginBottom: 15,
  },
  emailInput: {
    marginBottom: 10,
  },
});

export default SettingsScreen; 