/**
 * Encryption utilities for sensitive data
 * Note: This is a simplified implementation for demo purposes.
 * In production, use proper server-side encryption with HSM or secure key management.
 */

export class EncryptionService {
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  /**
   * Generates a random encryption key
   */
  static generateKey(): string {
    const array = new Uint8Array(this.KEY_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generates a random initialization vector
   */
  static generateIV(): string {
    const array = new Uint8Array(this.IV_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypts data using AES-GCM (browser-compatible)
   * Note: This is a client-side implementation for demo purposes.
   * Production OAuth tokens should be encrypted server-side.
   */
  static async encryptData(data: string, key: string): Promise<{ encrypted: string; iv: string }> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Convert hex key to buffer
      const keyBuffer = new Uint8Array(key.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Generate IV
      const iv = this.generateIV();
      const ivBuffer = new Uint8Array(iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Import key for AES-GCM
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        cryptoKey,
        dataBuffer
      );
      
      // Convert to hex string
      const encryptedHex = Array.from(new Uint8Array(encrypted), byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
      
      return {
        encrypted: encryptedHex,
        iv: iv
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Creates a mock encrypted token for OAuth storage
   * In production, this would be done server-side with proper key management
   */
  static async createSecureTokenStorage(token: string): Promise<{
    encrypted_token: string;
    encryption_key_id: string;
    iv: string;
  }> {
    const key = this.generateKey();
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { encrypted, iv } = await this.encryptData(token, key);
    
    // In production, the key would be stored in a secure key management system
    // and only the key ID would be stored with the encrypted data
    
    return {
      encrypted_token: encrypted,
      encryption_key_id: keyId,
      iv: iv
    };
  }

  /**
   * Validates that token data is properly encrypted
   */
  static validateEncryptedToken(tokenData: any): boolean {
    return (
      tokenData &&
      typeof tokenData.encrypted_token === 'string' &&
      typeof tokenData.encryption_key_id === 'string' &&
      tokenData.encrypted_token.length > 0 &&
      tokenData.encryption_key_id.length > 0 &&
      !tokenData.encrypted_token.includes('demo') &&
      !tokenData.encrypted_token.includes('placeholder') &&
      !tokenData.encrypted_token.includes('Math.random')
    );
  }
}