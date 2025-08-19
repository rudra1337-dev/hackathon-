import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { saveEmergencyData } from './storage';

// Save medical information
export const saveMedicalInfo = async (userId, medicalInfo) => {
  try {
    const medicalDocRef = doc(db, 'medicalInfo', userId);
    await setDoc(medicalDocRef, {
      ...medicalInfo,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    // Update emergency data if emergency info is included
    if (medicalInfo.emergencyInfo) {
      await saveEmergencyData(medicalInfo.emergencyInfo);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving medical info:', error);
    return { success: false, error: error.message };
  }
};

// Get medical information
export const getMedicalInfo = async (userId) => {
  try {
    const medicalDocRef = doc(db, 'medicalInfo', userId);
    const medicalDoc = await getDoc(medicalDocRef);
    
    if (medicalDoc.exists()) {
      return { success: true, data: medicalDoc.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting medical info:', error);
    return { success: false, error: error.message };
  }
};

// Upload medical document
export const uploadMedicalDocument = async (userId, file, documentInfo) => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `documents/${userId}/${file.name}`);
    
    // Convert file to blob
    const response = await fetch(file.uri);
    const blob = await response.blob();
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Save document metadata to Firestore
    const documentRef = doc(db, 'users', userId, 'documents', new Date().getTime().toString());
    await setDoc(documentRef, {
      fileName: file.name,
      fileType: file.mimeType || 'application/octet-stream',
      fileSize: file.size,
      downloadURL,
      description: documentInfo.description || '',
      documentType: documentInfo.documentType || 'Other',
      uploadDate: new Date().toISOString()
    });
    
    return { success: true, documentId: documentRef.id, downloadURL };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: error.message };
  }
};

// Delete medical document
export const deleteMedicalDocument = async (userId, documentId, fileName) => {
  try {
    // Delete file from storage
    const storageRef = ref(storage, `documents/${userId}/${fileName}`);
    await deleteObject(storageRef);
    
    // Delete metadata from Firestore
    const documentRef = doc(db, 'users', userId, 'documents', documentId);
    await deleteDoc(documentRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }
};

// Generate a temporary sharing link
export const generateSharingLink = async (userId, shareData, expiryTime = 24) => {
  try {
    // Create a unique sharing ID
    const sharingId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save sharing data to Firestore
    const sharingRef = doc(db, 'sharing', sharingId);
    
    // Calculate expiry time (default: 24 hours)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryTime);
    
    await setDoc(sharingRef, {
      userId,
      data: shareData,
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate.toISOString(),
      accessCount: 0
    });
    
    return { 
      success: true, 
      sharingId,
      expiresAt: expiryDate.toISOString()
    };
  } catch (error) {
    console.error('Error generating sharing link:', error);
    return { success: false, error: error.message };
  }
}; 