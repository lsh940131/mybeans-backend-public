import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IAuth } from '../../../auth/interface/auth.interface';
import { GetDto, EvaluateDto, ListDto } from './dto/seller-appl-mgmt.dto';
import { SAMListItemPayload, SAMListPayload, SAMPayload } from './payload/seller-appl-mgmt.payload';
import { ISAM, ISAMFile, ISAMListItem, ISAMUser } from './interface/seller-appl-mgmt.interface';
import { EvaluateEnum, StatusEnum, StatusHangulEnum } from './enum/seller-appl-mgmt.enum';
import { ErrorPayload } from '../../../common/payload/error.payload';

@Injectable()
export class SellerApplMgmtService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 판매자 자격 신청 목록 조회
   */
  async list(data: ListDto): Promise<SAMListPayload> {
    try {
      const { offset, length, statusList, keyword } = data;

      const findManyArgsWhere: Prisma.SellerApplicationWhereInput = { deletedAt: null };
      if (statusList?.length) {
        findManyArgsWhere.status = { in: statusList };
      }

      if (keyword) {
        const escapedKeyword = this.prismaService.escape(keyword);
        findManyArgsWhere.OR = [
          { storeName: { contains: escapedKeyword } },
          { businessNumber: { contains: escapedKeyword } },
        ];
      }

      const count = await this.prismaService.sellerApplication.count({ where: findManyArgsWhere });
      const list = await this.prismaService.sellerApplication.findMany({
        select: {
          id: true,
          status: true,
          businessNumber: true,
          storeName: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: findManyArgsWhere,
        skip: offset,
        take: length,
      });

      const listPayload = list.map((v) => {
        const data: ISAMListItem = {
          ...v,
        };
        const user: ISAMUser = v.user;
        return new SAMListItemPayload(data, user);
      });

      return new SAMListPayload(count, listPayload);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 판매자 자격 신청 조회
   */
  async get(data: GetDto): Promise<SAMPayload> {
    try {
      const { id } = data;

      const sellerApplication = await this.prismaService.sellerApplication.findUnique({
        select: {
          id: true,
          status: true,
          step: true,
          businessNumber: true,
          storeName: true,
          businessType: true,
          businessAddress: true,
          businessCategory: true,
          businessItem: true,
          mailOrderSalesNumber: true,
          ownerType: true,
          ownerName: true,
          ownerBirth: true,
          ownerGender: true,
          ownerNationality: true,
          ownerPhone: true,
          ownerAddress: true,
          ownerEmail: true,
          ownerBankCode: true,
          ownerAccount: true,
          ownerJob: true,
          shippingName: true,
          shippingAddress: true,
          shippingPhone1: true,
          shippingPhone2: true,
          returnName: true,
          returnAddress: true,
          returnPhone1: true,
          returnPhone2: true,
          bankCode: true,
          accountHolder: true,
          accountNumber: true,
          contactName: true,
          contactPhone: true,
          contactEmail: true,
          reviseReason: true,
          rejectReason: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          sellerApplicationFile: {
            select: {
              id: true,
              url: true,
            },
            where: {
              deletedAt: null,
            },
          },
        },
        where: { id, deletedAt: null },
      });

      return new SAMPayload(sellerApplication);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 판매자 자격 신청서 심사
   */
  async evaluate(auth: IAuth, data: EvaluateDto): Promise<boolean> {
    try {
      const { id, status, reviseReason, rejectReason } = data;

      const sellerApplication = await this.prismaService.sellerApplication.findUnique({
        select: {
          id: true,
          userId: true,
          status: true,
          storeName: true,
        },
        where: {
          id,
          deletedAt: null,
        },
      });
      if (!sellerApplication) {
        throw new ErrorPayload('유효하지 않은 신청서입니다.');
      }
      if (sellerApplication.status != StatusEnum.SUBMIT) {
        throw new ErrorPayload(
          `사용자가 제출 완료한 후에 심사가 가능합니다. 현재 신청서 상태: ${StatusHangulEnum[sellerApplication.status]}`,
        );
      }

      await this.prismaService.sellerApplication.update({
        where: { id, deletedAt: null },
        data: {
          evaluatorId: auth.id,
          evaluatedAt: new Date(),
          status,
          reviseReason,
          rejectReason,
        },
      });

      // 승인 처리
      if (status == EvaluateEnum.APPROVAL) {
        // 사용자 정보 업데이트
        await this.prismaService.user.update({
          data: {
            isSeller: true,
          },
          where: {
            id: sellerApplication.userId,
          },
        });

        // 판매자 데이터 생성
        await this.prismaService.seller.create({
          data: {
            sellerApplicationId: sellerApplication.id,
            userId: sellerApplication.userId,
            name: sellerApplication.storeName,
          },
        });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }
}
