import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Divider, Switch, RadioButton, Snackbar } from 'react-native-paper';
import { getSecurely } from '../utils/storage';
import { getMedicalInfo } from '../utils/medicalData';
import ShareQRCode from '../components/ShareQRCode';

const ShareScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [selectedData, setSelectedData] = useState({
    personalInfo: true,
    allergies: true,
    medications: true,
    conditions: true,
    emergencyContacts: true,
    documents: false
  });
  const [shareableDocs, setShareableDocs] = useState([]);
  const [expiryPeriod, setExpiryPeriod] = useState('24');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load user data and medical info
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userSession = await getSecurely('user_session');
        
        if (!userSession) {
          navigation.replace('Login');
          return;
        }
        
        setUser(userSession);
        
        // Load medical info
        const result = await getMedicalInfo(userSession.uid);
        
        if (result.success && result.data) {
          setMedicalInfo(result.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Failed to load your medical information');
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

  // Toggle selection for a data type
  const toggleDataSelection = (dataType) => {
    setSelectedData(prev => ({
      ...prev,
      [dataType]: !prev[dataType]
    }));
  };

  // Prepare data to share
  const prepareDataToShare = () => {
    if (!medicalInfo) return null;
    
    const dataToShare = {};
    
    if (selectedData.personalInfo) {
      dataToShare.personalInfo = medicalInfo.personalInfo;
    }
    
    if (selectedData.allergies) {
      dataToShare.allergies = medicalInfo.allergies;
    }
    
    if (selectedData.medications) {
      dataToShare.medications = medicalInfo.medications;
    }
    
    if (selectedData.conditions) {
      dataToShare.conditions = medicalInfo.conditions;
    }
    
    if (selectedData.emergencyContacts) {
      dataToShare.emergencyContacts = medicalInfo.emergencyContacts;
    }
    
    if (selectedData.documents && shareableDocs.length > 0) {
      dataToShare.documents = shareableDocs;
    }
    
    return dataToShare;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading medical information...</Text>
      </View>
    );
  }

  if (!medicalInfo) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>
          You haven't saved any medical information yet. Please add your medical information first.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('MedicalInfo')}
          style={styles.addInfoButton}
        >
          Add Medical Information
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Share Medical Information</Title>
            <Paragraph style={styles.subtitle}>
              Select what information you want to share and generate a secure QR code or link
            </Paragraph>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Select Information to Share</Text>
            
            <View style={styles.optionContainer}>
              <Text>Personal Information</Text>
              <Switch
                value={selectedData.personalInfo}
                onValueChange={() => toggleDataSelection('personalInfo')}
                color="#0066CC"
              />
            </View>
            
            <View style={styles.optionContainer}>
              <Text>Allergies ({medicalInfo.allergies?.length || 0})</Text>
              <Switch
                value={selectedData.allergies}
                onValueChange={() => toggleDataSelection('allergies')}
                color="#0066CC"
              />
            </View>
            
            <View style={styles.optionContainer}>
              <Text>Medications ({medicalInfo.medications?.length || 0})</Text>
              <Switch
                value={selectedData.medications}
                onValueChange={() => toggleDataSelection('medications')}
                color="#0066CC"
              />
            </View>
            
            <View style={styles.optionContainer}>
              <Text>Medical Conditions ({medicalInfo.conditions?.length || 0})</Text>
              <Switch
                value={selectedData.conditions}
                onValueChange={() => toggleDataSelection('conditions')}
                color="#0066CC"
              />
            </View>
            
            <View style={styles.optionContainer}>
              <Text>Emergency Contacts ({medicalInfo.emergencyContacts?.length || 0})</Text>
              <Switch
                value={selectedData.emergencyContacts}
                onValueChange={() => toggleDataSelection('emergencyContacts')}
                color="#0066CC"
              />
            </View>
            
            <View style={styles.optionContainer}>
              <Text>Include Documents</Text>
              <Switch
                value={selectedData.documents}
                onValueChange={() => toggleDataSelection('documents')}
                color="#0066CC"
              />
            </View>
            
            {selectedData.documents && (
              <Card style={styles.documentsCard}>
                <Card.Content>
                  <Text style={styles.documentsTitle}>Select Documents to Share</Text>
                  
                  <Text style={styles.documentsNote}>
                    No documents available. Upload documents in the Documents section.
                  </Text>
                </Card.Content>
              </Card>
            )}
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Access Expiry Time</Text>
            
            <RadioButton.Group onValueChange={setExpiryPeriod} value={expiryPeriod}>
              <View style={styles.radioOption}>
                <RadioButton value="1" color="#0066CC" />
                <Text>1 hour</Text>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="24" color="#0066CC" />
                <Text>24 hours</Text>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="72" color="#0066CC" />
                <Text>3 days</Text>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="168" color="#0066CC" />
                <Text>1 week</Text>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>
        
        <ShareQRCode 
          userId={user?.uid}
          dataToShare={prepareDataToShare()}
          sharingPeriod={parseInt(expiryPeriod)}
        />
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
  noDataContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  addInfoButton: {
    backgroundColor: '#0066CC',
  },
  card: {
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  divider: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0066CC',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  documentsCard: {
    marginTop: 10,
    marginBottom: 5,
    elevation: 0,
    backgroundColor: '#f9f9f9',
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  documentsNote: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default ShareScreen; 