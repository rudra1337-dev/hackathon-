import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Portal, Dialog, TextInput, Snackbar } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { getSecurely } from '../utils/storage';
import DocumentList from '../components/DocumentList';
import { uploadMedicalDocument, deleteMedicalDocument } from '../utils/medicalData';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const DocumentsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load user data and documents
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userSession = await getSecurely('user_session');
        
        if (!userSession) {
          // Not logged in, redirect to login
          navigation.replace('Login');
          return;
        }
        
        setUser(userSession);
        await loadDocuments(userSession.uid);
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigation]);

  // Load documents from Firestore
  const loadDocuments = async (userId) => {
    try {
      const documentsRef = collection(db, 'users', userId, 'documents');
      const q = query(documentsRef);
      const querySnapshot = await getDocs(q);
      
      const documentsData = [];
      querySnapshot.forEach((doc) => {
        documentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading documents:', error);
      showSnackbar('Error loading documents');
    }
  };

  // Show snackbar with message
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Handle picking a document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setVisible(true);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showSnackbar('Error selecting document');
    }
  };

  // Handle uploading a document
  const uploadDocument = async () => {
    if (!selectedFile || !documentType) {
      Alert.alert('Please select a document type');
      return;
    }
    
    setUploading(true);
    
    try {
      const result = await uploadMedicalDocument(user.uid, selectedFile, {
        documentType,
        description
      });
      
      if (result.success) {
        showSnackbar('Document uploaded successfully');
        // Reset form
        setVisible(false);
        setDocumentType('');
        setDescription('');
        setSelectedFile(null);
        // Reload documents
        await loadDocuments(user.uid);
      } else {
        showSnackbar('Failed to upload document: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      showSnackbar('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  // Handle deleting a document
  const deleteDocument = async (document) => {
    try {
      Alert.alert(
        'Delete Document',
        'Are you sure you want to delete this document?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              const result = await deleteMedicalDocument(user.uid, document.id, document.fileName);
              
              if (result.success) {
                showSnackbar('Document deleted successfully');
                // Reload documents
                await loadDocuments(user.uid);
              } else {
                showSnackbar('Failed to delete document: ' + result.error);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting document:', error);
      showSnackbar('Error deleting document');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Medical Documents</Text>
          <Button 
            mode="contained" 
            icon="upload"
            onPress={pickDocument}
            style={styles.uploadButton}
          >
            Upload Document
          </Button>
        </View>
        
        <DocumentList 
          documents={documents} 
          onDelete={deleteDocument} 
        />
      </ScrollView>
      
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Document Details</Dialog.Title>
          <Dialog.Content>
            {selectedFile && (
              <Text style={styles.fileName}>
                File: {selectedFile.name}
              </Text>
            )}
            
            <TextInput
              label="Document Type"
              value={documentType}
              onChangeText={setDocumentType}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Prescription, Lab Report, X-Ray, Medical Summary"
            />
            
            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={uploadDocument} loading={uploading} disabled={uploading}>
              Upload
            </Button>
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
  content: {
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
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#0066CC',
  },
  fileName: {
    marginBottom: 15,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 15,
  },
});

export default DocumentsScreen; 