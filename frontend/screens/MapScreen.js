import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";

const GymMapScreen = () => {
  const [location, setLocation] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [gymDetails, setGymDetails] = useState(null);

  const oamkCoords = { latitude: 65.0592, longitude: 25.4661 };

  useEffect(() => {
    setLocation(oamkCoords);
  }, []);

  useEffect(() => {
    if (location) {
      fetchGyms();
    }
  }, [location]);

  const fetchGyms = async () => {
    try {
      const overpassQuery = `
        [out:json];
        (
          node["leisure"="fitness_centre"](around:15000, ${location?.latitude || oamkCoords.latitude}, ${location?.longitude || oamkCoords.longitude});
          node["sport"="gym"](around:15000, ${location?.latitude || oamkCoords.latitude}, ${location?.longitude || oamkCoords.longitude});
          node["amenity"="gym"](around:15000, ${location?.latitude || oamkCoords.latitude}, ${location?.longitude || oamkCoords.longitude});
        );
        out body;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
      const data = await response.json();

      if (data.elements) {
        const gymsList = data.elements
          .map((item) => ({
            id: item.id,
            name: item.tags?.name || "Unknown Gym",
            latitude: item.lat,
            longitude: item.lon,
            address: `${item.tags?.["addr:street"] || ''} ${item.tags?.["addr:housenumber"] || ''}, ${item.tags?.["addr:city"] || ''}, ${item.tags?.["addr:postcode"] || ''}`,
            phone: item.tags?.phone || "No phone available",
            website: item.tags?.website || null,
            wikidata: item.tags?.wikidata || null,
          }))
          .filter(Boolean);

        setGyms(gymsList);
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
    }
  };

  const fetchGymDetails = async (gym) => {
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gym.latitude}&lon=${gym.longitude}`
      );
      const geoData = await geoResponse.json();

      setGymDetails({
        name: gym.name,
        address: geoData.display_name || "No address available",
        phone: gym.phone || "No phone available",
        website: gym.website || null,
        wikidata: gym.wikidata ? `https://www.wikidata.org/wiki/${gym.wikidata}` : null,
      });
    } catch (error) {
      console.error("Error fetching gym details:", error);
    }
  };

  const handleGymPress = (gym) => {
    if (selectedGym?.id === gym.id) {
      setSelectedGym(null);
      setGymDetails(null);
    } else {
      setSelectedGym(gym);
      fetchGymDetails(gym);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || oamkCoords.latitude,
          longitude: location?.longitude || oamkCoords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {gyms.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
            title={gym.name}
            onPress={() => handleGymPress(gym)}
          />
        ))}
      </MapView>

      <ScrollView style={styles.listContainer}>
        <Text style={styles.listHeader}>Gyms nearby:</Text>
        <FlatList
          data={gyms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.gymName} onPress={() => handleGymPress(item)}>
                {item.name}
              </Text>
            </View>
          )}
        />
      </ScrollView>

      {gymDetails && selectedGym && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsHeader}>Gym Details</Text>
          <Text style={styles.detailsText}>Name: {gymDetails.name}</Text>
          <Text style={styles.detailsText}>Address: {gymDetails.address}</Text>
          <Text style={styles.detailsText}>Phone: {gymDetails.phone}</Text>
          {gymDetails.website && (
            <Text style={styles.detailsText}>Website: {gymDetails.website}</Text>
          )}
          {gymDetails.wikidata && (
            <Text style={styles.detailsText}>More Info: {gymDetails.wikidata}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "60%" },
  listContainer: { flex: 1, backgroundColor: "#fff", padding: 10 },
  listHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  listItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  gymName: { fontSize: 16, color: "#007AFF" },
  detailsContainer: { padding: 10, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#ddd" },
  detailsHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  detailsText: { fontSize: 14, marginBottom: 5 },
});

export default GymMapScreen;
