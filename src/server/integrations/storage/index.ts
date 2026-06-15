import { config } from "@/server/config";

/** Media storage port (BRD §11 — Cloudinary). */
export interface SignedUpload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface StorageProvider {
  readonly name: string;
  /** Whether real credentials are configured (controls client upload UI). */
  isConfigured(): boolean;
  /** Produce a signed payload the browser uses to upload directly to the CDN. */
  signUpload(folder: string): Promise<SignedUpload>;
}

class MockStorageProvider implements StorageProvider {
  readonly name = "mock";
  isConfigured() {
    return false;
  }
  async signUpload(folder: string): Promise<SignedUpload> {
    return {
      signature: "mock-signature",
      timestamp: Math.floor(Date.now() / 1000),
      apiKey: "mock",
      cloudName: "mock",
      folder,
    };
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  readonly name = "cloudinary";
  isConfigured() {
    return Boolean(
      config.CLOUDINARY_CLOUD_NAME &&
        config.CLOUDINARY_API_KEY &&
        config.CLOUDINARY_API_SECRET,
    );
  }
  async signUpload(folder: string): Promise<SignedUpload> {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      config.CLOUDINARY_API_SECRET!,
    );
    return {
      signature,
      timestamp,
      apiKey: config.CLOUDINARY_API_KEY!,
      cloudName: config.CLOUDINARY_CLOUD_NAME!,
      folder,
    };
  }
}

export function createStorageProvider(): StorageProvider {
  const cloudinary = new CloudinaryStorageProvider();
  return cloudinary.isConfigured() ? cloudinary : new MockStorageProvider();
}
