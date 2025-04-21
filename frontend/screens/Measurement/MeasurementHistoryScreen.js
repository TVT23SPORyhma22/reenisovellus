import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { auth, db } from '../../backend/config';

export default function MeasurementHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchMeasurements = async () => {
      const user = auth.currentUser;
      if (!user) return;
    
      try {
        const q = query(
          collection(db, 'measurements'),
          where('userId', '==', user.uid) 
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const sorted = items.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(sorted);
      } catch (error) {
        console.error('Error fetching measurements:', error);
        Alert.alert('Error', 'Failed to load measurements');
      }
    };

    if (isFocused) fetchMeasurements();
  }, [isFocused]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  const deleteMeasurement = async (id) => {
    try {
      await deleteDoc(doc(db, 'measurements', id));
      setHistory(history.filter(item => item.id !== id));
      Alert.alert('Deleted', 'Measurement successfully deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the measurement.');
    }
  };

  const handleLongPress = (id) => {
    Alert.alert(
      'Delete measurement?',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteMeasurement(id) }
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('MeasurementDetails', { entry: item })}
      onLongPress={() => handleLongPress(item.id)} 
    >
      <View style={styles.indexCircle}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <View>
        <Text style={styles.title}>Measurement {index + 1} : {formatDate(item.date)}</Text>
        <Text style={styles.subtitle}>
          Waist: {item.data.Waist} cm, Hip: {item.data.Hip} cm
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <Text style={styles.header}>Measurements</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMeasurement')}
      >
        <Ionicons name="add" size={28} color="#7D5A50" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 12 },
  header: { fontSize: 22, fontWeight: 'bold' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  indexCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#D3C3BD',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  indexText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 16, fontWeight: '600', color: '#5E4740' },
  subtitle: { fontSize: 14, color: '#aaa' },
  addButton: {
    position: 'absolute', top: 20, right: 20,
    backgroundColor: '#f5f5f5', width: 36, height: 36,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center'
  }
});
