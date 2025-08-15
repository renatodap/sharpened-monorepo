import { createClient } from '@supabase/supabase-js'

// Storage adapter interface
export interface StorageAdapter {
  upload(bucket: string, path: string, file: File | Buffer, options?: UploadOptions): Promise<UploadResult>
  download(bucket: string, path: string): Promise<DownloadResult>
  delete(bucket: string, path: string): Promise<boolean>
  getPublicUrl(bucket: string, path: string): string
  createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string>
}

export interface UploadOptions {
  contentType?: string
  cacheControl?: string
  metadata?: Record<string, string>
}

export interface UploadResult {
  path: string
  url: string
  size: number
}

export interface DownloadResult {
  data: ArrayBuffer
  contentType: string
  size: number
}

// Supabase Storage Adapter
class SupabaseStorageAdapter implements StorageAdapter {
  private client: ReturnType<typeof createClient>

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are required for storage adapter')
    }

    this.client = createClient(supabaseUrl, supabaseKey)
  }

  async upload(bucket: string, path: string, file: File | Buffer, options?: UploadOptions): Promise<UploadResult> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        metadata: options?.metadata,
        upsert: true,
      })

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    const url = this.getPublicUrl(bucket, data.path)
    const size = file instanceof File ? file.size : file.length

    return {
      path: data.path,
      url,
      size,
    }
  }

  async download(bucket: string, path: string): Promise<DownloadResult> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path)

    if (error) {
      throw new Error(`Storage download failed: ${error.message}`)
    }

    const arrayBuffer = await data.arrayBuffer()

    return {
      data: arrayBuffer,
      contentType: data.type,
      size: data.size,
    }
  }

  async delete(bucket: string, path: string): Promise<boolean> {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([path])

    return !error
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  }
}

// Local Storage Adapter (for development)
class LocalStorageAdapter implements StorageAdapter {
  private basePath: string

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || './storage'
    
    // Ensure directory exists
    const fs = require('fs')
    const path = require('path')
    
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true })
    }
  }

  async upload(bucket: string, path: string, file: File | Buffer, options?: UploadOptions): Promise<UploadResult> {
    const fs = require('fs').promises
    const nodePath = require('path')
    
    const fullPath = nodePath.join(this.basePath, bucket, path)
    const dir = nodePath.dirname(fullPath)
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true })
    
    // Write file
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    await fs.writeFile(fullPath, buffer)
    
    const size = buffer.length
    const url = `/storage/${bucket}/${path}`

    return {
      path,
      url,
      size,
    }
  }

  async download(bucket: string, path: string): Promise<DownloadResult> {
    const fs = require('fs').promises
    const nodePath = require('path')
    const mime = require('mime-types')
    
    const fullPath = nodePath.join(this.basePath, bucket, path)
    const buffer = await fs.readFile(fullPath)
    
    return {
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      contentType: mime.lookup(path) || 'application/octet-stream',
      size: buffer.length,
    }
  }

  async delete(bucket: string, path: string): Promise<boolean> {
    try {
      const fs = require('fs').promises
      const nodePath = require('path')
      
      const fullPath = nodePath.join(this.basePath, bucket, path)
      await fs.unlink(fullPath)
      return true
    } catch {
      return false
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    return `/storage/${bucket}/${path}`
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string> {
    // For local storage, just return the public URL
    // In a real implementation, you'd generate a temporary token
    return this.getPublicUrl(bucket, path)
  }
}

// MinIO Storage Adapter (alternative to Supabase)
class MinIOStorageAdapter implements StorageAdapter {
  private client: any

  constructor() {
    const Minio = require('minio')
    
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'localhost',
      port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[1] || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    })
  }

  async upload(bucket: string, path: string, file: File | Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Ensure bucket exists
    const bucketExists = await this.client.bucketExists(bucket)
    if (!bucketExists) {
      await this.client.makeBucket(bucket)
    }

    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    
    await this.client.putObject(bucket, path, buffer, buffer.length, {
      'Content-Type': options?.contentType || 'application/octet-stream',
      'Cache-Control': options?.cacheControl || '3600',
      ...options?.metadata,
    })

    const url = `http://${process.env.MINIO_ENDPOINT}/${bucket}/${path}`

    return {
      path,
      url,
      size: buffer.length,
    }
  }

  async download(bucket: string, path: string): Promise<DownloadResult> {
    const stream = await this.client.getObject(bucket, path)
    const chunks: Buffer[] = []
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve({
          data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          contentType: 'application/octet-stream', // MinIO doesn't easily provide this
          size: buffer.length,
        })
      })
      stream.on('error', reject)
    })
  }

  async delete(bucket: string, path: string): Promise<boolean> {
    try {
      await this.client.removeObject(bucket, path)
      return true
    } catch {
      return false
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    return `http://${process.env.MINIO_ENDPOINT}/${bucket}/${path}`
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string> {
    return await this.client.presignedGetObject(bucket, path, expiresIn)
  }
}

// Storage adapter factory
export function createStorageAdapter(): StorageAdapter {
  const adapter = process.env.STORAGE_ADAPTER || 'supabase'
  
  switch (adapter) {
    case 'local':
      return new LocalStorageAdapter()
    case 'minio':
      return new MinIOStorageAdapter()
    case 'supabase':
    default:
      return new SupabaseStorageAdapter()
  }
}

// Default storage instance
export const storage = createStorageAdapter()

// Storage buckets configuration
export const STORAGE_BUCKETS = {
  VIDEOS: 'courtsync-videos',
  AVATARS: 'courtsync-avatars',
  DOCUMENTS: 'courtsync-documents',
  THUMBNAILS: 'courtsync-thumbnails',
} as const

// Storage utilities
export const storageUtils = {
  // Generate unique file path
  generateFilePath: (userId: string, originalName: string, prefix?: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = originalName.split('.').pop()
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
    
    const fileName = `${baseName}-${timestamp}-${random}.${ext}`
    return prefix ? `${prefix}/${userId}/${fileName}` : `${userId}/${fileName}`
  },

  // Get file size in human readable format
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Validate file type
  isValidVideoFile: (file: File): boolean => {
    const allowedTypes = [
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/webm',
      'video/quicktime',
    ]
    return allowedTypes.includes(file.type)
  },

  // Validate file size
  isValidFileSize: (file: File, maxSizeMB: number = 500): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxBytes
  },
}