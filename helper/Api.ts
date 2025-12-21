// api.ts
export class Api {
  private static instance: Api;

  // 👉 URL backend CHỨA CỨNG
  public readonly baseUrl: string = 'http://172.16.0.150:3000/api';

  private constructor() {}

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }
}
