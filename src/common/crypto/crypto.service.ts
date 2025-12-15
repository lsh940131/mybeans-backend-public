import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private key: string;
  private iv: Buffer;
  private saltJar: string;

  constructor(private readonly configService: ConfigService) {
    this.key = this.configService.get<string>('AESKEY');
    this.iv = Buffer.alloc(16, 0);
    this.saltJar = this.configService.get<string>('SALTJAR');
  }

  /**
   * aes256 암호화
   * @param {string} txt 암호화할 문자열
   * @returns 암호 문자열
   */
  aes256Encrypt(txt: string | number): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    let encryptedText = cipher.update(txt.toString(), 'utf8', 'base64');
    encryptedText += cipher.final('base64');

    return encryptedText;
  }

  /**
   * aes256 복호화
   * @param {string} txt 복호화할 문자열
   * @returns 복호화된 문자열
   */
  aes256Decrypt(txt: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    let decryptedText = decipher.update(txt, 'base64', 'utf8');
    decryptedText += decipher.final('utf8');

    return decryptedText;
  }

  /**
   * 단방향 암호화
   * @param {string} originText 암호화할 문자열
   * @returns 암호된 문자 hex
   */
  createHash(originText: string): string {
    if (typeof originText !== 'string' || originText.length < 1) {
      throw new Error(
        `To dev) 의도되지 않은 값이 들어왔습니다. value: ${originText}, length: ${originText.length}, type: ${typeof originText}`,
      );
    }

    const salt = crypto.randomBytes(64).toString('base64');
    const encrypt = crypto.createHash('sha512').update(`${originText}${salt}`).digest('base64');
    const hashPwd = `${encrypt}${this.saltJar}${salt}`;

    return hashPwd;
  }

  /**
   * 해쉬문자열과 원본 문자열이 맞는지 체트
   * @param {string} hashText 해쉬 문자열
   * @param {string} originText 원본 문자열
   * @returns {boolean} 결과값
   */
  validateHash(hashText: string, originText: string): boolean {
    let result = false;

    const hashSplit = hashText.split(this.saltJar);
    if (hashSplit.length === 2) {
      const salt = hashSplit[1];
      const encrypt = crypto.createHash('sha512').update(`${originText}${salt}`).digest('base64');
      const hashPwd = `${encrypt}${this.saltJar}${salt}`;
      result = hashPwd === hashText;
    }

    return result;
  }

  /**
   * 입력받은 길이만큼의 랜덤 숫자로 이뤄진 string 반환
   */
  generateRandomInt(length: number): string {
    if (length <= 0) return '';

    // 최대 숫자 = 10^length
    const max = 10 ** length;

    // 0 ~ (10^length - 1) 사이 숫자 생성
    const value = crypto.randomInt(0, max);

    // length 맞춰서 zero-padding
    return value.toString().padStart(length, '0');
  }
}
