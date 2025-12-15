import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { exec } from 'child_process';

@Controller('cron')
@ApiTags('cron')
export class CronController {
  @Post('/cart/clean')
  @ApiOperation({
    summary: '장바구니 정리',
    description: '장바구니에 추가된지 90일이 초과된 상품 삭제처리',
  })
  cleanCart() {
    exec('npm run cron clean-cart');
  }
}
