import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string; // Must be 32 bytes
const IV_LENGTH = 16; // 128 bits

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const output = Buffer.concat([iv, encrypted]);
    return output.toString('base64url'); // Requires Node 16+
}

export function decrypt(base64url: string): string {
    const input = Buffer.from(base64url, 'base64url');
    const iv = input.subarray(0, IV_LENGTH);
    const encryptedText = input.subarray(IV_LENGTH);

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
}
