export type CommunityCategory =
  | '임신'
  | '신생아'
  | '이유식'
  | '수면'
  | '건강'
  | '예방접종'
  | '육아질문'
  | '육아용품'
  | '자유게시판'

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  '임신',
  '신생아',
  '이유식',
  '수면',
  '건강',
  '예방접종',
  '육아질문',
  '육아용품',
  '자유게시판',
]

export const COMMUNITY_CATEGORY_ALL = '전체' as const
export type CommunityCategoryFilter = CommunityCategory | typeof COMMUNITY_CATEGORY_ALL

export const COMMUNITY_CATEGORIES_WITH_ALL: CommunityCategoryFilter[] = [
  COMMUNITY_CATEGORY_ALL,
  ...COMMUNITY_CATEGORIES,
]
