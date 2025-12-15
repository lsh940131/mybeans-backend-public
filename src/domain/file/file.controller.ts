import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { FileService } from './file.service';
import { Auth } from '../../auth/decorator/auth.decorator';
import { IAuth } from '../../auth/interface/auth.interface';
import { FileCreateUploadUrlDto } from './dto/file.dto';
import { FileCreateUploadUrlPayload } from './payload/file.payload';

@Controller('file')
@ApiTags('file')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-url')
  @ApiOperation({
    summary: 'presigned 업로드 URL 발급',
    description:
      'POST로 url에 fields 전체와 업로드할 파일을 file이라는 key로 FormData에 담아 body에 실어서 업로드 요청',
  })
  async createUploadUrl(
    @Auth() auth: IAuth,
    @Body() body: FileCreateUploadUrlDto,
  ): Promise<FileCreateUploadUrlPayload> {
    return this.fileService.createUploadUrl(auth, body);
  }
}
