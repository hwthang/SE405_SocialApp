// FriendMapScreen.tsx
import FriendMap from "@/component/friend/FriendMap";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";

const FriendMapScreen = () => {
  const params = useLocalSearchParams();

  /**
   * Giả sử bạn truyền query:
   * /friend/map?lat=10.123&lng=106.456
   * Hoặc /friend/map?friendId=3
   */

  // Nếu dùng lat/lng trực tiếp từ query
  const centerCoordinate = useMemo(() => {
    const lat = parseFloat(params.lat as string);
    const lng = parseFloat(params.lng as string);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
    return undefined;
  }, [params.lat, params.lng]);

  return <FriendMap centerCoordinate={centerCoordinate} />;
};

export default FriendMapScreen;
