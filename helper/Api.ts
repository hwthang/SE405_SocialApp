// api.ts
export class Api {
  private static instance: Api;

  // 👉 URL backend CHỨA CỨNG
  public readonly baseUrl: string = 'http://10.125.218.62:3000/api';
  public readonly socketUrl: string = 'http://10.125.218.62:3000';


  private constructor() {}

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }
}
