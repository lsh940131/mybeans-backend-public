import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { createPresignedPost, PresignedPost } from '@aws-sdk/s3-presigned-post';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorPayload } from '../common/payload/error.payload';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const storageType = this.configService.get<string>('STORAGE_TYPE') ?? 'minio'; // minio | s3
    this.bucket = this.configService.get<string>('STORAGE_BUCKET');

    this.s3 = new S3Client({
      endpoint: this.configService.get<string>('STORAGE_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('STORAGE_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('STORAGE_SECRET_KEY'),
      },
      region: this.configService.get<string>('STORAGE_REGION'),
      forcePathStyle: storageType === 'minio' ? true : undefined, // MinIO는 true, S3는 false (or 생략)
    });
  }

  /**
   * 파일 업로드
   * @param filePathName upload 아래에 있는 폴더/파일명
   */
  async upload(filePathName: string): Promise<PutObjectCommandOutput> {
    try {
      const fileFullPath = path.join('upload', filePathName);
      const fileStream = fs.createReadStream(fileFullPath);
      const contentType = this.getMimeType(fileFullPath);

      const uploadParams = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePathName,
        Body: fileStream,
        ContentType: contentType,
      });

      const result = await this.s3.send(uploadParams);

      return result;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 파일명 확장자에 따른 contentType 반환
   * @param filePathName upload 아래에 있는 폴더/파일명
   */
  private getMimeType(filePathName: string): string {
    try {
      const ext = path.extname(filePathName).toLowerCase();
      if (ext === '.png') return 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
      if (ext === '.gif') return 'image/gif';
      return 'application/octet-stream';
    } catch (e) {
      throw e;
    }
  }

  /**
   * signed upload url 생성
   */
  async createUploadUrl(key: string, contentType: string): Promise<PresignedPost> {
    try {
      const { startsWithCond, eqCond, maxBytes } = this.buildPolicyConstraints(contentType);

      const conditions: any[] = [['content-length-range', 0, maxBytes]];

      // Content-Type 조건: image/*, video/* 는 starts-with, pdf는 eq
      if (startsWithCond) {
        conditions.push(['starts-with', '$Content-Type', startsWithCond]);
      }
      if (eqCond) {
        conditions.push(['eq', '$Content-Type', eqCond]);
      }

      const presigned: PresignedPost = await createPresignedPost(this.s3, {
        Bucket: this.bucket,
        Key: key,
        Conditions: conditions,
        Fields: {
          'Content-Type': contentType,
        },
        Expires: 5 * 60,
      });

      return presigned;
    } catch (e) {
      throw e;
    }
  }

  /**
   * signed upload url 제한 조건
   */
  private buildPolicyConstraints(contentType: string): {
    startsWithCond?: string; // e.g. 'image/' | 'video/'
    eqCond?: string; // e.g. 'application/pdf'
    maxBytes: number;
  } {
    const ct = (contentType || '').toLowerCase();

    // 이미지: 10MB
    if (ct.startsWith('image/')) {
      return { startsWithCond: 'image/', maxBytes: 10 * 1024 * 1024 };
    }

    // PDF: 20MB
    if (ct === 'application/pdf') {
      return { eqCond: 'application/pdf', maxBytes: 20 * 1024 * 1024 };
    }

    // 동영상: 400MB
    // if (ct.startsWith('video/')) {
    //   return { startsWithCond: 'video/', maxBytes: 400 * 1024 * 1024 };
    // }

    // 그 외 거부
    throw new ErrorPayload(`Unsupported Content-Type: ${contentType}`);
  }
}
