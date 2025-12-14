import * as fs from 'fs/promises'
import * as path from 'path'
import { createReadStream, createWriteStream, promises as fsPromises } from 'fs'
import { pipeline } from 'stream/promises'
import { randomBytes } from 'crypto'

// File utility functions
export class FileUtils {
  // Check if file exists
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  // Check if path exists (file or directory)
  static async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath)
      return true
    } catch {
      return false
    }
  }

  // Check if path is a file
  static async isFile(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  // Check if path is a directory
  static async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  // Get file stats
  static async getStats(filePath: string): Promise<{
    size: number
    createdAt: Date
    modifiedAt: Date
    accessedAt: Date
    isFile: boolean
    isDirectory: boolean
  }> {
    const stats = await fs.stat(filePath)
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      accessedAt: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    }
  }

  // Read file
  static async readFile(filePath: string, encoding: 'utf8' | 'binary' = 'utf8'): Promise<string> {
    return await fs.readFile(filePath, encoding)
  }

  // Read file as buffer
  static async readFileBuffer(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath)
  }

  // Read JSON file
  static async readJSON<T = any>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content)
  }

  // Write file
  static async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    // Ensure directory exists
    await this.ensureDirectory(path.dirname(filePath))
    await fs.writeFile(filePath, content)
  }

  // Write JSON file
  static async writeJSON(filePath: string, data: any, options: {
    pretty?: boolean
    indent?: number
  } = {}): Promise<void> {
    const { pretty = true, indent = 2 } = options
    const content = JSON.stringify(data, null, pretty ? indent : 0)
    await this.writeFile(filePath, content)
  }

  // Append to file
  static async appendFile(filePath: string, content: string): Promise<void> {
    // Ensure directory exists
    await this.ensureDirectory(path.dirname(filePath))
    await fs.appendFile(filePath, content)
  }

  // Create directory (recursively)
  static async createDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true })
  }

  // Ensure directory exists
  static async ensureDirectory(dirPath: string): Promise<void> {
    if (!(await this.pathExists(dirPath))) {
      await this.createDirectory(dirPath)
    }
  }

  // Delete file
  static async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath)
  }

  // Delete directory (recursively)
  static async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true })
    } catch (error) {
      // Fallback for older Node.js versions
      await fs.rmdir(dirPath, { recursive: true })
    }
  }

  // Copy file
  static async copyFile(sourcePath: string, destPath: string): Promise<void> {
    // Ensure destination directory exists
    await this.ensureDirectory(path.dirname(destPath))
    await fs.copyFile(sourcePath, destPath)
  }

  // Copy directory (recursively)
  static async copyDirectory(sourcePath: string, destPath: string): Promise<void> {
    await this.ensureDirectory(destPath)
    
    const entries = await fs.readdir(sourcePath, { withFileTypes: true })
    
    for (const entry of entries) {
      const sourceEntry = path.join(sourcePath, entry.name)
      const destEntry = path.join(destPath, entry.name)
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourceEntry, destEntry)
      } else {
        await this.copyFile(sourceEntry, destEntry)
      }
    }
  }

  // Move file
  static async moveFile(sourcePath: string, destPath: string): Promise<void> {
    // Ensure destination directory exists
    await this.ensureDirectory(path.dirname(destPath))
    await fs.rename(sourcePath, destPath)
  }

  // Get file size
  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath)
    return stats.size
  }

  // Get directory size (recursively)
  static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name)
      
      if (entry.isDirectory()) {
        totalSize += await this.getDirectorySize(entryPath)
      } else {
        const stats = await fs.stat(entryPath)
        totalSize += stats.size
      }
    }
    
    return totalSize
  }

  // List files in directory
  static async listFiles(dirPath: string, options: {
    recursive?: boolean
    includeDirectories?: boolean
    filter?: (name: string, fullPath: string, isDirectory: boolean) => boolean
  } = {}): Promise<string[]> {
    const {
      recursive = false,
      includeDirectories = true,
      filter
    } = options

    const files: string[] = []
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (filter && !filter(entry.name, fullPath, entry.isDirectory())) {
        continue
      }
      
      if (entry.isDirectory()) {
        if (includeDirectories) {
          files.push(fullPath)
        }
        if (recursive) {
          files.push(...await this.listFiles(fullPath, options))
        }
      } else {
        files.push(fullPath)
      }
    }
    
    return files
  }

  // Create readable stream
  static createReadStream(filePath: string, options?: {
    encoding?: BufferEncoding
    start?: number
    end?: number
  }): NodeJS.ReadableStream {
    return createReadStream(filePath, options)
  }

  // Create writable stream
  static createWriteStream(filePath: string, options?: {
    encoding?: BufferEncoding
    flags?: string
  }): NodeJS.WritableStream {
    return createWriteStream(filePath, options)
  }

  // Pipe streams
  static async pipeStreams(
    source: NodeJS.ReadableStream,
    destination: NodeJS.WritableStream
  ): Promise<void> {
    await pipeline(source, destination)
  }

  // Copy file using streams
  static async copyFileStream(
    sourcePath: string,
    destPath: string
  ): Promise<void> {
    await this.ensureDirectory(path.dirname(destPath))
    
    const source = this.createReadStream(sourcePath)
    const destination = this.createWriteStream(destPath)
    
    await this.pipeStreams(source, destination)
  }

  // Compress file (simple gzip)
  static async compressFile(
    sourcePath: string,
    destPath: string
  ): Promise<void> {
    const zlib = await import('zlib')
    const source = this.createReadStream(sourcePath)
    const destination = this.createWriteStream(destPath)
    const gzip = zlib.createGzip()
    
    await this.pipeStreams(source, gzip)
    await this.pipeStreams(gzip, destination)
  }

  // Decompress file (simple gzip)
  static async decompressFile(
    sourcePath: string,
    destPath: string
  ): Promise<void> {
    const zlib = await import('zlib')
    const source = this.createReadStream(sourcePath)
    const destination = this.createWriteStream(destPath)
    const gunzip = zlib.createGunzip()
    
    await this.pipeStreams(source, gunzip)
    await this.pipeStreams(gunzip, destination)
  }

  // Calculate file hash
  static async calculateHash(
    filePath: string,
    algorithm: string = 'sha256'
  ): Promise<string> {
    const crypto = await import('crypto')
    const hash = crypto.createHash(algorithm)
    const stream = this.createReadStream(filePath)
    
    for await (const chunk of stream) {
      hash.update(chunk)
    }
    
    return hash.digest('hex')
  }

  // Verify file integrity
  static async verifyFile(
    filePath: string,
    expectedHash: string,
    algorithm: string = 'sha256'
  ): Promise<boolean> {
    const actualHash = await this.calculateHash(filePath, algorithm)
    return actualHash === expectedHash
  }

  // Get file extension
  static getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase().slice(1)
  }

  // Get file name without extension
  static getFileName(filePath: string): string {
    return path.basename(filePath, path.extname(filePath))
  }

  // Get file name with extension
  static getFileNameWithExtension(filePath: string): string {
    return path.basename(filePath)
  }

  // Get directory path
  static getDirectoryPath(filePath: string): string {
    return path.dirname(filePath)
  }

  // Join paths
  static joinPath(...paths: string[]): string {
    return path.join(...paths)
  }

  // Resolve path
  static resolvePath(...paths: string[]): string {
    return path.resolve(...paths)
  }

  // Get relative path
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to)
  }

  // Normalize path
  static normalizePath(filePath: string): string {
    return path.normalize(filePath)
  }

  // Generate temporary file name
  static generateTempFileName(prefix: string = 'temp', extension: string = ''): string {
    const randomSuffix = randomBytes(8).toString('hex')
    return `${prefix}_${randomSuffix}${extension ? '.' + extension : ''}`
  }

  // Generate temporary file path
  static generateTempFilePath(
    tempDir: string,
    prefix: string = 'temp',
    extension: string = ''
  ): string {
    const fileName = this.generateTempFileName(prefix, extension)
    return this.joinPath(tempDir, fileName)
  }

  // Get system temporary directory
  static getTempDir(): string {
    const os = require('os')
    return os.tmpdir()
  }

  // Create temporary file
  static async createTempFile(
    content: string | Buffer = '',
    options: {
      prefix?: string
      extension?: string
      encoding?: BufferEncoding
    } = {}
  ): Promise<{ path: string; cleanup: () => Promise<void> }> {
    const {
      prefix = 'temp',
      extension = '',
      encoding = 'utf8'
    } = options

    const tempDir = this.getTempDir()
    const filePath = this.generateTempFilePath(tempDir, prefix, extension)

    await this.writeFile(filePath, content)

    const cleanup = async () => {
      if (await this.exists(filePath)) {
        await this.deleteFile(filePath)
      }
    }

    return { path: filePath, cleanup }
  }

  // Create temporary directory
  static async createTempDirectory(
    prefix: string = 'temp'
  ): Promise<{ path: string; cleanup: () => Promise<void> }> {
    const tempDir = this.getTempDir()
    const randomSuffix = randomBytes(8).toString('hex')
    const dirPath = this.joinPath(tempDir, `${prefix}_${randomSuffix}`)

    await this.createDirectory(dirPath)

    const cleanup = async () => {
      if (await this.pathExists(dirPath)) {
        await this.deleteDirectory(dirPath)
      }
    }

    return { path: dirPath, cleanup }
  }

  // Watch file for changes
  static watchFile(
    filePath: string,
    callback: (eventType: string, filename: string) => void
  ): fs.FSWatcher {
    return fs.watch(filePath, callback)
  }

  // Watch directory for changes
  static watchDirectory(
    dirPath: string,
    callback: (eventType: string, filename: string) => void
  ): fs.FSWatcher {
    return fs.watch(dirPath, callback)
  }

  // Get MIME type from file extension
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      // Text files
      txt: 'text/plain',
      html: 'text/html',
      css: 'text/css',
      js: 'text/javascript',
      json: 'application/json',
      xml: 'application/xml',
      csv: 'text/csv',
      
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
      aac: 'audio/aac',
      
      // Video
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      webm: 'video/webm',
      
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Archives
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      tar: 'application/x-tar',
      gz: 'application/gzip',
      '7z': 'application/x-7z-compressed',
    }

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }

  // Get MIME type from file path
  static getMimeTypeFromPath(filePath: string): string {
    const extension = this.getFileExtension(filePath)
    return this.getMimeType(extension)
  }

  // Check if file is image
  static isImageFile(filePath: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico']
    const extension = this.getFileExtension(filePath)
    return imageExtensions.includes(extension)
  }

  // Check if file is audio
  static isAudioFile(filePath: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac']
    const extension = this.getFileExtension(filePath)
    return audioExtensions.includes(extension)
  }

  // Check if file is video
  static isVideoFile(filePath: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
    const extension = this.getFileExtension(filePath)
    return videoExtensions.includes(extension)
  }

  // Check if file is document
  static isDocumentFile(filePath: string): boolean {
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
    const extension = this.getFileExtension(filePath)
    return documentExtensions.includes(extension)
  }

  // Check if file is archive
  static isArchiveFile(filePath: string): boolean {
    const archiveExtensions = ['zip', 'rar', 'tar', 'gz', '7z']
    const extension = this.getFileExtension(filePath)
    return archiveExtensions.includes(extension)
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
  }

  // Sanitize file name
  static sanitizeFileName(fileName: string): string {
    // Remove invalid characters
    const sanitized = fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')

    // Ensure it's not empty
    return sanitized || 'unnamed_file'
  }

  // Sanitize path
  static sanitizePath(filePath: string): string {
    return filePath
      .split(/[\\/]/)
      .map(part => this.sanitizeFileName(part))
      .join(path.sep)
  }

  // Create backup of file
  static async createBackup(
    filePath: string,
    backupDir?: string
  ): Promise<string> {
    const originalDir = path.dirname(filePath)
    const originalName = path.basename(filePath)
    const extension = path.extname(originalName)
    const name = path.basename(originalName, extension)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `${name}_backup_${timestamp}${extension}`
    
    const backupPath = backupDir 
      ? path.join(backupDir, backupName)
      : path.join(originalDir, backupName)
    
    await this.ensureDirectory(path.dirname(backupPath))
    await this.copyFile(filePath, backupPath)
    
    return backupPath
  }

  // Restore from backup
  static async restoreFromBackup(backupPath: string, originalPath: string): Promise<void> {
    await this.ensureDirectory(path.dirname(originalPath))
    await this.copyFile(backupPath, originalPath)
  }

  // Batch file operations
  static async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    concurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency)
      const batchResults = await Promise.all(batch.map(op => op()))
      results.push(...batchResults)
    }
    
    return results
  }

  // Find files by pattern
  static async findFiles(
    dirPath: string,
    pattern: RegExp
  ): Promise<string[]> {
    const files = await this.listFiles(dirPath, { recursive: true })
    return files.filter(file => pattern.test(file))
  }

  // Find files by extension
  static async findFilesByExtension(
    dirPath: string,
    extensions: string | string[]
  ): Promise<string[]> {
    const extArray = Array.isArray(extensions) ? extensions : [extensions]
    const pattern = new RegExp(`\\.(${extArray.join('|')})$`, 'i')
    return this.findFiles(dirPath, pattern)
  }

  // Get unique file names in directory
  static async getUniqueFileNames(dirPath: string): Promise<string[]> {
    const files = await this.listFiles(dirPath)
    const names = files.map(file => this.getFileNameWithExtension(file))
    return [...new Set(names)]
  }

  // Generate unique file name
  static async generateUniqueFileName(
    dirPath: string,
    baseName: string,
    extension: string
  ): Promise<string> {
    let fileName = `${baseName}.${extension}`
    let counter = 1

    while (await this.exists(this.joinPath(dirPath, fileName))) {
      fileName = `${baseName}_${counter}.${extension}`
      counter++
    }

    return fileName
  }
}

export default FileUtils
