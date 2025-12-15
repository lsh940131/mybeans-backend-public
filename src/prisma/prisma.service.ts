import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['error'],
      // log: ['error', 'query'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  /**
   * keyword 검색 등 사용자 입력 값을 검색할 때 사용
   */
  escape(str: string): string {
    const escapeChars = /[%_\[]/g;

    return str.replace(escapeChars, (char) => {
      switch (char) {
        case '%':
          return '[%]';
        case '_':
          return '[_]';
        case '[':
          return '[[]';
        default:
          return char;
      }
    });
  }
}
