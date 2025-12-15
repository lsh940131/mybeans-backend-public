# script 사용방법

- npm run script {실행할 스크립트의 폴더명}
- ex) npm run script init-admin

## init-admin

- 최초 사용자(어드민) 생성

## init-category

- 최초 카테고리 세팅
- category 테이블에 데이터가 없어야하며, id가 AI기 때문에 초기화 해놓을 것

## init-category_option

- 최초 카테고리 옵션 및 옵션 값 세팅
- category_option, category_option_value 테이블에 데이터가 없어야하며, id가 AI기 때문에 초기화 해놓을 것

## init-seller

- 최초 판매자 세팅
- 이미 user 테이블에 있는 판매자일 경우 스킵
- sellers/{판매자} 를 순회하며 세팅
  - ./sellers/{판매자}/info.json - 사용자 및 판매자 등록용 데이터
    - regist_state.pdf를 AI 분석을 통해 효율적으로 값 입력
  - ./sellers/{판매자}/regist_state.pdf - 공정거래위원회 등록현황
  - ./sellers/{판매자}/products.json - 상품정보
    - 상품의 옵션과 옵션 값은 domain의 DTO를 사용해서 category_option과 category_option_value의 id를 직접 가리키고 있으므로 앞선 init-category, init-category_option과 싱크를 잘 맞춰야 함
    - 상품명\_넘버링 에서 넘버링 숫자가 작은 것을 thumbnail로 사용하고 그 외 이미지들을 상세 이미지로 간주
    - 상품 이미지가 하나일 경우 thumbnail과 상세 이미지로 간주
    - thumbnailUrl, imageList, isSingle, isBlend, isSpecialty, isDecaf, profile 은 상품의 이미지들을 AI 분석으로 뽑아내어 사용
  - ./sellers/{판매자}/products_images/{상품명}\_{넘버링}.jpg|jpeg|png\* - 상품들의 이미지

## init-es

- 최초 es 데이터 세팅
- 상품들을 조회하는 쿼리 결과를 es의 임시 인덱스(temp_mybeans_products)에 bulk insert
- 임시 인덱스에 자동으로 맵핑된 정보를 검수
  - kibana > Dev Tools > Console > GET temp_mybeans_products/\_mapping
- 검수한 맵핑 정보(mapping.txt)를 정식 인덱스(mybeans_products)에 맵핑

  - 한글 검색을 위해 es 서버에서 nori 설치 필요
    - local:docker-infra로 es를 실행 중일 경우 도커 컨테이너 진입 커맨드
      - docker exec -it mybeans-elasticsearch /bin/bash
    - es 서버에서 다음의 커맨드로 nori 설치
      - ./bin/elasticsearch-plugin install analysis-nori
    - es 재시작

- 임시 인덱스에 저장된 데이터를 정식 인덱스로 복사
  - reindex.txt 참고
- 임시 인덱스 삭제
  - DELETE /temp_mybeans_products
