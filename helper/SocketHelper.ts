import { io, Socket } from "socket.io-client";
import { Api } from "./Api";
import { AuthHelper } from "./AuthHelper";

class SocketHelper {
  private static instance: SocketHelper;
  public socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketHelper {
    if (!SocketHelper.instance) {
      SocketHelper.instance = new SocketHelper();
    }
    return SocketHelper.instance;
  }

  /**
   * Kết nối đến Namespace 'notifications' với Token xác thực
   */
  async connect() {
    // Nếu đã kết nối rồi thì không kết nối lại
    if (this.socket?.connected) return;

    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      if (!token) {
        console.warn(" [Socket] Không tìm thấy token, hủy kết nối.");
        return;
      }

      // Khởi tạo connection với Namespace và Query Token
      // Lưu ý: baseUrlSocket thường là "http://192.168.1.x:3000"
      this.socket = io(`${Api.getInstance().socketUrl}/notifications`, {
        query: { token },
        transports: ["websocket"], // Ép sử dụng websocket để ổn định hơn trên Mobile
      });

      this.socket.on("connect", () => {
        console.log(" ✅ [Socket] Connected to Notifications Gateway");
      });

      this.socket.on("disconnect", (reason) => {
        console.log(" ❌ [Socket] Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error(" ⚠️ [Socket] Connection Error:", error.message);
      });

    } catch (error) {
      console.error(" ❌ [Socket] Init error:", error);
    }
  }

  /**
   * Lắng nghe thông báo mới từ Server
   * @param callback Hàm xử lý khi nhận được data
   */
  onNewNotification(callback: (data: any) => void) {
    this.socket?.on("notification:new", callback);
  }

  /**
   * Hủy lắng nghe sự kiện
   */
  removeListener(event: string) {
    this.socket?.off(event);
  }

  /**
   * Ngắt kết nối hoàn toàn
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log(" 🔌 [Socket] Force disconnected");
    }
  }
}

export default SocketHelper.getInstance();