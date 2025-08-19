import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, List, Divider } from 'react-native-paper';

const EmergencyCard = ({ emergencyData }) => {
  // Destructure emergency data with defaults
  const {
    fullName = 'Not provided',
    bloodType = 'Not provided',
    allergies = [],
    medications = [],
    conditions = [],
    emergencyContacts = [],
    organDonor = false,
    dateOfBirth = 'Not provided',
    weight = 'Not provided',
    height = 'Not provided'
  } = emergencyData || {};

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>{fullName}</Title>
        
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Blood Type</Text>
            <Text style={styles.value}>{bloodType}</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{dateOfBirth}</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>{height}</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{weight}</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Organ Donor</Text>
            <Text style={styles.value}>{organDonor ? 'Yes' : 'No'}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Allergies</Text>
        {allergies.length > 0 ? (
          allergies.map((allergy, index) => (
            <List.Item
              key={`allergy-${index}`}
              title={allergy.name}
              description={allergy.severity}
              left={props => <List.Icon {...props} icon="alert-circle" color="#FF4500" />}
            />
          ))
        ) : (
          <Text style={styles.noData}>No allergies recorded</Text>
        )}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Current Medications</Text>
        {medications.length > 0 ? (
          medications.map((medication, index) => (
            <List.Item
              key={`medication-${index}`}
              title={medication.name}
              description={`Dosage: ${medication.dosage}`}
              left={props => <List.Icon {...props} icon="pill" color="#0066CC" />}
            />
          ))
        ) : (
          <Text style={styles.noData}>No medications recorded</Text>
        )}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Medical Conditions</Text>
        {conditions.length > 0 ? (
          conditions.map((condition, index) => (
            <List.Item
              key={`condition-${index}`}
              title={condition.name}
              description={condition.diagnosedDate}
              left={props => <List.Icon {...props} icon="hospital" color="#0066CC" />}
            />
          ))
        ) : (
          <Text style={styles.noData}>No conditions recorded</Text>
        )}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {emergencyContacts.length > 0 ? (
          emergencyContacts.map((contact, index) => (
            <List.Item
              key={`contact-${index}`}
              title={contact.name}
              description={`${contact.relationship} • ${contact.phoneNumber}`}
              left={props => <List.Icon {...props} icon="account-alert" color="#0066CC" />}
            />
          ))
        ) : (
          <Text style={styles.noData}>No emergency contacts recorded</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 10,
    elevation: 4,
    borderRadius: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  infoBox: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    margin: 2
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  divider: {
    marginVertical: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0066CC'
  },
  noData: {
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 15,
    marginBottom: 10
  }
});

export default EmergencyCard; 