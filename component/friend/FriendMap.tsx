import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Camera, Circle, Marker } from "react-native-maps";
import MarkerAvatar from "./MarkerAvatar";

type Coordinate = { latitude: number; longitude: number };

type FriendMapProps = {
  centerCoordinate?: Coordinate; // vị trí muốn center
};

const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Mock 20 người
const generateMockData = (currentLocation: Coordinate) => {
  const friends: any[] = [];
  const nearby: any[] = [];

  for (let i = 1; i <= 10; i++) {
    const latOffset = Math.random() * 0.004 - 0.002;
    const lonOffset = Math.random() * 0.004 - 0.002;
    friends.push({
      id: i,
      name: `Bạn ${i}`,
      avatar: `https://i.pravatar.cc/150?img=${i}`,
      coordinate: { latitude: currentLocation.latitude + latOffset, longitude: currentLocation.longitude + lonOffset },
    });
  }

  for (let i = 11; i <= 20; i++) {
    const latOffset = Math.random() * 0.004 - 0.002;
    const lonOffset = Math.random() * 0.004 - 0.002;
    nearby.push({
      id: i,
      name: `Nearby ${i}`,
      avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
      coordinate: { latitude: currentLocation.latitude + latOffset, longitude: currentLocation.longitude + lonOffset },
    });
  }

  return { friends, nearby };
};

const FriendMap = ({ centerCoordinate }: FriendMapProps) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [data, setData] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      const current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(current);

      const { friends } = generateMockData(current); // Chỉ lấy friends

      // Gán type friend_nearby nếu trong vòng 200m
      const mapData = friends.map(f => {
        const distance = getDistanceMeters(
          current.latitude,
          current.longitude,
          f.coordinate.latitude,
          f.coordinate.longitude
        );
        return { ...f, type: distance <= 200 ? 'friend_nearby' : 'friend', distance };
      });

      setData(mapData);
    })();
  }, []);

  // Center map khi centerCoordinate thay đổi
  useEffect(() => {
    if (centerCoordinate && mapRef.current) {
      mapRef.current.animateCamera({
        center: centerCoordinate,
        zoom: 16,
      } as Camera, { duration: 500 });
    }
  }, [centerCoordinate]);

  if (!currentLocation) return null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Vòng tròn 200m */}
        <Circle
          center={currentLocation}
          radius={200}
          strokeColor="rgba(0,122,255,0.5)"
          fillColor="rgba(0,122,255,0.2)"
        />

        {/* Marker chỉ cho bạn bè */}
        {data.map(item => (
          <Marker key={item.id} coordinate={item.coordinate} anchor={{ x: 0.5, y: 0.5 }}>
            <MarkerAvatar avatar={item.avatar} type={item.type} />
          </Marker>
        ))}

        {/* Marker vị trí hiện tại */}
        <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }} pinColor="blue" />
      </MapView>
    </View>
  );
};

export default FriendMap;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, marginBottom: 100 },
});
