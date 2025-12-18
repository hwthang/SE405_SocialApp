import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export class AuthHelper {
  private static instance: AuthHelper;

  private constructor() {}

  private _isAdmin: boolean = false;
  private _accessToken: string | null = null;

  private static ACCESS_TOKEN_KEY = "ACCESS_TOKEN";

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

  public async logOut(){
   await AsyncStorage.removeItem(AuthHelper.ACCESS_TOKEN_KEY);
   router.replace('/(auth)/login')
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

  public async getAccessToken(): Promise<string | null> {
    if (this._accessToken) {
      return this._accessToken;
    }

    const token = await AsyncStorage.getItem(AuthHelper.ACCESS_TOKEN_KEY);
    this._accessToken = token;

    return token;
  }


  
}
