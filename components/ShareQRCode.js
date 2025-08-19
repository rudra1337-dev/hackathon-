import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import { generateSharingLink } from '../utils/medicalData';

const ShareQRCode = ({ userId, dataToShare, sharingPeriod = 24 }) => {
  const [loading, setLoading] = useState(false);
  const [sharingInfo, setSharingInfo] = useState(null);
  const [error, setError] = useState(null);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateSharingLink(userId, dataToShare, sharingPeriod);
      
      if (result.success) {
        // Create a shareable link
        const shareableLink = `https://medipass.app/share/${result.sharingId}`;
        
        // Set sharing info
        setSharingInfo({
          sharingId: result.sharingId,
          shareableLink,
          expiresAt: new Date(result.expiresAt).toLocaleString()
        });
      } else {
        setError(result.error || 'Failed to generate sharing link');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const shareQRCode = async () => {
    try {
      // This would normally save the QR code as an image and share it
      // For this demo, we'll just share the link
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(sharingInfo.shareableLink);
      } else {
        setError('Sharing is not available on this device');
      }
    } catch (err) {
      setError(err.message || 'Failed to share QR code');
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Share Medical Information</Title>
        <Text style={styles.subtitle}>
          Generate a QR code that grants temporary access to your selected medical information
        </Text>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        ) : sharingInfo ? (
          <View style={styles.qrContainer}>
            <QRCode
              value={sharingInfo.shareableLink}
              size={200}
              color="#000000"
              backgroundColor="#ffffff"
            />
            <Text style={styles.expiryText}>
              Expires: {sharingInfo.expiresAt}
            </Text>
            <Text style={styles.linkText} selectable>
              {sharingInfo.shareableLink}
            </Text>
            
            <Divider style={styles.divider} />
            
            <Button 
              mode="contained" 
              icon="share" 
              onPress={shareQRCode}
              style={styles.shareButton}
            >
              Share Link/QR Code
            </Button>
            
            <Button 
              mode="outlined" 
              icon="refresh" 
              onPress={generateQRCode}
              style={styles.regenerateButton}
            >
              Generate New Code
            </Button>
          </View>
        ) : (
          <Button 
            mode="contained" 
            icon="qrcode" 
            onPress={generateQRCode}
            style={styles.generateButton}
          >
            Generate QR Code
          </Button>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20
  },
  loader: {
    marginVertical: 30
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  expiryText: {
    marginTop: 15,
    color: '#666',
    fontStyle: 'italic'
  },
  linkText: {
    marginTop: 5,
    color: '#0066CC',
    fontSize: 12
  },
  divider: {
    width: '100%',
    marginVertical: 15
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: '#0066CC'
  },
  shareButton: {
    marginBottom: 10,
    backgroundColor: '#0066CC'
  },
  regenerateButton: {
    borderColor: '#0066CC'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10
  }
});

export default ShareQRCode; 