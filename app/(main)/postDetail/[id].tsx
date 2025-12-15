import PostHeader from "@/component/post/PostHeader";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams();
  useEffect(() => {
    console.log(id);
  }, []);
  return (
    <View>
     <PostHeader author={{name:'Dng Huu Thang',avatarUrl:''}} privacy="PUBLIC" createdAt="2025/12/12"/>
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({});
