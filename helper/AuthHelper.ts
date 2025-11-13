export class AuthHelper {
  private static instance: AuthHelper;

  private constructor() { }

  private _isAdmin: boolean = false;

  public static getInstance(): AuthHelper {
    if (!AuthHelper.instance) {
      AuthHelper.instance = new AuthHelper();
    }
    return AuthHelper.instance;
  }


  /**
   * getIsAdmin
   */
  public getIsAdmin() {
    return this._isAdmin
  }

  /**
   * setIsAdmin
   */
  public setIsAdmin(isAdmin: boolean) {
    this._isAdmin = isAdmin
  }

}