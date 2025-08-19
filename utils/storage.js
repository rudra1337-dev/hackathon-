import * as SecureStore from 'expo-secure-store';

// Save data securely
export const saveSecurely = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving data securely:', error);
    return false;
  }
};

// Get securely stored data
export const getSecurely = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting secure data:', error);
    return null;
  }
};

// Delete securely stored data
export const deleteSecurely = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error('Error deleting secure data:', error);
    return false;
  }
};

// Save emergency data (this is NOT secure as it needs to be accessible without authentication)
export const saveEmergencyData = async (data) => {
  try {
    await SecureStore.setItemAsync('emergency_data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving emergency data:', error);
    return false;
  }
};

// Get emergency data
export const getEmergencyData = async () => {
  try {
    const data = await SecureStore.getItemAsync('emergency_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting emergency data:', error);
    return null;
  }
}; 