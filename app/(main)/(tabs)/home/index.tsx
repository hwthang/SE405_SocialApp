import PostItem from "@/component/post/PostItem";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  const [postItems, setPostItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPostItems = useCallback(async () => {
    try {
      setLoading(true);

      const api = Api.getInstance();
      const auth = AuthHelper.getInstance();
      const token = await auth.getAccessToken();

      const response = await fetch(`${api.baseUrl}/posts/feed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setPostItems(result.data || []);
      } else {
        console.log("Fetch posts failed", result);
      }
    } catch (error) {
      console.log("Fetch posts error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostItems();
  }, [fetchPostItems]);

//   useEffect(() => {
//   SocketHelper.connect();
// }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={postItems}
        style={{backgroundColor:'#f0f0f0ff'}}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        showsVerticalScrollIndicator={false}
        /** 🔽 PULL TO REFRESH */
        refreshing={loading}
        onRefresh={()=>fetchPostItems()}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: 0,
  },
});
