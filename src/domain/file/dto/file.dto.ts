import { ApiPropertyEnum } from '../../../common/decorator/api-property-enum.decorator';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FileUploadTarget } from '../enum/file.enum';
import { ApiProperty } from '@nestjs/swagger';

export class FileCreateUploadUrlDto {
  @ApiPropertyEnum({
    description: '업로드 타겟',
    enums: [{ name: 'FileUploadTarget', enum: FileUploadTarget }],
    default: FileUploadTarget.USER_IMAGE,
  })
  @IsEnum(FileUploadTarget)
  readonly target: FileUploadTarget;

  @ApiProperty({ description: '파일이름', default: 'profile.jpeg' })
  @IsNotEmpty()
  @IsString()
  readonly filename: string;

  @ApiProperty({ description: '파일타입', default: 'image/jpeg' })
  @IsNotEmpty()
  @IsString()
  readonly contentType: string;
}
