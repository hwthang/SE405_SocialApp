import PostItem from "@/component/post/PostItem";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  const [postItems, setPostItems] = useState([]);
  const fetchPostItems = async (params: any) => {
    console.log("Fetch post items");
  };

  useEffect(() => {
    fetchPostItems({});
  }, []);
  return (
    <View style={{ backgroundColor: "white", flex: 1, paddingTop: 20, paddingBottom:100 }}>
      <FlatList
        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        renderItem={(item) => <PostItem />}
       
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
