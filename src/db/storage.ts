import { supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private buckets = {
    bills: 'bills-attachments',
    documents: 'documents',
    exports: 'exports',
    receipts: 'receipts',
  };

  async uploadBillAttachment(billId: string, file: Buffer, fileName: string): Promise<{ path: string; publicUrl: string }> {
    const bucketName = this.buckets.bills;
    const ext = fileName.split('.').pop();
    const uniqueName = `${billId}-${uuidv4()}.${ext}`;
    const filePath = `uploads/${uniqueName}`;
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/octet-stream',
      });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
    return { path: filePath, publicUrl: urlData.publicUrl };
  }
}

export const storageService = new StorageService();
export default storageService;
