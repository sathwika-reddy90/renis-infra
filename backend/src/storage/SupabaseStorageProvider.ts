import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import type { StorageProvider, StoredFile, StoredFileInput } from "./StorageProvider";

export class SupabaseStorageProvider implements StorageProvider {
  readonly name = "supabase";

  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    if (!env.SUPABASE_URL) {
      throw new Error("SUPABASE_URL is required for Supabase storage");
    }

    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Supabase storage");
    }

    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    this.bucket = env.SUPABASE_STORAGE_BUCKET;
  }

  urlFor(key: string): string {
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(key);

    return data.publicUrl;
  }

  async save({
    key,
    buffer,
    mimeType,
  }: StoredFileInput): Promise<StoredFile> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return {
      key,
      url: this.urlFor(key),
    };
  }

  async read(key: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .download(key);

    if (error) {
      throw new Error(`Supabase download failed: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([key]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }

  async move(fromKey: string, toKey: string): Promise<StoredFile> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .move(fromKey, toKey);

    if (error) {
      throw new Error(`Supabase move failed: ${error.message}`);
    }

    return {
      key: toKey,
      url: this.urlFor(toKey),
    };
  }
}