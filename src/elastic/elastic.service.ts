import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { SearchResponseBody } from '@elastic/elasticsearch/lib/api/types';
import { Transport } from '@elastic/transport';
import { ESearchDto } from './dto/elastic.dto';
import { IESearchProduct } from './interface/elastic.interface';
import { ESearchProductListPayload, ESearchProductPayload } from './payload/elastic.payload';

@Injectable()
export class ElasticService {
  private client: Client;
  private index: string = 'mybeans_products';

  constructor(private readonly configService: ConfigService) {
    const esUrl = this.configService.get<string>('ELASTICSEARCH_URL');
    this.client = new Client({
      node: esUrl,
      Transport: class extends Transport {
        // 현재 es 와 버전 호환 이슈가 있어서 버전 8로 명시
        constructor(opts: any) {
          super({
            ...opts,
            headers: {
              accept: 'application/vnd.elasticsearch+json; compatible-with=8',
              'content-type': 'application/vnd.elasticsearch+json; compatible-with=8',
            },
          });
        }
      },
    });
  }

  async search(data: ESearchDto): Promise<ESearchProductListPayload> {
    const {
      offset,
      length,
      keyword,
      categoryIdList,
      sellerIdList,
      isSingle,
      isBlend,
      isSpecialty,
      isDecaf,
    } = data;

    const must: any[] = [];

    try {
      if (keyword) {
        must.push({
          multi_match: {
            query: keyword,
            fields: [
              'productNameKr',
              'productNameEn',
              'profile.keywords_kr',
              'profile.keywords_en',
              'profile.summary_kr',
              'profile.summary_en',
              'profile.origin.country_kr',
              'profile.origin.country_en',
              'profile.origin.origin_blend.origin_kr',
              'profile.origin.origin_blend.origin_en',
            ],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        });
      }

      if (categoryIdList?.length > 0) {
        must.push({
          terms: {
            categoryId: categoryIdList,
          },
        });
      }

      if (sellerIdList?.length > 0) {
        must.push({
          terms: {
            sellerId: sellerIdList,
          },
        });
      }

      if (typeof isBlend === 'boolean') {
        must.push({ term: { isBlend } });
      }

      if (typeof isSpecialty === 'boolean') {
        must.push({ term: { isSpecialty } });
      }

      if (typeof isSingle === 'boolean') {
        must.push({ term: { isSingle } });
      }

      if (typeof isDecaf === 'boolean') {
        must.push({ term: { isDecaf } });
      }

      const searchResponse: SearchResponseBody<IESearchProduct> =
        await this.client.search<IESearchProduct>({
          index: this.index,
          from: offset,
          size: length,
          query: {
            bool: {
              must,
            },
          },
          _source: ['productId'],
        });

      const count =
        typeof searchResponse.hits?.total === 'number'
          ? searchResponse.hits.total
          : searchResponse.hits.total.value;
      const list: ESearchProductPayload[] = searchResponse.hits.hits.map(
        (v) => new ESearchProductPayload({ productId: v._source?.productId }),
      );

      return new ESearchProductListPayload(count, list);
    } catch (e) {
      throw e;
    }
  }
}
