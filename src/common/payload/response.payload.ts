import { ApiProperty } from '@nestjs/swagger';
import { ErrorPayload } from './error.payload';

export class ResponsePayload {
  constructor(data: any = null, error: ErrorPayload = null) {
    this.data = data;
    this.error = error;
  }

  @ApiProperty({ description: 'response', default: null, required: false })
  data: any;

  @ApiProperty({
    description: '응답 성공일 때 null. 에러가 났을 경우 참조. 형태는 ErrorPayload',
    default: null,
    nullable: true,
    required: false,
  })
  error?: ErrorPayload;
}
