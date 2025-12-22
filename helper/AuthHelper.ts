import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export class AuthHelper {
  private static instance: AuthHelper;

  private constructor() { }

  private _isAdmin: boolean = false;
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null; // Thêm biến tạm cho refresh token

  private static ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
  private static REFRESH_TOKEN_KEY = "REFRESH_TOKEN"; // Key lưu trữ
  private static USER = "USER";


  public static getInstance(): AuthHelper {
    if (!AuthHelper.instance) {
      AuthHelper.instance = new AuthHelper();
    }
    return AuthHelper.instance;
  }

  // ---- Admin ----
  public getIsAdmin() {
    return this._isAdmin;
  }

  public setIsAdmin(isAdmin: boolean) {
    this._isAdmin = isAdmin;
  }

  public async logOut() {
    // Xóa tất cả token khi logout

    await AsyncStorage.clear()

    this._accessToken = null;
    this._refreshToken = null;
    router.replace('/(auth)/login');
  }

  // ---- Access Token ----
  public async setAccessToken(token: string | null) {
    this._accessToken = token;
    if (token) {
      await AsyncStorage.setItem(AuthHelper.ACCESS_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AuthHelper.ACCESS_TOKEN_KEY);
    }
  }

  public async setUser(token: string | null) {
    this._accessToken = token;
    if (token) {
      await AsyncStorage.setItem(AuthHelper.USER, token);
    } else {
      await AsyncStorage.removeItem(AuthHelper.USER);
    }
  }

  public async getAccessToken(): Promise<string | null> {
    if (this._accessToken) return this._accessToken;
    const token = await AsyncStorage.getItem(AuthHelper.ACCESS_TOKEN_KEY);
    this._accessToken = token;
    return token;
  }

  // ---- Refresh Token (MỚI THÊM) ----
  public async setRefreshToken(token: string | null) {
    this._refreshToken = token;
    if (token) {
      await AsyncStorage.setItem(AuthHelper.REFRESH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AuthHelper.REFRESH_TOKEN_KEY);
    }
  }

  public async getRefreshToken(): Promise<string | null> {
    if (this._refreshToken) return this._refreshToken;
    const token = await AsyncStorage.getItem(AuthHelper.REFRESH_TOKEN_KEY);
    this._refreshToken = token;
    return token;
  }

  // ---- User Info ----
  public async getUserId(): Promise<string | null> {
    try {
      const userData = await AsyncStorage.getItem('USER');
      if (!userData) return null;
      const user = JSON.parse(userData);
      return user.id;
    } catch (e) {
      return null;
    }
  }

  // ---- User Info ----
  public async getUserAvatar(): Promise<string | null> {
    try {
      const userData = await AsyncStorage.getItem('USER');
      if (!userData) return null;
      const user = JSON.parse(userData);
      console.log(user)
      return user.avatarUrl;
    } catch (e) {
      return null;
    }
  }
}