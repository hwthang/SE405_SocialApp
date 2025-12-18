import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

// Chiều rộng/Chiều cao của khung QR Scanner (thường là 70-80% màn hình)
const FRAME_SIZE = 250;
// Kích thước của các góc vuông (corner)
const CORNER_SIZE = 30;
const CORNER_BORDER_WIDTH = 4;
const CORNER_COLOR = "#00FF7F"; // Màu xanh lá cây sáng

export default function QrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const scannedRef = useRef(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  const handleScan = async ({ data, type }: { data: string; type: string }) => {
    if (scannedRef.current) return;

    scannedRef.current = true;
    setScanned(true);

    console.log("SCANNED:", type, data);

    const response = await fetch(
      `${Api.getInstance().baseUrl}/friends/requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
        },
        body: JSON.stringify({
          toUserId: data,
        }),
      }
    );
    const result = await response.json();

    console.log(result);

    if(result.data.id){
      Toast.show({type:'success', text1:'Gửi lời mời kết bạn thành công', text2:'Hãy đợi người ấy đồng ý nhé!'},)
      router.back()
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Cần quyền camera để quét QR</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Cho phép camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 1. CAMERA VIEW */}
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={scanned ? undefined : handleScan} // Ngăn quét lại khi đã tìm thấy
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* 2. OVERLAY (Lớp phủ) */}
      <View style={styles.overlay}>
        {/* Phần Mask phía trên */}
        <View style={styles.maskTopBottom} />

        {/* Khu vực chứa khung quét QR */}
        <View style={styles.middleSection}>
          {/* Phần Mask bên trái */}
          <View style={styles.maskSides} />

          {/* KHUNG QUÉT QR (Phần này là View trong suốt để camera nhìn qua) */}
          <View style={styles.qrFrame}>
            {/* 4 Góc Vuông */}
            <View style={[styles.corner, styles.topLeftCorner]} />
            <View style={[styles.corner, styles.topRightCorner]} />
            <View style={[styles.corner, styles.bottomLeftCorner]} />
            <View style={[styles.corner, styles.bottomRightCorner]} />
          </View>

          {/* Phần Mask bên phải */}
          <View style={styles.maskSides} />
        </View>

        {/* Phần Mask phía dưới */}
        <View style={styles.maskTopBottom} />

        {/* Text hướng dẫn phía dưới */}
        <View style={styles.instructionContainer}>
          <Text style={styles.scanText}>Đưa mã QR vào trong khung quét</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  btn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  // OVERLAY STYLES
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  // MASK STYLES
  maskTopBottom: {
    flex: 1, // Chiếm hết không gian trên/dưới Frame
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  middleSection: {
    flexDirection: "row",
    height: FRAME_SIZE,
    width: "100%",
  },
  maskSides: {
    flex: 1, // Chiếm hết không gian 2 bên Frame
    height: FRAME_SIZE,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  // QR FRAME (Phần trong suốt ở giữa)
  qrFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: "transparent",
    // Thêm viền trắng mỏng nếu cần
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  // CORNER STYLES (4 Góc vuông)
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  topLeftCorner: {
    top: -CORNER_BORDER_WIDTH,
    left: -CORNER_BORDER_WIDTH,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderTopLeftRadius: 5, // Bo góc nhẹ
  },
  topRightCorner: {
    top: -CORNER_BORDER_WIDTH,
    right: -CORNER_BORDER_WIDTH,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderTopRightRadius: 5,
  },
  bottomLeftCorner: {
    bottom: -CORNER_BORDER_WIDTH,
    left: -CORNER_BORDER_WIDTH,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderBottomLeftRadius: 5,
  },
  bottomRightCorner: {
    bottom: -CORNER_BORDER_WIDTH,
    right: -CORNER_BORDER_WIDTH,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderBottomRightRadius: 5,
  },

  // INSTRUCTION TEXT
  instructionContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20, // Tách khỏi khung quét
  },
});
