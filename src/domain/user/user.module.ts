import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CryptoModule } from '../../common/crypto/crypto.module';
import { AuthModule } from '../../auth/auth.module';
import { StorageModule } from '../../storage/storage.module';
import { ConfigModule } from '@nestjs/config';
import { UserAddressModule } from './address/user-address.module';
import { MypageModule } from './mypage/mypage.module';

@Module({
  imports: [PrismaModule, CryptoModule, AuthModule, StorageModule, ConfigModule, UserAddressModule, MypageModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
