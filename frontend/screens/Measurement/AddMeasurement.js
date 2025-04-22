import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from 'expo-datepicker';
import { auth, db } from '../../backend/config';
import { addDoc, collection } from 'firebase/firestore';

export default function AddMeasurement({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [data, setData] = useState({
    Chest: '', Waist: '', Hip: '', Shoulder: '', Thigh: '', Calf: ''
  });

  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User is not authenticated.');
      return;
    }

    const userId = user.uid;

    try {
      await addDoc(collection(db, 'measurements'), {
        userId, // ✅ attach user ID safely
        date: date.toISOString().split('T')[0],
        data
      });

      Alert.alert(
        'Success',
        'Measurement saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MeasurementHistory')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurement.');
      console.error('Save error:', error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Measurement</Text>

      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>📅 {date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {Object.keys(data).map((key) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.label}>{key}</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            placeholder="cm"
            onChangeText={(value) => handleChange(key, value)}
            value={data[key]}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  dateButton: {
    backgroundColor: '#EEE1DC', padding: 12, borderRadius: 10, marginBottom: 20
  },
  dateText: { fontSize: 16, color: '#5E4740' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: '#D5C4B8', borderRadius: 8, padding: 10, marginTop: 4
  },
  saveButton: {
    backgroundColor: '#7D5A50', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center'
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
