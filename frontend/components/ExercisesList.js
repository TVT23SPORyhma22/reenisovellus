import React, { useState, useEffect } from 'react';
import {View,Text,FlatList,StyleSheet,TouchableOpacity,Alert,} from 'react-native';
import { db, auth } from '../backend/config';
import {collection,query,where, orderBy, onSnapshot,deleteDoc,doc,} from 'firebase/firestore';

const ExercisesList = ({ translations }) => {
  const [exercises, setExercises] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'exercises'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')); // lajittelu luontiajankohdan mukaan
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userExercises = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExercises(userExercises);
    });

    return () => unsubscribe();
  }, []);

  const toggleDeleteMode = async () => {
    if (isDeleting) {
      try {
        await Promise.all(
          selectedExercises.map(async (id) => {
            await deleteDoc(doc(db, 'exercises', id));
          })
        );
        Alert.alert('Success', 'Selected exercises deleted.');
      } catch (error) {
        console.error('Error deleting exercises:', error);
        Alert.alert('Error', 'Failed to delete selected exercises.');
      }
      setSelectedExercises([]);
    }
    setIsDeleting(!isDeleting);
  };

  const toggleSelection = (exerciseId) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter((id) => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subTitle}>Treenit</Text>

      <FlatList
        data={exercises.filter((ex) => ex !== undefined && ex !== null)}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => {
          const isSelected = selectedExercises.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.listItem, isSelected && styles.selectedItem]}
              onPress={() => isDeleting && toggleSelection(item.id)}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>
                  {translations[item.exerciseId] || item.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {[
                    item.sets ? `Sets: ${item.sets}` : null,
                    item.reps ? `Reps: ${item.reps}` : null,
                    item.weight ? `Weight: ${item.weight} kg` : null,
                  ]
                    .filter(Boolean) // filtteröi tyhjät arvot
                    .join(' | ')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {exercises.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={toggleDeleteMode}>
          <Text style={styles.deleteButtonText}>
            {isDeleting ? 'Confirmaatio nappi' : 'Poista'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c3e50',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  selectedItem: {
    backgroundColor: '#ffdddd',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExercisesList;