import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EvaluateManipDto, GetManipDto, ListOfManipDto } from './dto/seller-product-mgmt.dto';
import { IAuth } from '../../../auth/interface/auth.interface';
import {
  SPMListOfManipItemPayload,
  SPMListOfManipPayload,
  SPMManipPayload,
} from './payload/seller-product-mgmt.payload';
import { ErrorPayload } from '../../../common/payload/error.payload';
import {
  SPMManipActionEnum,
  SPMManipStatusEnum,
  SPMManipStatusMgmtEnum,
  SPMProductStatusEnum,
} from './enum/seller-product-mgmt.enum';
import {
  ISPMEvaluateApprovalCreation,
  ISPMEvaluateApprovalDeletion,
  ISPMEvaluateApprovalUpdate,
  ISPMManip,
  ISPMManipValue,
} from './interface/seller-product-mgmt.interface';

@Injectable()
export class SellerProductMgmtService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 상품 조작 요청 목록 조회
   */
  async listOfManip(data: ListOfManipDto): Promise<SPMListOfManipPayload> {
    try {
      const { offset, length, statusList, keyword } = data;

      const findManyArgsWhere: Prisma.ProductManipulationWhereInput = { deletedAt: null };
      if (statusList?.length) {
        findManyArgsWhere.status = { in: statusList };
      }

      if (keyword) {
        const escapedKeyword = this.prismaService.escape(keyword);
        findManyArgsWhere.OR = [
          {
            seller: {
              name: {
                contains: escapedKeyword,
              },
            },
          },
        ];
      }

      const count = await this.prismaService.productManipulation.count({
        where: findManyArgsWhere,
      });
      const list = await this.prismaService.productManipulation.findMany({
        select: {
          id: true,
          action: true,
          status: true,
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              nameKr: true,
              nameEn: true,
            },
          },
        },
        where: findManyArgsWhere,
        skip: offset,
        take: length,
      });

      return new SPMListOfManipPayload(
        count,
        list.map((v) => new SPMListOfManipItemPayload(v)),
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 조작 요청 조회
   */
  async getManip(data: GetManipDto): Promise<SPMManipPayload> {
    try {
      const { manipId } = data;

      const manip = await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          action: true,
          status: true,
          sellerId: true,
          categoryId: true,
          productId: true,
          value: true,
          user: {
            // 심사자
            select: {
              id: true,
              name: true,
            },
          },
          evaluatedAt: true,
          reviseReason: true,
          rejectReason: true,
          submitedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          id: manipId,
          deletedAt: null,
        },
      });

      return new SPMManipPayload(manip);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 조작 요청 심사
   */
  async evaluateManip(auth: IAuth, data: EvaluateManipDto): Promise<boolean> {
    try {
      const { manipId, status, reviseReason, rejectReason } = data;

      const manip = (await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          action: true,
          status: true,
          sellerId: true,
          categoryId: true,
          productId: true,
          value: true,
        },
        where: {
          id: manipId,
          deletedAt: null,
        },
      })) as ISPMManip;

      if (!manip) {
        throw new ErrorPayload('유효하지 않은 요청입니다.');
      }

      if (manip.status !== SPMManipStatusEnum.SUBMIT) {
        throw new ErrorPayload('심사할 수 있는 상태가 아닙니다.');
      }

      await this.prismaService.$transaction(async (tx) => {
        if (status === SPMManipStatusMgmtEnum.APPROVAL) {
          if (manip.action === SPMManipActionEnum.CREATE) {
            const param: ISPMEvaluateApprovalCreation = {
              categoryId: manip.categoryId,
              sellerId: manip.sellerId,
              value: manip.value,
            };
            await this.#evaluateApprovalCreation(tx, param);
          } else if (manip.action === SPMManipActionEnum.UPDATE) {
            const param: ISPMEvaluateApprovalUpdate = {
              productId: manip.productId,
              categoryId: manip.categoryId,
              value: manip.value,
            };
            await this.#evaluateApprovalUpdate(tx, param);
          } else if (manip.action === SPMManipActionEnum.DELETE) {
            const param: ISPMEvaluateApprovalDeletion = {
              productId: manip.productId,
            };
            await this.#evaluateApprovalDeletion(tx, param);
          }
        }

        // 상품조작요청 업데이트
        await tx.productManipulation.update({
          data: {
            status,
            evaluatorId: auth.id,
            evaluatedAt: new Date(),
            reviseReason,
            rejectReason,
          },
          where: {
            id: manip.id,
          },
        });
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품조작요청 승인 - 생성요청
   */
  async #evaluateApprovalCreation(
    tx: Prisma.TransactionClient,
    data: ISPMEvaluateApprovalCreation,
  ): Promise<boolean> {
    try {
      const { categoryId, sellerId, value } = data;
      const { nameKr, nameEn, thumbnailUrl, price, shippingFee, optionList, imageList } = value;

      if (!(nameKr && nameEn && typeof price === 'number' && 0 <= price)) {
        throw new ErrorPayload('상품의 이름 또는 가격이 올바르지 않습니다.');
      }

      // 상품 생성
      const product = await tx.product.create({
        select: { id: true },
        data: {
          categoryId: categoryId,
          sellerId: sellerId,
          status: SPMProductStatusEnum.ON,
          nameKr,
          nameEn,
          thumbnailUrl,
          price,
          shippingFee,
        },
      });

      // 상품 옵션 및 옵션 값 생성
      if (optionList?.length) {
        for (const option of optionList) {
          const o = await tx.productOption.create({
            select: {
              id: true,
            },
            data: {
              productId: product.id,
              categoryOptionId: option.categoryOptionId,
            },
          });

          for (const value of option.categoryOptionValueList) {
            await tx.productOptionValue.create({
              data: {
                productOptionId: o.id,
                categoryOptionValueId: value.categoryOptionValueId,
                extraCharge: value.extraCharge,
              },
            });
          }
        }
      }

      // 상품 이미지 생성
      if (imageList?.length) {
        for (let i = 0, len = imageList.length; i < len; i++) {
          await tx.productImage.create({
            data: {
              productId: product.id,
              url: imageList[i],
              sortOrder: i + 1,
            },
          });
        }
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품조작요청 승인 - 수정요청
   */
  async #evaluateApprovalUpdate(
    tx: Prisma.TransactionClient,
    data: ISPMEvaluateApprovalUpdate,
  ): Promise<boolean> {
    try {
      const { productId, categoryId, value } = data;

      const now = new Date();

      const { status, nameKr, nameEn, thumbnailUrl, price, shippingFee, optionList, imageList } =
        value as ISPMManipValue;

      const product = await tx.product.findUnique({
        select: {
          id: true,
          productOption: {
            select: {
              id: true,
              categoryOptionId: true,
              productOptionValue: {
                select: { id: true, categoryOptionValueId: true, extraCharge: true },
                where: { deletedAt: null },
              },
            },
            where: { deletedAt: null },
          },
          productImage: {
            select: {
              id: true,
              url: true,
              sortOrder: true,
            },
            where: { deletedAt: null },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        where: {
          id: productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      // 상품 업데이트
      await tx.product.update({
        data: {
          categoryId,
          status,
          nameKr,
          nameEn,
          thumbnailUrl,
          price,
          shippingFee,
        },
        where: { id: productId },
      });

      // 옵션 업데이트
      if (optionList?.length) {
        // 조작요청 value의 categoryOptionId 리스트
        const categoryOptionIdListOfManipValue = optionList.map((v) => v.categoryOptionId);
        // 상품 옵션의 categoryOptionId 리스트
        const categoryOptionIdListOfProduct = product.productOption.map((v) => v.categoryOptionId);

        // 삭제된 옵션 아이디 찾아서 삭제처리
        const deletedOptionIdList = categoryOptionIdListOfProduct.filter(
          (id) => !categoryOptionIdListOfManipValue.includes(id),
        );
        if (deletedOptionIdList?.length) {
          await tx.productOption.updateMany({
            data: { deletedAt: new Date() },
            where: {
              id: { in: deletedOptionIdList },
            },
          });
        }

        // 추가된 옵션 구분
        const addedOptionIdList = categoryOptionIdListOfManipValue.filter(
          (id) => !categoryOptionIdListOfProduct.includes(id),
        );
        // 추가된 옵션 생성 및 옵션 값 업데이트
        for (const option of optionList) {
          // 추가된 옵션 생성
          const productOption = product.productOption.find(
            (v) => v.categoryOptionId === option.categoryOptionId,
          );
          let productOptionId: number = productOption?.id;
          if (!productOptionId && addedOptionIdList.includes(option.categoryOptionId)) {
            const newProductOption = await tx.productOption.create({
              select: {
                id: true,
              },
              data: {
                productId: product.id,
                categoryOptionId: option.categoryOptionId,
              },
            });
            productOptionId = newProductOption.id;
          }

          // 옵션 값 업데이트
          const existOptionValueList = productOption?.productOptionValue || [];
          const valueIdListOfManip = option.categoryOptionValueList.map(
            (v) => v.categoryOptionValueId,
          );
          const existValueIdList = existOptionValueList.map((v) => v.categoryOptionValueId);

          // 삭제된 옵션 값 찾아서 삭제처리
          const deletedValueIdList = existValueIdList.filter(
            (id) => !valueIdListOfManip.includes(id),
          );
          if (deletedValueIdList.length) {
            await tx.productOptionValue.updateMany({
              data: { deletedAt: now },
              where: {
                productOptionId,
                categoryOptionValueId: { in: deletedValueIdList },
              },
            });
          }

          // 옵션 값 생성 및 수정
          for (const val of option.categoryOptionValueList) {
            const existValue = existOptionValueList.find(
              (v) => v.categoryOptionValueId === val.categoryOptionValueId,
            );
            if (existValue) {
              await tx.productOptionValue.update({
                data: { extraCharge: val.extraCharge, updatedAt: now },
                where: { id: existValue.id },
              });
            } else {
              await tx.productOptionValue.create({
                data: {
                  productOptionId,
                  categoryOptionValueId: val.categoryOptionValueId,
                  extraCharge: val.extraCharge,
                },
              });
            }
          }
        }
      }
      // 옵션 리스트가 없다면 해당 상품의 모든 옵션 및 옵션값 삭제처리
      else {
        const ol = await tx.productOption.findMany({
          select: { id: true },
          where: {
            productId: product.id,
            deletedAt: null,
          },
        });

        // 옵션 값 삭제
        await tx.productOptionValue.updateMany({
          data: { deletedAt: now },
          where: {
            productOptionId: {
              in: ol.map((v) => v.id),
            },
          },
        });

        // 옵션 삭제
        await tx.productOption.updateMany({
          data: { deletedAt: now },
          where: { productId: product.id },
        });
      }

      // 이미지 업데이트
      if (imageList?.length) {
        const existImageList = product.productImage;
        const existImageMap = new Map(existImageList.map((img) => [img.url, img]));

        const urlsToDelete = existImageList
          .filter((img) => !imageList.includes(img.url))
          .map((img) => img.url);

        // 삭제된 이미지 삭제처리
        if (urlsToDelete.length) {
          await tx.productImage.updateMany({
            data: { deletedAt: now },
            where: {
              productId: product.id,
              url: { in: urlsToDelete },
              deletedAt: null,
            },
          });
        }

        // 이미지 순서 업데이트 및 생성
        for (let i = 0; i < imageList.length; i++) {
          const url = imageList[i];
          const sortOrder = i + 1;

          const existImage = existImageMap.get(url);
          if (existImage) {
            // 순서 update
            if (existImage.sortOrder !== sortOrder) {
              await tx.productImage.update({
                data: { sortOrder, updatedAt: now },
                where: { id: existImage.id },
              });
            }
          } else {
            // 새로 추가된 이미지
            await tx.productImage.create({
              data: {
                productId: product.id,
                url,
                sortOrder,
              },
            });
          }
        }
      }
      // 이미지 리스트가 없다면 모든 이미지 삭제처리
      else {
        await tx.productImage.updateMany({
          data: { deletedAt: now },
          where: { productId: product.id },
        });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품조작요청 승인 - 삭제요청
   */
  async #evaluateApprovalDeletion(
    tx: Prisma.TransactionClient,
    data: ISPMEvaluateApprovalDeletion,
  ) {
    try {
      const { productId } = data;

      await tx.product.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id: productId,
        },
      });
    } catch (e) {
      throw e;
    }
  }
}
