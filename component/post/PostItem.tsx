import React from "react";
import { StyleSheet, View } from "react-native";
import PostActionBar from "./PostActionBar";
import PostCaption from "./PostCaption";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";

const PostItem = () => {
  return (
    <View
      style={{
        borderWidth: 0,
        marginBottom: 20,
        elevation: 0.5,
       
     
      }}
    >
      <View style={{ borderWidth: 0,  padding: 10, }}>
        <PostHeader />
      </View>
      <View style={{ borderWidth: 0, gap: 10 }}>
        <PostCaption text="Hôm nay là một ngày thật kỳ lạ. Mình đi dạo một vòng thành phố, nghe vài bài nhạc cũ, uống ly cà phê đen quen thuộc, vậy mà cảm xúc lại khác hẳn mọi khi. Có những khoảnh khắc rất nhỏ thôi, như ánh nắng chiếu xuống con đường, hay tiếng gió lướt qua hàng cây, cũng đủ làm mình thấy lòng nhẹ hơn. Có lẽ chúng ta hay mải chạy theo những điều lớn lao mà quên mất rằng bình yên thật ra đến từ những điều rất giản dị. Chỉ cần chậm lại một chút, nhìn xung quanh một chút, là mọi thứ đã khác rồi.
"/>

        <PostMedia />
      </View>
      <View style={{ borderWidth: 0,  padding: 10, }}>
        <PostActionBar />
      </View>
    </View>
  );
};

export default PostItem;

const styles = StyleSheet.create({});
