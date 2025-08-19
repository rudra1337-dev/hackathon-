import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { List, Card, Title, Text, Button, Divider, IconButton } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const DocumentList = ({ documents, onDelete }) => {
  // Function to open a document
  const openDocument = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Cannot open this document URL");
      }
    } catch (error) {
      console.error("Error opening document:", error);
      alert("Failed to open document");
    }
  };
  
  // Function to download a document
  const downloadDocument = async (document) => {
    try {
      // Create a local file path in the cache directory
      const fileUri = `${FileSystem.cacheDirectory}${document.fileName}`;
      
      // Download the file
      const downloadResult = await FileSystem.downloadAsync(
        document.downloadURL,
        fileUri
      );
      
      if (downloadResult.status === 200) {
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          alert("Sharing is not available on this device");
        }
      } else {
        alert("Failed to download document");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document");
    }
  };
  
  // Helper function to get icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'file-pdf-box';
    if (fileType.includes('image')) return 'file-image';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-word';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'file-excel';
    return 'file-document';
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (!documents || documents.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Card.Content>
          <Text style={styles.emptyText}>No documents uploaded yet</Text>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <View style={styles.container}>
      {documents.map((document, index) => (
        <Card key={document.id || index} style={styles.documentCard}>
          <TouchableOpacity onPress={() => openDocument(document.downloadURL)}>
            <Card.Content>
              <View style={styles.documentHeader}>
                <List.Icon icon={getFileIcon(document.fileType)} />
                <View style={styles.documentInfo}>
                  <Title style={styles.documentTitle}>{document.fileName}</Title>
                  <Text style={styles.documentType}>{document.documentType}</Text>
                  <Text style={styles.documentMeta}>
                    {formatFileSize(document.fileSize)} • Uploaded {formatDate(document.uploadDate)}
                  </Text>
                  {document.description && (
                    <Text style={styles.description}>{document.description}</Text>
                  )}
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.actionButtons}>
                <Button 
                  icon="eye" 
                  mode="text"
                  onPress={() => openDocument(document.downloadURL)}
                  style={styles.actionButton}
                >
                  View
                </Button>
                
                <Button 
                  icon="download" 
                  mode="text"
                  onPress={() => downloadDocument(document)}
                  style={styles.actionButton}
                >
                  Download
                </Button>
                
                <Button 
                  icon="delete" 
                  mode="text"
                  onPress={() => onDelete(document)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  Delete
                </Button>
              </View>
            </Card.Content>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10
  },
  documentCard: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  documentInfo: {
    flex: 1
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  documentType: {
    fontSize: 14,
    color: '#0066CC'
  },
  documentMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  description: {
    marginTop: 5,
    fontStyle: 'italic'
  },
  divider: {
    marginVertical: 10
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1
  },
  deleteButton: {
    color: '#B00020'
  },
  emptyCard: {
    margin: 10,
    borderRadius: 8,
    padding: 20
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666'
  }
});

export default DocumentList; 