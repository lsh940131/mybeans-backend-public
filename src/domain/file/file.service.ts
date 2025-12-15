import { Injectable } from '@nestjs/common';
import { IAuth } from '../../auth/interface/auth.interface';
import { FileCreateUploadUrlDto } from './dto/file.dto';
import { ErrorPayload } from '../../common/payload/error.payload';
import { StorageService } from '../../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FileCreateUploadUrlPayload } from './payload/file.payload';

@Injectable()
export class FileService {
  constructor(private readonly storageService: StorageService) {}

  /**
   * presigned upload url 생성
   */
  async createUploadUrl(auth: IAuth, data: FileCreateUploadUrlDto): Promise<any> {
    try {
      const { id, sellerId } = auth;
      const { target, filename, contentType } = data;

      let key: string;
      switch (target) {
        case 'USER_IMAGE':
          key = `user/${id}/image`;
          break;
        case 'SELLER_APPL':
          key = `user/${id}/seller-application`;
          break;
        case 'SELLER_IMAGE':
          if (!sellerId) throw new ErrorPayload('판매자가 아닙니다.');
          key = `seller/${sellerId}/image`;
          break;
        case 'PRODUCT':
          if (!sellerId) throw new ErrorPayload('판매자가 아닙니다.');
          key = `seller/${sellerId}/products`;
          break;
      }

      const uniqueFileName = this.makeUniqueFileName(filename);
      key += `/${uniqueFileName}`;

      const presigned = await this.storageService.createUploadUrl(key, contentType);

      return new FileCreateUploadUrlPayload(presigned);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 유니크 파일명 제너레이터
   */
  private makeUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase(); // ".png"
    const base = uuidv4().replace(/-/g, ''); // uuid (하이픈 제거)
    const ts = Date.now(); // timestamp(ms)
    return `${base}_${ts}${ext}`; // uuid_timestamp.png
  }
}
