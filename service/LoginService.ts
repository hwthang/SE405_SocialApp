import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";

export class LoginService {
  private static instance: LoginService;
  private api = Api.getInstance();
  private auth = AuthHelper.getInstance();

  public static getInstance(): LoginService {
    if (!LoginService.instance) {
      LoginService.instance = new LoginService();
    }
    return LoginService.instance;
  }

  /**
   * Kiểm tra và làm mới token. 
   * Trả về true nếu refresh thành công (User vẫn hợp lệ)
   */
  public async checkAndRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.auth.getRefreshToken();
      console.log(refreshToken)
      if (!refreshToken) return false;

      const response = await fetch(`${this.api.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Cập nhật cặp token mới vào Storage
        await this.auth.setAccessToken(result.data.accessToken);
        await this.auth.setRefreshToken(result.data.refreshToken);
        const user = JSON.stringify(result.data.user)
        await this.auth.setUser(user);
        return true;
      }

      // Nếu API trả lỗi (hết hạn hoàn toàn), xóa sạch dữ liệu
      await this.auth.logOut();
      return false;
    } catch (error) {
      console.error("Refresh Token Error:", error);
      return false;
    }
  }
}