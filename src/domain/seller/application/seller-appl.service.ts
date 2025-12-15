import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApplyTempDto } from './dto/seller-appl.dto';
import { IAuth } from '../../../auth/interface/auth.interface';
import { ISATemp } from './interface/seller-appl.interface';
import { SellerApplStatusEnum } from './enum/seller-appl.enum';
import { ErrorPayload } from '../../../common/payload/error.payload';
import { SAPayload } from './payload/seller-appl.payload';

@Injectable()
export class SellerApplService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 판매자 자격 신청 임시 저장
   *
   * 필수서류:
   *    - 사업자등록증 사본 1부 (발급일 1년 이내)
   *    - 대표자/사업자/법인 명의 통장 사본 1부
   *    - 통신판매업 신고증 사본
   *    - (해당하는 경우) 대표자/법인 인감증명서 사본 1부 (발급일 3개월 이내)
   *    - (해당하는 경우) 법인등기사항전부증명서 사본 1부 (발급일 3개월 이내)
   *
   * 데이터:
   *    1. 사업자등록번호 ('-' 제외한 숫자만 입력)
   *    2. 사업장 정보
   *        - 상호, 사업자등록번호, 사업자구분(개인/법인), 사업장주소, 업태, 업종, 통신판매업 신고번호
   *    3. 대표자 정보
   *        - 대표자 구성(1인/공동), 대표자명(대표자 명의 휴대전화 인증/직접입력(인감증명서 필수)), 대표자 생년월일, 성별, 대표자 국적(내/외국인)
   *    4. 배송 정보
   *        - 출고지 정보 (이름, 주소, 연락처1, 연락처 2(선택))
   *        - 반품/교환지 정보 (이름, 주소, 연락처1, 연락처 2(선택))
   *    5. 정산 정보
   *        - 은행, 예금주명, 계좌번호
   *        * 정산기준 (구매확정, 반품완료, 교환완료)일로부터 1영업일 째 되는 날
   *    6. 담당자 정보
   *        - 이름, 본인인증 (휴대전화, 이메일)
   *    7. 대표자 추가 정보 (전자상거래 소비자보호에 관한 법률에 의거)
   *        - 이름, 본인인증 (휴대전화 or 신분증 제출), 생년월일, 성별, 국적(내/외국인), 실거주지 주소, email, 연락처, 계좌번호, 직업
   */
  async temp(auth: IAuth, data: ApplyTempDto): Promise<boolean> {
    try {
      const sa = await this.prismaService.sellerApplication.findFirst({
        select: { id: true, status: true },
        where: { userId: auth.id, deletedAt: null },
      });

      const now = new Date();
      let sellerApplicationId: number = sa?.id;

      // 작성한 판매자 자격 신청서가 있고, 상태가 TEMP, REVISE가 아닐 경우 에러
      if (
        sa &&
        ![SellerApplStatusEnum.TEMP, SellerApplStatusEnum.REVISE].includes(
          sa.status as SellerApplStatusEnum,
        )
      ) {
        throw new ErrorPayload('올바르지 않은 절차입니다. 고객센터로 문의주시기 바랍니다.');
      }

      const params: ISATemp = {
        userId: auth.id,
        status: SellerApplStatusEnum.TEMP,
        step: undefined,
        businessNumber: undefined,
        storeName: undefined,
        businessType: undefined,
        businessAddress: undefined,
        businessCategory: undefined,
        businessItem: undefined,
        mailOrderSalesNumber: undefined,
        ownerType: undefined,
        ownerName: undefined,
        ownerBirth: undefined,
        ownerGender: undefined,
        ownerNationality: undefined,
        ownerPhone: undefined,
        ownerAddress: undefined,
        ownerEmail: undefined,
        ownerBankCode: undefined,
        ownerAccount: undefined,
        ownerJob: undefined,
        shippingName: undefined,
        shippingAddress: undefined,
        shippingPhone1: undefined,
        shippingPhone2: undefined,
        returnName: undefined,
        returnAddress: undefined,
        returnPhone1: undefined,
        returnPhone2: undefined,
        bankCode: undefined,
        accountHolder: undefined,
        accountNumber: undefined,
        contactName: undefined,
        contactPhone: undefined,
        contactEmail: undefined,
      };
      for (const key in params) {
        params[key] = data[key] !== undefined ? data[key] : params[key];
      }

      // create
      if (!sa) {
        const created = await this.prismaService.sellerApplication.create({
          data: params,
        });

        sellerApplicationId = created.id;
      }
      // update
      else {
        await this.prismaService.sellerApplication.update({
          data: { ...params, updatedAt: now },
          where: {
            id: sa.id,
          },
        });
      }

      const { uploadFileList, deleteFileList } = data;
      // 첨부파일 업로드
      if (uploadFileList?.length) {
        const filesParams: Prisma.SellerApplicationFileCreateManyInput[] = uploadFileList.map(
          (v) => ({
            sellerApplicationId: sellerApplicationId,
            url: v,
          }),
        );
        await this.prismaService.sellerApplicationFile.createMany({
          data: filesParams,
        });
      }
      // 업로드된 첨부파일 삭제
      if (deleteFileList?.length) {
        await this.prismaService.sellerApplicationFile.updateMany({
          where: { id: { in: deleteFileList }, sellerApplicationId: sellerApplicationId },
          data: { deletedAt: now },
        });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 판매자 자격 신청
   * 임시 저장한 정보로 자격 신청
   * 필수값 체크
   */
  async create(auth: IAuth): Promise<boolean> {
    try {
      const sa = await this.prismaService.sellerApplication.findFirst({
        select: {
          id: true,
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
        },
        where: {
          userId: auth.id,
          status: {
            in: [SellerApplStatusEnum.TEMP, SellerApplStatusEnum.REVISE],
          },
        },
      });

      if (!sa) {
        throw new ErrorPayload('올바르지 않은 절차입니다. 고객센터로 문의주시기 바랍니다.');
      }

      const nnFields = [
        'businessNumber',
        'storeName',
        'businessType',
        'businessAddress',
        'businessCategory',
        'businessItem',
        'mailOrderSalesNumber',
        'ownerType',
        'ownerName',
        'ownerBirth',
        'ownerGender',
        'ownerNationality',
        'ownerPhone',
        'ownerAddress',
        'ownerEmail',
        'ownerBankCode',
        'ownerAccount',
        'ownerJob',
        'shippingName',
        'shippingAddress',
        'shippingPhone1',
        'returnName',
        'returnAddress',
        'returnPhone1',
        'bankCode',
        'accountHolder',
        'accountNumber',
        'contactName',
        'contactPhone',
        'contactEmail',
      ];

      const nullFields = [];
      for (const fields of nnFields) {
        if (!sa[fields]) {
          nullFields.push(fields);
        }
      }

      if (nullFields.length) {
        throw new ErrorPayload(`다음 필드들의 값을 입력해주세요. ${nullFields.join(', ')}`);
      } else {
        await this.prismaService.sellerApplication.update({
          where: { id: sa.id },
          data: { status: SellerApplStatusEnum.SUBMIT },
        });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 사용자(자신)이 작성한 판매자 자격 신청 조회
   */
  async get(auth: IAuth): Promise<SAPayload> {
    try {
      const sa = await this.prismaService.sellerApplication.findFirst({
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
        where: { userId: auth.id, deletedAt: null },
      });

      const result = new SAPayload(sa);

      return result;
    } catch (e) {
      throw e;
    }
  }
}
