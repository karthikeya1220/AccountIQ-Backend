import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service - Handles file uploads to Supabase Storage
 */
export class StorageService {
  private buckets = {
    bills: 'bills-attachments',
    documents: 'documents',
    exports: 'exports',
    receipts: 'receipts',
  };

  /**
   * Initialize storage buckets (run once during setup)
   */
  async initializeBuckets() {
    for (const [, bucketName] of Object.entries(this.buckets)) {
      try {
        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucketName);

        if (!bucketExists) {
          // Create bucket if it doesn't exist
          await supabase.storage.createBucket(bucketName, {
            public: false, // Private by default
            fileSizeLimit: 52428800, // 50MB
          });
          console.log(`✅ Created bucket: ${bucketName}`);
        }
      } catch (error) {
        console.error(`Failed to initialize bucket ${bucketName}:`, error);
      }
    }
  }

  /**
   * Upload file to storage
   * @param bucket - Bucket name ('bills', 'documents', 'exports', 'receipts')
   * @param file - File to upload
   * @param folder - Optional folder path inside bucket
   * @returns File path and public URL
   */
  async uploadFile(
    bucket: keyof typeof this.buckets,
    file: File,
    folder: string = 'uploads'
  ): Promise<{ path: string; publicUrl: string }> {
    try {
      const bucketName = this.buckets[bucket];
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        publicUrl: urlData.publicUrl,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload bill attachment
   */
  async uploadBillAttachment(billId: string, file: File) {
    return this.uploadFile('bills', file, `bill-${billId}`);
  }

  /**
   * Upload receipt image
   */
  async uploadReceipt(transactionId: string, file: File) {
    return this.uploadFile('receipts', file, `receipt-${transactionId}`);
  }

  /**
   * Upload document (general documents)
   */
  async uploadDocument(file: File, folder: string = 'documents') {
    return this.uploadFile('documents', file, folder);
  }

  /**
   * Upload export file (PDF/Excel reports)
   */
  async uploadExport(file: File, fileName: string) {
    try {
      const bucketName = this.buckets.exports;
      const filePath = `${new Date().toISOString().split('T')[0]}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Export upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        publicUrl: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Export upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: keyof typeof this.buckets, filePath: string) {
    try {
      const bucketName = this.buckets[bucket];
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for private file access (expires in 3600 seconds by default)
   */
  async getSignedUrl(
    bucket: keyof typeof this.buckets,
    filePath: string,
    expiresIn: number = 3600
  ) {
    try {
      const bucketName = this.buckets[bucket];
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Signed URL creation failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Signed URL error:', error);
      throw error;
    }
  }

  /**
   * List files in a bucket folder
   */
  async listFiles(bucket: keyof typeof this.buckets, folder: string = '') {
    try {
      const bucketName = this.buckets[bucket];
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) {
        throw new Error(`List files failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  /**
   * Download file as Buffer
   */
  async downloadFile(bucket: keyof typeof this.buckets, filePath: string) {
    try {
      const bucketName = this.buckets[bucket];
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
