import { Injectable } from '@nestjs/common';
import { IAuth } from '../../auth/interface/auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { SellerListItemPayload, SellerListPayload, SellerPayload } from './payload/seller.payload';
import { SellerGetDto, SellerListDto, SellerUpdateDto } from './dto/seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: SellerListDto): Promise<SellerListPayload> {
    try {
      const { offset, length } = data;

      const count = await this.prismaService.seller.count({});
      const list = await this.prismaService.seller.findMany({
        select: {
          id: true,
          name: true,
          image: true,
        },
        skip: offset,
        take: length,
      });

      return new SellerListPayload(
        count,
        list.map((v) => new SellerListItemPayload(v)),
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * 판매자 정보 조회
   */
  async get(data: SellerGetDto): Promise<SellerPayload> {
    try {
      const { sellerId } = data;

      const seller = await this.prismaService.seller.findUnique({
        select: {
          id: true,
          name: true,
          image: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        where: {
          id: sellerId,
        },
      });

      return new SellerPayload(seller);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 판매자 정보 수정
   */
  async update(auth: IAuth, data: SellerUpdateDto) {
    try {
      const { sellerId } = auth;
      const { name, image, freeShippingThreshold } = data;

      // 수정하려는 항목이 없을 경우
      if (!name && image === undefined && freeShippingThreshold === undefined) return true;

      await this.prismaService.seller.update({
        data: {
          name,
          image,
          freeShippingThreshold,
        },
        where: {
          id: sellerId,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
