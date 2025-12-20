import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";

export type InputBarProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  onTyping?: (isTyping: boolean) => void;
  onSendImage: (uri: string) => void;
  onRecordVoice: (uri: string) => void;
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
  const timerRef = useRef<NodeJS.Timeout | any>(null);
  const [recordDuration, setRecordDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const togglePanel = () => {
    setOpenPanel((p) => !p);
    setOpenEmoji(false);
  };

  const toggleEmoji = () => {
    setOpenEmoji((p) => !p);
    setOpenPanel(false);
  };

  const hasText = (value || "").trim().length > 0;

  /* ===== RECORD ===== */
  const startRecording = async () => {
    try {
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

      timerRef.current = setInterval(() => {
        setRecordDuration((d) => d + 1);
      }, 1000);
    } catch (e) {
      console.error("startRecording error", e);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setRecording(null);
      setRecordDuration(0);
      setRecordStartAt(null);

      if (uri) onRecordVoice(uri);
    } catch (e) {
      console.error("stopRecording error", e);
    }
  };

  /* ===== IMAGE ===== */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      onSendImage(result.assets[0].uri);
    }
  };

  return (
    <>
      {/* EMOJI */}
      {openEmoji && (
        <View style={{ height: 260 }}>
          <EmojiSelector
            onEmojiSelected={(emoji) =>
              onChange((value || "") + emoji)
            }
            showTabs
            showHistory
            showSearchBar={false}
            columns={9}
          />
        </View>
      )}

      {/* PANEL */}
      {openPanel && (
        <View
          style={{
            flexDirection: "row",
            padding: 15,
            gap: 30,
            justifyContent: "center",
            borderTopWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image-outline" size={34} color="#ff4f9a" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons
              name={isRecording ? "stop-circle" : "mic-outline"}
              size={34}
              color={isRecording ? "red" : "#ff4f9a"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleEmoji}>
            <Ionicons name="happy-outline" size={34} color="#ff4f9a" />
          </TouchableOpacity>
        </View>
      )}

      {/* RECORDING STATUS */}
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

      {/* INPUT */}
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
          placeholder="Aa"
          onChangeText={(text) => {
            onChange(text);
            onTyping?.(true);
            setTimeout(() => onTyping?.(false), 1200);
          }}
          onFocus={() => {
            setOpenPanel(false);
            setOpenEmoji(false);
          }}
          style={{
            flex: 1,
            fontSize: 16,
            paddingHorizontal: 14,
            marginHorizontal: 10,
            backgroundColor: "#f1f1f1",
            borderRadius: 25,
            maxHeight: 100,
          }}
        />

        <TouchableOpacity
          onPress={() => {
            if (isRecording) stopRecording();
            else if (hasText) onSend();
            else startRecording();

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
   </>
  );
};

export default InputBar;
