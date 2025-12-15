import { S3 } from 'aws-sdk';
import * as path from 'path';
import * as fs from 'fs';
import { ulid } from 'ulid';

export class Storage {
  private readonly s3: S3;
  private readonly bucket: string;

  constructor() {
    const STORAGE_TYPE = 'minio',
      STORAGE_REGION = 'ap-northeast-2',
      STORAGE_ENDPOINT = 'http://localhost:9000',
      STORAGE_BUCKET = 'mybeans-local',
      STORAGE_ACCESS_KEY = 'minioadmin',
      STORAGE_SECRET_KEY = 'minioadmin';

    const storageType = STORAGE_TYPE ?? 'minio'; // minio | s3
    this.bucket = STORAGE_BUCKET!;

    this.s3 = new S3({
      endpoint: STORAGE_ENDPOINT,
      accessKeyId: STORAGE_ACCESS_KEY,
      secretAccessKey: STORAGE_SECRET_KEY,
      region: STORAGE_REGION,
      s3ForcePathStyle: storageType === 'minio' ? true : undefined,
      signatureVersion: storageType === 'minio' ? 'v4' : undefined,
    });
  }

  /**
   * 버킷 존재 보장
   */
  async ensureBucket(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      // 존재하면 그냥 통과
    } catch (err: any) {
      if (err.code === 'NotFound' || err.statusCode === 404 || err.code === 'NoSuchBucket') {
        console.log(`📦 Bucket "${this.bucket}" not found. Creating...`);
        // 존재하지 않으면 생성
        await this.s3.createBucket({ Bucket: this.bucket }).promise();
        console.log(`✅ Bucket "${this.bucket}" created.`);
      } else {
        console.error('❌ Failed to check/create bucket:', err);
        throw err;
      }
    }
  }

  /**
   * 파일 업로드
   * @param filePathName 업로드할 파일
   * @param key 저장할 위치/파일명
   * @return url 링크
   */
  async upload(filePathName: string, key: string): Promise<string> {
    const fileStream = fs.createReadStream(filePathName);
    const contentType = this.getMimeType(filePathName);

    if (!this.checkPath(key)) {
      this.ensurePathExists(key);
    }

    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    };

    const result = await this.s3.upload(uploadParams).promise();

    return result.Location;
  }

  /**
   * 파일 확장자로 contentType 반환
   * @param filePath
   * @returns contentType
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    let contentType: string = 'application/octet-stream';
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }

    return contentType;
  }

  /**
   * key의 path 유효 여부 체크
   * @param key
   */
  async checkPath(key: string): Promise<boolean> {
    const pathParts = key.split('/');
    if (pathParts.length <= 1) {
      return true; // 루트에 있는 파일이면 디렉토리 없음 → 통과
    }

    // 파일명을 제외한 디렉토리 prefix 구성
    const prefix = pathParts.slice(0, -1).join('/') + '/';

    const params = {
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: 1,
    };

    try {
      const result = await this.s3.listObjectsV2(params).promise();
      return (result.Contents?.length ?? 0 > 0) ? true : false;
    } catch (err) {
      return false;
    }
  }

  /**
   * MinIO/S3 상에서 경로 prefix를 강제로 생성
   * 경로가 디렉토리처럼 보이게 하려면 "더미파일"을 업로드해야 함
   * @param key
   */
  async ensurePathExists(key: string): Promise<void> {
    const pathParts = key.split('/');
    if (pathParts.length <= 1) {
      return; // 루트에 있는 파일이면 디렉토리 없음 → 통과
    }

    // 파일명을 제외한 디렉토리 prefix 구성
    const prefix = pathParts.slice(0, -1).join('/') + '/';

    const dummyKey = `${prefix}.keep`; // 플레이스홀더 파일
    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: dummyKey,
      Body: '',
      ContentType: 'application/x-directory', // 또는 text/plain
    };

    await this.s3.upload(uploadParams).promise();
  }

  /**
   * 폴더 삭제
   * MinIO/S3 엔 폴더 개념 없이 파일패스이므로 prefix와 일치하는 모든 파일 삭제
   * @param prefix
   */
  async deleteS3Folder(prefix: string): Promise<void> {
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const listResponse = await this.s3
        .listObjectsV2({
          Bucket: this.bucket,
          Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
          ContinuationToken: continuationToken,
        })
        .promise();

      const objects = (listResponse.Contents || []).map((obj) => ({ Key: obj.Key! }));

      if (objects.length > 0) {
        await this.s3
          .deleteObjects({
            Bucket: this.bucket,
            Delete: { Objects: objects },
          })
          .promise();
      }

      isTruncated = listResponse.IsTruncated ?? false;
      continuationToken = listResponse.NextContinuationToken;
    }
  }

  /**
   * 겹치지 않는 파일명 만들기
   */
  generateKey(originalFilename: string) {
    const ext = path.extname(originalFilename);
    return `${ulid()}${ext}`;
  }
}
