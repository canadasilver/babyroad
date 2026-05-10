-- development_guides: 월령별 발달 가이드 콘텐츠 테이블
create table if not exists public.development_guides (
  id             uuid        primary key default gen_random_uuid(),
  min_month      integer     not null check (min_month >= 0),
  max_month      integer     null       check (max_month is null or max_month >= min_month),
  title          text        not null,
  summary        text        not null,
  milestones     jsonb       not null   default '[]'::jsonb,
  parent_roles   jsonb       not null   default '[]'::jsonb,
  play_ideas     jsonb       not null   default '[]'::jsonb,
  care_tips      jsonb       not null   default '[]'::jsonb,
  caution_notes  jsonb       not null   default '[]'::jsonb,
  source_summary text        null,
  source_links   jsonb       not null   default '[]'::jsonb,
  is_active      boolean     not null   default true,
  sort_order     integer     not null   default 0,
  created_at     timestamptz not null   default now(),
  updated_at     timestamptz not null   default now()
);

-- max_month IS NOT NULL 구간용 유니크 인덱스
create unique index if not exists development_guides_unique_range
  on public.development_guides (min_month, max_month)
  where max_month is not null;

-- max_month IS NULL 구간용 유니크 인덱스 (36개월 이상 등)
create unique index if not exists development_guides_unique_open_end
  on public.development_guides (min_month)
  where max_month is null;

-- sort_order 조회 인덱스
create index if not exists development_guides_sort_order_idx
  on public.development_guides (sort_order);

-- updated_at 자동 갱신 함수 (없으면 생성)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger development_guides_updated_at
  before update on public.development_guides
  for each row execute function public.set_updated_at();

-- RLS 활성화
alter table public.development_guides enable row level security;

-- SELECT: anon, authenticated 모두 허용 (공개 참고 콘텐츠)
create policy "development_guides_select_public"
  on public.development_guides for select
  to anon, authenticated
  using (true);

-- INSERT/UPDATE/DELETE: 클라이언트 정책 없음 (SQL Editor 또는 관리자만)

grant select on public.development_guides to anon, authenticated;
