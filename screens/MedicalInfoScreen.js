import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Title, 
  Divider, 
  List, 
  IconButton, 
  Switch,
  Snackbar,
  Portal,
  Dialog,
  Chip
} from 'react-native-paper';
import { getSecurely } from '../utils/storage';
import { getMedicalInfo, saveMedicalInfo } from '../utils/medicalData';

const MedicalInfoScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      bloodType: '',
      height: '',
      weight: '',
      organDonor: false
    },
    emergencyInfo: {
      fullName: '',
      bloodType: '',
      allergies: [],
      medications: [],
      conditions: [],
      emergencyContacts: [],
      organDonor: false,
      dateOfBirth: '',
      weight: '',
      height: ''
    },
    allergies: [],
    medications: [],
    conditions: [],
    emergencyContacts: []
  });
  
  // State for dialog forms
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState(''); 
  const [dialogData, setDialogData] = useState({});
  const [editIndex, setEditIndex] = useState(-1);
  
  // Snackbar
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
          setMedicalInfo(prev => ({
            ...prev,
            ...result.data,
            personalInfo: { ...prev.personalInfo, ...(result.data.personalInfo || {}) },
            emergencyInfo: { ...prev.emergencyInfo, ...(result.data.emergencyInfo || {}) },
            allergies: result.data.allergies || [],
            medications: result.data.medications || [],
            conditions: result.data.conditions || [],
            emergencyContacts: result.data.emergencyContacts || []
          }));
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

  // Helper to show snackbar
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Handle saving all medical information
  const handleSaveMedicalInfo = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      // Update emergency info with relevant data
      const updatedMedicalInfo = {
        ...medicalInfo,
        emergencyInfo: {
          ...medicalInfo.emergencyInfo,
          fullName: medicalInfo.personalInfo.fullName,
          bloodType: medicalInfo.personalInfo.bloodType,
          dateOfBirth: medicalInfo.personalInfo.dateOfBirth,
          weight: medicalInfo.personalInfo.weight,
          height: medicalInfo.personalInfo.height,
          organDonor: medicalInfo.personalInfo.organDonor,
          allergies: medicalInfo.allergies,
          medications: medicalInfo.medications,
          conditions: medicalInfo.conditions,
          emergencyContacts: medicalInfo.emergencyContacts
        }
      };
      
      const result = await saveMedicalInfo(user.uid, updatedMedicalInfo);
      
      if (result.success) {
        showSnackbar('Medical information saved successfully');
        setMedicalInfo(updatedMedicalInfo);
      } else {
        showSnackbar('Failed to save medical information');
      }
    } catch (error) {
      console.error('Error saving medical info:', error);
      showSnackbar('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Handle personal info changes
  const handlePersonalInfoChange = (field, value) => {
    setMedicalInfo(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Open add/edit dialog
  const openDialog = (type, item = null, index = -1) => {
    setDialogType(type);
    setDialogData(item || getEmptyDialogData(type));
    setEditIndex(index);
    setDialogVisible(true);
  };

  // Get empty dialog data based on type
  const getEmptyDialogData = (type) => {
    switch (type) {
      case 'allergy': return { name: '', severity: 'Mild' };
      case 'medication': return { name: '', dosage: '', frequency: '' };
      case 'condition': return { name: '', diagnosedDate: '', notes: '' };
      case 'contact': return { name: '', relationship: '', phoneNumber: '' };
      default: return {};
    }
  };

  // Handle dialog save
  const handleDialogSave = () => {
    const { allergies, medications, conditions, emergencyContacts } = medicalInfo;
    let updated;
    
    switch (dialogType) {
      case 'allergy':
        updated = editIndex >= 0
          ? allergies.map((item, i) => i === editIndex ? dialogData : item)
          : [...allergies, dialogData];
        setMedicalInfo(prev => ({ ...prev, allergies: updated }));
        break;
      case 'medication':
        updated = editIndex >= 0
          ? medications.map((item, i) => i === editIndex ? dialogData : item)
          : [...medications, dialogData];
        setMedicalInfo(prev => ({ ...prev, medications: updated }));
        break;
      case 'condition':
        updated = editIndex >= 0
          ? conditions.map((item, i) => i === editIndex ? dialogData : item)
          : [...conditions, dialogData];
        setMedicalInfo(prev => ({ ...prev, conditions: updated }));
        break;
      case 'contact':
        updated = editIndex >= 0
          ? emergencyContacts.map((item, i) => i === editIndex ? dialogData : item)
          : [...emergencyContacts, dialogData];
        setMedicalInfo(prev => ({ ...prev, emergencyContacts: updated }));
        break;
    }
    
    setDialogVisible(false);
  };

  // Handle item deletion
  const handleDeleteItem = (type, index) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            let updated;
            switch (type) {
              case 'allergy':
                updated = medicalInfo.allergies.filter((_, i) => i !== index);
                setMedicalInfo(prev => ({ ...prev, allergies: updated }));
                break;
              case 'medication':
                updated = medicalInfo.medications.filter((_, i) => i !== index);
                setMedicalInfo(prev => ({ ...prev, medications: updated }));
                break;
              case 'condition':
                updated = medicalInfo.conditions.filter((_, i) => i !== index);
                setMedicalInfo(prev => ({ ...prev, conditions: updated }));
                break;
              case 'contact':
                updated = medicalInfo.emergencyContacts.filter((_, i) => i !== index);
                setMedicalInfo(prev => ({ ...prev, emergencyContacts: updated }));
                break;
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading medical information...</Text>
      </View>
    );
  }

  // Render input section for personal info
  const renderPersonalInfoSection = () => (
    <View style={styles.section}>
      <Title style={styles.sectionTitle}>Personal Information</Title>
      <Divider style={styles.divider} />
      
      <TextInput
        label="Full Name"
        value={medicalInfo.personalInfo.fullName}
        onChangeText={(text) => handlePersonalInfoChange('fullName', text)}
        style={styles.input}
        mode="outlined"
      />
      
      <TextInput
        label="Date of Birth (MM/DD/YYYY)"
        value={medicalInfo.personalInfo.dateOfBirth}
        onChangeText={(text) => handlePersonalInfoChange('dateOfBirth', text)}
        style={styles.input}
        mode="outlined"
      />
      
      <TextInput
        label="Blood Type"
        value={medicalInfo.personalInfo.bloodType}
        onChangeText={(text) => handlePersonalInfoChange('bloodType', text)}
        style={styles.input}
        mode="outlined"
      />
      
      <View style={styles.row}>
        <TextInput
          label="Height (cm)"
          value={medicalInfo.personalInfo.height}
          onChangeText={(text) => handlePersonalInfoChange('height', text)}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          keyboardType="numeric"
        />
        
        <TextInput
          label="Weight (kg)"
          value={medicalInfo.personalInfo.weight}
          onChangeText={(text) => handlePersonalInfoChange('weight', text)}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.switchRow}>
        <Text>Organ Donor</Text>
        <Switch
          value={medicalInfo.personalInfo.organDonor}
          onValueChange={(value) => handlePersonalInfoChange('organDonor', value)}
          color="#0066CC"
        />
      </View>
    </View>
  );

  // Render list section (allergies, medications, conditions, contacts)
  const renderListSection = (title, type, items, icon) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Title style={styles.sectionTitle}>{title}</Title>
        <IconButton icon="plus" size={20} onPress={() => openDialog(type)} />
      </View>
      <Divider style={styles.divider} />
      
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No {title.toLowerCase()} added</Text>
      ) : (
        items.map((item, index) => (
          <List.Item
            key={`${type}-${index}`}
            title={item.name}
            description={
              type === 'allergy' ? `Severity: ${item.severity}` :
              type === 'medication' ? `Dosage: ${item.dosage}, Frequency: ${item.frequency}` :
              type === 'condition' ? `Diagnosed: ${item.diagnosedDate}` :
              `${item.relationship} • ${item.phoneNumber}`
            }
            left={props => <List.Icon {...props} icon={icon} color="#0066CC" />}
            right={props => (
              <View style={styles.itemActions}>
                <IconButton {...props} icon="pencil" onPress={() => openDialog(type, item, index)} />
                <IconButton {...props} icon="delete" onPress={() => handleDeleteItem(type, index)} />
              </View>
            )}
          />
        ))
      )}
    </View>
  );

  // Render dialog content based on type
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'allergy':
        return (
          <>
            <TextInput
              label="Allergy Name"
              value={dialogData.name}
              onChangeText={(text) => setDialogData({...dialogData, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <Text style={styles.chipLabel}>Severity:</Text>
            <View style={styles.chipContainer}>
              {['Mild', 'Moderate', 'Severe'].map(severity => (
                <Chip
                  key={severity}
                  selected={dialogData.severity === severity}
                  onPress={() => setDialogData({...dialogData, severity})}
                  style={styles.chip}
                  selectedColor="#0066CC"
                >
                  {severity}
                </Chip>
              ))}
            </View>
          </>
        );
      case 'medication':
        return (
          <>
            <TextInput
              label="Medication Name"
              value={dialogData.name}
              onChangeText={(text) => setDialogData({...dialogData, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Dosage"
              value={dialogData.dosage}
              onChangeText={(text) => setDialogData({...dialogData, dosage: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Frequency"
              value={dialogData.frequency}
              onChangeText={(text) => setDialogData({...dialogData, frequency: text})}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="e.g., Once daily, Twice daily"
            />
          </>
        );
      case 'condition':
        return (
          <>
            <TextInput
              label="Condition Name"
              value={dialogData.name}
              onChangeText={(text) => setDialogData({...dialogData, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Diagnosed Date"
              value={dialogData.diagnosedDate}
              onChangeText={(text) => setDialogData({...dialogData, diagnosedDate: text})}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="MM/YYYY"
            />
            <TextInput
              label="Notes"
              value={dialogData.notes}
              onChangeText={(text) => setDialogData({...dialogData, notes: text})}
              mode="outlined"
              style={styles.dialogInput}
              multiline
              numberOfLines={3}
            />
          </>
        );
      case 'contact':
        return (
          <>
            <TextInput
              label="Contact Name"
              value={dialogData.name}
              onChangeText={(text) => setDialogData({...dialogData, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Relationship"
              value={dialogData.relationship}
              onChangeText={(text) => setDialogData({...dialogData, relationship: text})}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            <TextInput
              label="Phone Number"
              value={dialogData.phoneNumber}
              onChangeText={(text) => setDialogData({...dialogData, phoneNumber: text})}
              mode="outlined"
              style={styles.dialogInput}
              keyboardType="phone-pad"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderPersonalInfoSection()}
        
        {renderListSection('Allergies', 'allergy', medicalInfo.allergies, 'alert-circle')}
        {renderListSection('Current Medications', 'medication', medicalInfo.medications, 'pill')}
        {renderListSection('Medical Conditions', 'condition', medicalInfo.conditions, 'hospital')}
        {renderListSection('Emergency Contacts', 'contact', medicalInfo.emergencyContacts, 'account-alert')}
        
        <Button
          mode="contained"
          onPress={handleSaveMedicalInfo}
          style={styles.saveButton}
          loading={saving}
          disabled={saving}
        >
          Save Medical Information
        </Button>
      </ScrollView>
      
      {/* Add/Edit Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editIndex >= 0 ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
          </Dialog.Title>
          <Dialog.Content>
            {renderDialogContent()}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDialogSave}>Save</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  divider: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemActions: {
    flexDirection: 'row',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 15,
  },
  saveButton: {
    margin: 20,
    paddingVertical: 8,
    backgroundColor: '#0066CC',
  },
  dialogInput: {
    marginBottom: 10,
  },
  chipLabel: {
    marginTop: 5,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  }
});

export default MedicalInfoScreen; 