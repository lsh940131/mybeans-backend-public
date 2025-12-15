import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuth } from '../../../auth/interface/auth.interface';
import { UACreateDto, UADeleteDto, UAUpdateDto } from './dto/user-address.dto';
import { ErrorPayload } from '../../../common/payload/error.payload';
import { orderByLatestTimestamp } from 'src/common';
import { UAListItemPayload } from './payload/user-address.payload';

@Injectable()
export class UserAddressService {
  #LIMIT = 50;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 배송지 추가
   * 최대 등록 가능 개수 #LIMIT
   */
  async create(auth: IAuth, data: UACreateDto): Promise<number> {
    try {
      const { name, receiverName, phone, address, addressDetail, postcode, isDefault } = data;

      const registedCount = await this.prismaService.userAddress.count({
        where: {
          userId: auth.id,
          deletedAt: null,
        },
      });

      if (this.#LIMIT <= registedCount) {
        throw new ErrorPayload(`배송지는 최대 ${this.#LIMIT}개까지 저장할 수 있습니다.`);
      }

      const id = await this.prismaService.$transaction(async (tx) => {
        const created = await tx.userAddress.create({
          select: {
            id: true,
          },
          data: {
            userId: auth.id,
            name,
            receiverName,
            phone,
            address,
            addressDetail,
            postcode,
            isDefault,
          },
        });

        // 생성한 주소를 기본 배송지로 설정할 경우, 기존 배송지는 전부 false로 수정
        if (isDefault == true) {
          await tx.userAddress.updateMany({
            data: { isDefault: false },
            where: {
              userId: auth.id,
              NOT: { id: created.id },
            },
          });
        }

        return created.id;
      });

      return id;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 배송지 목록 조회
   */
  async list(auth: IAuth): Promise<UAListItemPayload[]> {
    try {
      const list = await this.prismaService.userAddress.findMany({
        select: {
          id: true,
          name: true,
          receiverName: true,
          phone: true,
          address: true,
          addressDetail: true,
          postcode: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          userId: auth.id,
          deletedAt: null,
        },
      });

      if (list.length == 0) return [];

      // 생성일과 수정일 중 큰 값으로 내림차순 정렬
      const ordered = orderByLatestTimestamp(list, 'desc');

      // 기본 배송지를 리스트 맨앞에 위치시키기
      const defaultIdx = ordered.findIndex((v) => v.isDefault);
      if (defaultIdx > 0) {
        const [defaultAddress] = ordered.splice(defaultIdx, 1);
        ordered.unshift(defaultAddress);
      }

      return ordered.map((v) => new UAListItemPayload(v));
    } catch (e) {
      throw e;
    }
  }

  /**
   * 배송지 수정
   */
  async update(auth: IAuth, data: UAUpdateDto): Promise<boolean> {
    try {
      const { id, name, receiverName, phone, address, addressDetail, postcode, isDefault } = data;

      const exist = await this.prismaService.userAddress.findUnique({
        select: {
          id: true,
          name: true,
          receiverName: true,
          phone: true,
          address: true,
          addressDetail: true,
          postcode: true,
          isDefault: true,
        },
        where: {
          id,
          userId: auth.id,
          deletedAt: null,
        },
      });

      if (!exist) {
        throw new ErrorPayload('유효하지 않은 배송지입니다.');
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.userAddress.update({
          data: {
            name: name ? name : exist.name,
            receiverName: receiverName ? receiverName : exist.receiverName,
            postcode: postcode === null ? null : postcode,
            address: address ? address : exist.address,
            addressDetail: addressDetail === null ? null : addressDetail,
            phone: phone ? phone : exist.phone,
            isDefault: typeof isDefault === 'boolean' ? isDefault : exist.isDefault,
            updatedAt: new Date(),
          },
          where: {
            id,
          },
        });

        // 생성한 주소를 기본 배송지로 설정할 경우, 기존 배송지는 전부 false로 수정
        if (isDefault == true) {
          await tx.userAddress.updateMany({
            data: { isDefault: false },
            where: {
              userId: auth.id,
              NOT: { id },
            },
          });
        }
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 배송지 삭제
   */
  async delete(auth: IAuth, data: UADeleteDto): Promise<boolean> {
    try {
      const { id } = data;

      // 유효하지 않은 아이디는 무시하기 위해 updateMany 사용
      await this.prismaService.userAddress.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id,
          userId: auth.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
