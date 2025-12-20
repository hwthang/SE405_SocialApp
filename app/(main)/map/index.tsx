import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import FriendMap from "@/component/friend/FriendMap";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";

/* ================== TYPES ================== */

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

/* ================== CONFIG ================== */

const DEFAULT_RADIUS = 200; // meters

/* ================== UTILS ================== */

const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/* ================== SCREEN ================== */

const FriendMapScreen = () => {
  const params = useLocalSearchParams();

  /* ---------- STATE ---------- */
  const [myLocation, setMyLocation] = useState<Coordinate | null>(null);
  const [friends, setFriends] = useState<FriendMarker[]>([]);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [loading, setLoading] = useState(true);

  /* ================== GPS ================== */

  const getMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const current = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setMyLocation(current);
    return current;
  };

  /* ================== SHARE LOCATION ================== */

  const shareMyLocation = async (location: Coordinate) => {
    try {
      const response = await fetch(
        `${Api.getInstance().baseUrl}/location/me`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
          },
          body: JSON.stringify({
            lat: location.latitude,
            lng: location.longitude,
            sharingEnabled: true,
          }),
        }
      );

      const result = await response.json();
      console.log("📡 Share location result:", result);
    } catch (error) {
      console.error("❌ shareMyLocation error:", error);
    }
  };

  /* ================== FETCH FRIENDS ================== */

  const fetchFriends = async (current: Coordinate) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${Api.getInstance().baseUrl}/location/nearby?radiusKm=${
          radius / 1000
        }`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
          },
        }
      );

      const result = await response.json();
      console.log("📦 Nearby friends raw:", result);

      const apiData = result?.data ?? [];

      const mapped: FriendMarker[] = apiData.map((item: any) => {
        const distance = getDistanceMeters(
          current.latitude,
          current.longitude,
          item.lat,
          item.lng
        );

        return {
          id: item.userId,
          name: item.name,
          avatar: item.avatarUrl,
          coordinate: {
            latitude: item.lat,
            longitude: item.lng,
          },
          distance,
          type: distance <= radius ? "friend_nearby" : "friend",
        };
      });

      setFriends(mapped);
    } catch (error) {
      console.error("❌ fetchFriends error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================== EFFECTS ================== */

  // Init GPS
  useEffect(() => {
    getMyLocation();
  }, []);

  // Khi có location hoặc đổi radius
  useEffect(() => {
    if (!myLocation) return;

    shareMyLocation(myLocation);
    fetchFriends(myLocation);
  }, [myLocation, radius]);

  /* ================== CENTER MAP FROM ROUTE ================== */

  const centerCoordinate = useMemo(() => {
    const lat = parseFloat(params.lat as string);
    const lng = parseFloat(params.lng as string);

    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }

    return undefined;
  }, [params.lat, params.lng]);

  /* ================== RENDER ================== */

  if (!myLocation) return null;

  return (
    <View style={{ flex: 1 }}>
      <FriendMap
        myLocation={myLocation}
        friends={friends}
        radius={radius}
        centerCoordinate={centerCoordinate}
        loading={loading}
      />
    </View>
  );
};

export default FriendMapScreen;
