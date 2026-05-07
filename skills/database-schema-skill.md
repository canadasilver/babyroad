# Database Schema Skill

## 목적

베이비로드 프로젝트의 Supabase PostgreSQL 스키마를 일관된 기준으로 작성하기 위한 규칙이다.

## DB 기준

- Supabase PostgreSQL
- UUID 기본키 / `timestamptz` 날짜
- Soft delete / RLS 적용 전제
- Migration SQL 사용

## 마이그레이션 파일 위치

```
supabase/migrations/
```

파일명 형식: `YYYYMMDDHHMMSS_description.sql`

```
20260101000000_create_initial_schema.sql
20260101001000_create_growth_tables.sql
20260101002000_create_community_tables.sql
```

## 기본 확장

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 기본 컬럼 규칙

모든 주요 테이블에 포함:

```sql
id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
```

사용자 소유 테이블 추가:

```sql
user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

아이 관련 테이블 추가:

```sql
child_id   uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE
```

## 네이밍 규칙

- 테이블명: 복수형 `snake_case`
- 컬럼명: `snake_case`
- 기본키: `id` / 사용자 ID: `user_id` / 아이 ID: `child_id`
- 상태값: `status` / 생성일: `created_at` / 수정일: `updated_at` / 삭제일: `deleted_at`
- Boolean: `is_` 또는 `has_` 접두어

## MVP 필수 테이블

```
profiles, children
child_growth_records, child_feeding_records
child_sleep_records, child_health_records
vaccines, vaccine_schedules, child_vaccination_records
development_contents, development_checklists
community_posts, community_comments, community_likes, community_reports
notifications
```

## 테이블별 컬럼 기준

### profiles

```
id, user_id, nickname, email, avatar_url
provider, role (기본값: 'user', 확장: 'admin')
created_at, updated_at, deleted_at
```

### children

```
id, user_id, name, nickname
gender ('male' | 'female' | 'unknown')
status ('pregnancy' | 'born')
due_date, birth_date
birth_weight, birth_height, birth_head_circumference
profile_image_url, is_premature, memo
created_at, updated_at, deleted_at
```

### child_growth_records

```
id, user_id, child_id, record_date, memo
height numeric(5,2), weight numeric(5,2), head_circumference numeric(5,2)
created_at, updated_at, deleted_at
```

### child_feeding_records

```
id, user_id, child_id, recorded_at
feeding_type ('breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water')
amount, unit, food_name, reaction, memo
created_at, updated_at, deleted_at
```

### child_sleep_records

```
id, user_id, child_id
sleep_start, sleep_end
sleep_type ('day_sleep' | 'night_sleep')
wake_count, memo
created_at, updated_at, deleted_at
```

### child_health_records

```
id, user_id, child_id, recorded_at
temperature, symptoms, medicine, hospital_name, memo
created_at, updated_at, deleted_at
```

### 예방접종 (3개 테이블)

**vaccines**
```
id, name, description, is_required
created_at, updated_at, deleted_at
```

**vaccine_schedules**
```
id, vaccine_id, start_month, end_month, dose_label, description
created_at, updated_at, deleted_at
```

**child_vaccination_records**
```
id, user_id, child_id, vaccine_id, vaccine_schedule_id
scheduled_date, vaccinated_date
status ('scheduled' | 'completed' | 'delayed' | 'skipped' | 'consult_required')
hospital_name, memo
created_at, updated_at, deleted_at
```

### 발달 콘텐츠

**development_contents**
```
id, start_month, end_month, title
physical, language, cognitive, social
feeding, sleep, play, caution
created_at, updated_at, deleted_at
```

**development_checklists**
```
id, start_month, end_month, category, title, description
created_at, updated_at, deleted_at
```

### 커뮤니티

**community_posts**
```
id, user_id, child_id, category, title, content, image_url
view_count, like_count, comment_count
status, created_at, updated_at, deleted_at
```

**community_comments**
```
id, user_id, post_id, parent_id, content, status
created_at, updated_at, deleted_at
```

**community_likes**
```
id, user_id, post_id, created_at, deleted_at
```

**community_reports**
```
id, user_id, post_id, comment_id, reason, content, status
created_at, updated_at, deleted_at
```

## 인덱스 기준

우선 생성 대상: `user_id`, `child_id`, `record_date`, `recorded_at`, `scheduled_date`, `category`, `status`, `created_at`, `deleted_at`

```sql
CREATE INDEX idx_children_user_id ON public.children(user_id);
CREATE INDEX idx_growth_child_record_date ON public.child_growth_records(child_id, record_date);
```

## updated_at 자동 갱신

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 트리거 예시
CREATE TRIGGER set_children_updated_at
BEFORE UPDATE ON public.children
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

## Seed 데이터 기준

```
supabase/seed.sql
```

Seed 대상: `vaccines`, `vaccine_schedules`, `development_contents`, `development_checklists`

## 완료 기준

- Supabase SQL Editor에서 실행 가능한가
- UUID 기본키를 사용하는가
- `user_id`와 `child_id` 관계가 명확한가
- RLS 적용 가능한 구조인가
- Soft delete가 가능한가
- 필요한 인덱스가 있는가
- Seed 데이터와 사용자 기록 데이터가 분리되어 있는가

## 금지사항

- 사용자 데이터에 `user_id` 없는 구조
- 아이 기록에 `child_id` 없는 구조
- 개인정보를 공개 콘텐츠 테이블에 저장
- 공식 데이터와 사용자 입력 데이터를 같은 테이블에 혼합
- RLS 적용이 어려운 구조
- 불필요하게 복잡한 스키마
