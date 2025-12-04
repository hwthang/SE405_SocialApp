// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { TextInput, TouchableOpacity, View } from "react-native";

// const InputBar = ({ value, onChange, onSend }: any) => {
//   return (
//     <View
//       style={{
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 10,
//         paddingVertical: 8,
//         backgroundColor: "white",
//         borderTopWidth: 1,
//         borderColor: "#ddd",
//       }}
//     >
//       <TouchableOpacity>
//         <Ionicons name="add-circle-outline" size={28} color="#ff4f9a" />
//       </TouchableOpacity>

//       <TextInput
//         value={value}
//         onChangeText={onChange}
//         placeholder="Aa"
//         style={{
//           flex: 1,
//           fontSize: 16,
//           paddingHorizontal: 12,
//           marginHorizontal: 10,
//           backgroundColor: "#f2f2f2",
//           borderRadius: 20,
//           height: 40,
//         }}
//       />

//       <TouchableOpacity onPress={onSend}>
//         <Ionicons name="send" size={26} color="#ff4f9a" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default InputBar;

// import { Ionicons } from "@expo/vector-icons";
// import React, { useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const InputBar = ({
//   value,
//   onChange,
//   onSend,
//   onTyping,
//   onSendImage,
//   onRecordVoice,
//   onOpenSticker,
// }: any) => {
//   const [openPanel, setOpenPanel] = useState(false);

//   const togglePanel = () => {
//     setOpenPanel(!openPanel);
//   };

//   const hasText = value?.trim().length > 0;

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//     >
//       <View style={{ backgroundColor: "white" }}>

//         {/* PANEL OPTION */}
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

//             <TouchableOpacity onPress={onOpenSticker}>
//               <Ionicons name="happy-outline" size={34} color="#ff4f9a" />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* INPUT */}
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
//               // onTyping(true);
//               // setTimeout(() => onTyping(false), 1500);
//               onTyping?.(true);
//               setTimeout(() => onTyping?.(false), 1500);

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
//           />

//           <TouchableOpacity
//             onPress={() => {
//               if (hasText) onSend();
//               setOpenPanel(false);
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

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";

type InputBarProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  onTyping?: (isTyping: boolean) => void;
  onSendImage: () => void;
  onRecordVoice: () => void;
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

  const togglePanel = () => {
    setOpenPanel((prev) => !prev);
    setOpenEmoji(false);
  };

  const toggleEmoji = () => {
    setOpenEmoji((prev) => !prev);
    setOpenPanel(false);
  };

  const hasText = value?.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={{ backgroundColor: "white" }}>

        {/* 📌 EMOJI PICKER */}
        {openEmoji && (
          <View style={{ height: 250 }}>
            <EmojiSelector
              onEmojiSelected={(emoji: string) => onChange(value + emoji)}
              showTabs
              showHistory
              showSearchBar={false}
              columns={9}
            />
          </View>
        )}

        {/* 📌 PANEL OPTION */}
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
            <TouchableOpacity onPress={onSendImage}>
              <Ionicons name="image-outline" size={34} color="#ff4f9a" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onRecordVoice}>
              <Ionicons name="mic-outline" size={34} color="#ff4f9a" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleEmoji}>
              <Ionicons name="happy-outline" size={34} color="#ff4f9a" />
            </TouchableOpacity>
          </View>
        )}

        {/* 📌 INPUT */}
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
          <TouchableOpacity onPress={togglePanel}>
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

          <TouchableOpacity
            onPress={() => {
              if (hasText) onSend();
              setOpenPanel(false);
              setOpenEmoji(false);
            }}
          >
            <Ionicons
              name={hasText ? "send" : "mic-outline"}
              size={28}
              color="#ff4f9a"
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputBar;
