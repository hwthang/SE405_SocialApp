// FriendMap.tsx
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import MapView, { Camera, Circle, Marker } from "react-native-maps";
import MarkerAvatar from "./MarkerAvatar";
// types.ts
export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type FriendMarker = {
  id: number;
  name: string;
  avatar: string;
  coordinate: Coordinate;
  type: "friend" | "friend_nearby";
  distance: number;
};

type FriendMapProps = {
  myLocation: Coordinate;
  friends: FriendMarker[];
  radius: number;
  centerCoordinate?: Coordinate;
  loading: boolean;
};

const FriendMap = ({
  myLocation,
  friends,
  radius,
  centerCoordinate,
  loading,
}: FriendMapProps) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  // Center map
  useEffect(() => {
    if (centerCoordinate && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: centerCoordinate,
          zoom: 16,
        } as Camera,
        { duration: 500 }
      );
    }
  }, [centerCoordinate]);

  // Fade out loading khi xong
  useEffect(() => {
    if (!loading && mapReady) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, mapReady]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onMapReady={() => setMapReady(true)}
      >
        <Circle
          center={myLocation}
          radius={radius}
          strokeColor="rgba(0,122,255,0.5)"
          fillColor="rgba(0,122,255,0.2)"
        />

        {friends.map((f) => (
          <Marker key={f.id} coordinate={f.coordinate}>
            <MarkerAvatar avatar={f.avatar} type={f.type} />
          </Marker>
        ))}

        <Marker coordinate={myLocation} pinColor="blue" />
      </MapView>

      {/* Loading overlay */}
      {(loading || !mapReady) && (
        <Animated.View style={[styles.loading, { opacity }]}>
          <ActivityIndicator size="large" />
        </Animated.View>
      )}
    </View>
  );
};

export default FriendMap;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
