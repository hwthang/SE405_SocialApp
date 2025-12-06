// import { Ionicons } from "@expo/vector-icons";
// import React, { useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import EmojiSelector from "react-native-emoji-selector";

// type InputBarProps = {
//   value: string;
//   onChange: (text: string) => void;
//   onSend: () => void;
//   onTyping?: (isTyping: boolean) => void;
//   onSendImage: () => void;
//   onRecordVoice: () => void;
// };

// const InputBar = ({
//   value,
//   onChange,
//   onSend,
//   onTyping,
//   onSendImage,
//   onRecordVoice,
// }: InputBarProps) => {
//   const [openPanel, setOpenPanel] = useState(false);
//   const [openEmoji, setOpenEmoji] = useState(false);

//   const togglePanel = () => {
//     setOpenPanel((prev) => !prev);
//     setOpenEmoji(false);
//   };

//   const toggleEmoji = () => {
//     setOpenEmoji((prev) => !prev);
//     setOpenPanel(false);
//   };

//   const hasText = value?.trim().length > 0;

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//     >
//       <View style={{ backgroundColor: "white" }}>

//         {/* 📌 EMOJI PICKER */}
//         {openEmoji && (
//           <View style={{ height: 250 }}>
//             <EmojiSelector
//               onEmojiSelected={(emoji: string) => onChange(value + emoji)}
//               showTabs
//               showHistory
//               showSearchBar={false}
//               columns={9}
//             />
//           </View>
//         )}

//         {/* 📌 PANEL OPTION */}
//         {openPanel && (
//           <View
//             style={{
//               flexDirection: "row",
//               padding: 15,
//               gap: 30,
//               justifyContent: "center",
//               borderTopColor: "#ddd",
//               borderTopWidth: 1,
//             }}
//           >
//             <TouchableOpacity onPress={onSendImage}>
//               <Ionicons name="image-outline" size={34} color="#ff4f9a" />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={onRecordVoice}>
//               <Ionicons name="mic-outline" size={34} color="#ff4f9a" />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={toggleEmoji}>
//               <Ionicons name="happy-outline" size={34} color="#ff4f9a" />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* 📌 INPUT */}
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingHorizontal: 10,
//             paddingVertical: 8,
//             borderTopWidth: 1,
//             borderColor: "#ddd",
//           }}
//         >
//           <TouchableOpacity onPress={togglePanel}>
//             <Ionicons
//               name={openPanel ? "close" : "add-circle-outline"}
//               size={30}
//               color="#ff4f9a"
//             />
//           </TouchableOpacity>

//           <TextInput
//             value={value}
//             multiline
//             onChangeText={(text) => {
//               onChange(text);
//               onTyping?.(true);
//               setTimeout(() => onTyping?.(false), 1200);
//             }}
//             placeholder="Aa"
//             style={{
//               flex: 1,
//               fontSize: 16,
//               paddingHorizontal: 14,
//               marginHorizontal: 10,
//               backgroundColor: "#f1f1f1",
//               borderRadius: 25,
//               maxHeight: 100,
//             }}
//             onFocus={() => {
//               setOpenPanel(false);
//               setOpenEmoji(false);
//             }}
//           />

//           <TouchableOpacity
//             onPress={() => {
//               if (hasText) onSend();
//               setOpenPanel(false);
//               setOpenEmoji(false);
//             }}
//           >
//             <Ionicons
//               name={hasText ? "send" : "mic-outline"}
//               size={28}
//               color="#ff4f9a"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default InputBar;

// component/message/InputBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";

export type InputBarProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  onTyping?: (isTyping: boolean) => void;
  onSendImage: (uri: string) => void;
  onRecordVoice: (uri: string) => void; // nhận uri file âm thanh
};

const InputBar = ({
  value,
  onChange,
  onSend,
  onTyping,
  onSendImage,
  onRecordVoice,
}: InputBarProps) => {
  const [openPanel, setOpenPanel] = useState(false);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStartAt, setRecordStartAt] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);

  useEffect(() => {
    return () => {
      // cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const togglePanel = () => {
    setOpenPanel((prev) => !prev);
    setOpenEmoji(false);
  };

  const toggleEmoji = () => {
    setOpenEmoji((prev) => !prev);
    setOpenPanel(false);
  };

  const hasText = (value || "").trim().length > 0;

  /* ===== BẮT ĐẦU GHI ===== */
  const startRecording = async () => {
    try {
      // nếu đang ghi thì ignore
      if (isRecording) return;

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Vui lòng cấp quyền micro để ghi âm");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordStartAt(Date.now());
      setRecordDuration(0);

      // start simple timer to show duration (optional)
      timerRef.current = setInterval(() => {
        if (recordStartAt) {
          setRecordDuration(Math.floor((Date.now() - recordStartAt) / 1000));
        } else {
          setRecordDuration((d) => d + 1);
        }
      }, 500) as unknown as number;
    } catch (err) {
      console.error("startRecording error", err);
      setIsRecording(false);
    }
  };

  /* ===== DỪNG GHI & GỬI ===== */
  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordStartAt(null);
      setRecordDuration(0);

      setRecording(null);

      if (uri) {
        // gọi callback cha
        onRecordVoice(uri);
      }
    } catch (err) {
      console.error("stopRecording error", err);
    }
  };

  /* ===== CHỌN ẢNH ===== */
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      // SDK mới trả về { canceled: boolean, assets: [...] }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSendImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("pickImage error", err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={{ backgroundColor: "white" }}>
        {/* EMOJI PICKER */}
        {openEmoji && (
          <View style={{ height: 250 }}>
            <EmojiSelector
              onEmojiSelected={(emoji: string) => onChange((value || "") + emoji)}
              showTabs
              showHistory
              showSearchBar={false}
              columns={9}
            />
          </View>
        )}

        {/* PANEL OPTION */}
        {openPanel && (
          <View
            style={{
              flexDirection: "row",
              padding: 15,
              gap: 30,
              justifyContent: "center",
              borderTopColor: "#ddd",
              borderTopWidth: 1,
            }}
          >
            <TouchableOpacity onPress={pickImage}>
              <Ionicons name="image-outline" size={34} color="#ff4f9a" />
            </TouchableOpacity>

            {!isRecording ? (
              <TouchableOpacity onPress={startRecording}>
                <Ionicons name="mic-outline" size={34} color="#ff4f9a" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={stopRecording}>
                <Ionicons name="stop-circle" size={34} color="red" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={toggleEmoji}>
              <Ionicons name="happy-outline" size={34} color="#ff4f9a" />
            </TouchableOpacity>
          </View>
        )}

        {/* RECORDING STATUS BAR */}
        {isRecording && (
          <View
            style={{
              padding: 12,
              backgroundColor: "#ffe3e3",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "red", fontWeight: "bold" }}>
              🎙️ Đang ghi âm... {recordDuration}s
            </Text>
          </View>
        )}

        {/* INPUT ROW */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <TouchableOpacity onPress={togglePanel} style={{ paddingRight: 8 }}>
            <Ionicons
              name={openPanel ? "close" : "add-circle-outline"}
              size={30}
              color="#ff4f9a"
            />
          </TouchableOpacity>

          <TextInput
            value={value}
            multiline
            onChangeText={(text) => {
              onChange(text);
              onTyping?.(true);
              setTimeout(() => onTyping?.(false), 1200);
            }}
            placeholder="Aa"
            style={{
              flex: 1,
              fontSize: 16,
              paddingHorizontal: 14,
              marginHorizontal: 10,
              backgroundColor: "#f1f1f1",
              borderRadius: 25,
              maxHeight: 100,
            }}
            onFocus={() => {
              setOpenPanel(false);
              setOpenEmoji(false);
            }}
          />

          {/* BUTTON: nếu đang ghi thì show stop, nếu có text show send, nếu không có text show mic (bắt đầu ghi) */}
          <TouchableOpacity
            onPress={() => {
              if (isRecording) {
                // nếu đang ghi ở bất kỳ đâu thì stop
                stopRecording();
              } else if (hasText) {
                onSend();
              } else {
                // start recording directly from input
                startRecording();
              }
              setOpenPanel(false);
              setOpenEmoji(false);
            }}
          >
            <Ionicons
              name={isRecording ? "stop-circle" : hasText ? "send" : "mic-outline"}
              size={28}
              color={isRecording ? "red" : "#ff4f9a"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputBar;
