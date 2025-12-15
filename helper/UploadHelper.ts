// UploadHelper.ts

import { Api } from "./Api";
import { AuthHelper } from "./AuthHelper";

type MediaType = "IMAGE" | "VIDEO";

interface MediaObject {
  type: MediaType;
  url: string;
}

interface SignatureResponse {
  data: {
    timestamp: number;
    folder: string;
    signature: string;
    cloudName: string;
    apiKey: string;
  };
  error: any;
}

class UploadHelper {
  private static instance: UploadHelper;

  private constructor() { }

  public static getInstance(): UploadHelper {
    if (!UploadHelper.instance) {
      UploadHelper.instance = new UploadHelper();
    }
    return UploadHelper.instance;
  }

  /**
   * Upload image / video → return { type, url }
   */
  async getMediaObject(file: any): Promise<MediaObject> {
    if (!file) {
      throw new Error("File is required");
    }

    // 1. Detect media type
    const mediaType: MediaType = this.detectMediaType(file);


    // 2. Gọi API backend lấy signature
    const api = Api.getInstance()
    const auth = AuthHelper.getInstance()
    console.log(`${api.baseUrl}/uploads/signature`)
    console.log(await auth.getAccessToken())
    const sigRes = await fetch(`${api.baseUrl}/uploads/signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await auth.getAccessToken()}`,
      },
      body: JSON.stringify({
        folder: 'posts'
      }),

    });

    const sigJson: SignatureResponse = await sigRes.json();

    console.log(sigJson)

    const {
      timestamp,
      folder,
      signature,
      cloudName,
      apiKey,
    } = sigJson.data;

    // 3. Tạo FormData upload Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);

    // 4. Upload Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType === "VIDEO" ? "video" : "image"}/upload`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      throw new Error(`Upload failed: ${text}`);
    }

    const uploadJson = await uploadRes.json();

    // 5. Lọc response trả về
    return {
      type: uploadJson.resource_type === "video" ? "VIDEO" : "IMAGE",
      url: uploadJson.secure_url || uploadJson.url,
    };
  }

  /**
   * Detect IMAGE / VIDEO
   */
  private detectMediaType(file: any): MediaType {
    // Web
    if (file?.type?.startsWith("video")) return "VIDEO";

    // Expo / React Native (fallback)
    if (file?.uri && file?.type === "video") return "VIDEO";

    return "IMAGE";
  }
}

export default UploadHelper;
