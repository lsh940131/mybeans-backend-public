import { ApiProperty } from '@nestjs/swagger';
import { IFileCreateUploadUrl } from '../interface/file.interface';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileCreateUploadUrlPayload {
  constructor(data: IFileCreateUploadUrl) {
    this.url = data.url;
    this.fields = data.fields;
  }

  @ApiProperty({ description: '저장소 url' })
  @IsNotEmpty()
  @IsString()
  readonly url: string;

  @ApiProperty({
    description: 'S3 Presigned POST fields',
    // Swagger에서 "key: string -> value: string" 오브젝트로 보이게
    additionalProperties: { type: 'string' },
    example: {
      'Content-Type': 'image/jpeg',
      bucket: 'mybeans-local',
      key: 'user/1/image/...',
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': '...',
      'X-Amz-Date': '...',
      Policy: '...',
      'X-Amz-Signature': '...',
    },
  })
  readonly fields: Record<string, string>;
}
