# ☕ mybeans-backend-public

**포트폴리오** 프로젝트입니다.  
로컬 개발 환경에서 Docker로 필요 인프라를 모두 지원합니다.

## 📦 프로젝트 구조

```
.
├── docker/                  # 환경별 Docker 설정
│   ├── local/              # 로컬 개발용
│   ├── dev/                # 개발 서버용
│   └── prod/               # 운영 배포용
├── src/                     # NestJS 소스코드
├── package.json
└── README.md
```

## 💣 로컬 실행 방법

### 1. infra 실행

```bash
# 인프라 실행
npm run local:docker-infra

## elastic의 analysis-nori 플러그인 설치
# es 컨테이너 접속
$docker exec -it mybeans-elasticsearch bash
# 플러그인 설치
bin/elasticsearch-plugin install analysis-nori
# 설치 끝나면 컨테이너 재시작
exit
docker restart mybeans-elasticsearch

# 인프라 실행 중 소유권 및 권한 문제 발생 시
docker/local$sudo chown -R "$(whoami)":"$(whoami)" .
docker/local$sudo chmod -R u+rwX .

# db 스키마 및 테이블 생성
$npm run prisma:push-local

# 프리즈마 제너레이트
$npm run prisma:generate

# db 데이터 초기화
$npm run script init-admin
$npm run script init-category
$npm run script init-category_option
$npm run script init-seller
$npm run script init-es
```

<b>S3 대신 MinIO를 사용, anonymous get 허용 방법</b>

1. [MinIO Client download](https://www.min.io/open-source/download)

```
  wget https://dl.min.io/client/mc/release/linux-amd64/mc
  chmod +x mc
  sudo mv mc /usr/local/bin/
```

2. 실행중인 port와 bucket에 따라 아래 커맨드 실행

```
  mc alias set local http://localhost:9000 minioadmin minioadmin
  mc anonymous get local/mybeans-local
  mc anonymous set download local/mybeans-local
```

### 2. server 실행

```bash
npm run local
또는
npm run local:docker
```

## 🔥 개발 서버

- EC2(m7i-flex.large) 한 대에 infra 및 백,프론트 서버 동시 실행

```
mybeans-backend$ npm run local
mybeans-frontend-web$ npm run prod
```

## 💥 실서버
