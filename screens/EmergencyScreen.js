import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Banner } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { getEmergencyData } from '../utils/storage';
import EmergencyCard from '../components/EmergencyCard';

const EmergencyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [emergencyData, setEmergencyData] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        const data = await getEmergencyData();
        setEmergencyData(data);
      } catch (error) {
        console.error('Error fetching emergency data:', error);
        Alert.alert(
          'Error',
          'Failed to load emergency information. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Banner
        visible={bannerVisible}
        actions={[
          {
            label: 'Dismiss',
            onPress: () => setBannerVisible(false),
          },
        ]}
        icon="alert"
        style={styles.banner}
      >
        This emergency information can be viewed without authentication.
        It contains only critical medical information needed in an emergency.
      </Banner>
      
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4500" />
            <Text style={styles.loadingText}>Loading emergency information...</Text>
          </View>
        ) : emergencyData ? (
          <>
            <EmergencyCard emergencyData={emergencyData} />
            
            <View style={styles.actionContainer}>
              <Button 
                mode="contained" 
                icon="phone" 
                style={styles.emergencyButton}
                onPress={() => Alert.alert(
                  'Emergency Call',
                  'This would dial emergency services in a real app.'
                )}
              >
                Call Emergency Services
              </Button>
              
              {emergencyData.emergencyContacts && emergencyData.emergencyContacts.length > 0 && (
                <Button 
                  mode="outlined" 
                  icon="account-alert" 
                  style={styles.contactButton}
                  onPress={() => Alert.alert(
                    'Emergency Contact',
                    `This would call ${emergencyData.emergencyContacts[0].name} in a real app.`
                  )}
                >
                  Call Emergency Contact
                </Button>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataTitle}>No Emergency Information</Text>
            <Text style={styles.noDataText}>
              No emergency information has been set up yet. Please create an account and add your emergency medical information.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Home')}
              style={styles.homeButton}
            >
              Go to Home
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  banner: {
    backgroundColor: '#FFF3E0',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  actionContainer: {
    padding: 15,
    marginBottom: 30,
  },
  emergencyButton: {
    marginVertical: 10,
    backgroundColor: '#FF4500',
    paddingVertical: 5,
  },
  contactButton: {
    marginVertical: 10,
    borderColor: '#0066CC',
    paddingVertical: 5,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  homeButton: {
    backgroundColor: '#0066CC',
    marginTop: 10,
  }
});

export default EmergencyScreen; 