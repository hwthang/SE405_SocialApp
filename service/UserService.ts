import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";

export class UserService {
  private static instance: UserService;
  private api = Api.getInstance();
  private auth = AuthHelper.getInstance();

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
  public async getMe() {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      console.log('token')
      console.log(token)
      const response = await fetch(`${this.api.baseUrl}/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log(result)
      return result.data


    } catch (error) {
      console.error("Get Me Error:", error);
      return null;
    }
  }

  public async updateMyProfile(data: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    // 🔒 BẢO VỆ: avatarUrl BẮT BUỘC LÀ STRING
    if (data.avatarUrl && typeof data.avatarUrl !== "string") {
      throw new Error("avatarUrl must be a string");
    }

    const token = await AuthHelper.getInstance().getAccessToken();

    const response = await fetch(`${this.api.baseUrl}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Update failed");
    }

    // await AuthHelper.getInstance().setUser(result.data);
    return result.data;
  }


}
