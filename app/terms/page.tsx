import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { OPERATOR } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: '이용약관 | BabyRoad',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.35rem] border border-[#E8EEE9] bg-white/85 p-5 shadow-[0_8px_24px_rgba(37,52,74,0.06)]">
      <h2 className="mb-3 text-base font-bold text-[#25344A]">{title}</h2>
      <div className="space-y-2.5 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-slate-800">{title}</p>
      <div className="mt-1 space-y-1.5">{children}</div>
    </div>
  )
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export default function TermsPage() {
  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="이용약관" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">이용약관</h1>
            <p className="babyroad-subtitle">시행일: {OPERATOR.termsEffectiveDate}</p>
          </div>

          <Section title="제1조 (목적)">
            <p>
              본 약관은 {OPERATOR.company}(이하 "운영자")가 제공하는 BabyRoad 서비스(이하 "서비스")의
              이용 조건 및 절차, 운영자와 회원 간의 권리·의무 및 책임 사항을 규정하는 것을 목적으로
              합니다.
            </p>
          </Section>

          <Section title="제2조 (용어의 정의)">
            <p>본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.</p>
            <Ul
              items={[
                '"서비스"란 BabyRoad 앱 및 웹사이트를 통해 운영자가 제공하는 영유아 성장 기록 및 육아 지원 서비스를 말합니다.',
                '"회원"이란 본 약관에 동의하고 서비스에 가입한 보호자(부모 등)를 말합니다.',
                '"보호자"란 만 14세 미만 아동의 법정대리인 또는 실질적 양육자를 말합니다.',
                '"아이 정보"란 회원이 서비스 내에 등록하는 아이의 이름, 성별, 생년월일, 사진, 성장·건강·기록 등의 정보를 말합니다.',
                '"기록"이란 성장 기록, 수유/식사 기록, 수면 기록, 건강 기록, 예방접종 기록 등 회원이 서비스에 입력하는 데이터를 말합니다.',
                '"커뮤니티"란 회원 간 경험과 정보를 공유할 수 있도록 운영자가 제공하는 게시판 기능을 말합니다.',
              ]}
            />
          </Section>

          <Section title="제3조 (서비스의 내용)">
            <p>운영자는 다음의 서비스를 제공합니다.</p>
            <Ul
              items={[
                '성장 기록: 키, 몸무게, 머리둘레 등 신체 성장 데이터 입력 및 조회',
                '수유/식사 기록: 수유/식사 유형, 양, 음식명, 반응 등 기록',
                '수면 기록: 수면 시작·종료 시간, 유형, 깬 횟수 등 기록',
                '건강 기록: 체온, 증상, 약 복용, 병원 방문 기록',
                '예방접종 기록: 접종 일정 안내 및 완료 여부 기록',
                '성장 리포트: 기록 데이터 기반 성장 추이 및 기준선 비교 (참고 정보)',
                '월령별 발달 가이드: 월령에 따른 발달 참고 정보 제공',
                '커뮤니티: 육아 경험 공유 게시판 및 댓글',
              ]}
            />
            <p className="text-xs text-slate-500">
              ※ 서비스 내용은 운영자의 정책에 따라 추가·변경·중단될 수 있습니다.
            </p>
          </Section>

          <Section title="제4조 (회원가입 및 로그인)">
            <p>
              서비스는 Google 계정을 통한 소셜 로그인 방식을 사용합니다. 회원가입 시 본 약관 및
              개인정보처리방침에 동의한 것으로 간주합니다.
            </p>
            <p>
              회원은 본인 명의의 Google 계정을 사용해야 하며, 타인의 계정을 도용하거나 허위 정보를
              입력해서는 안 됩니다.
            </p>
            <p>
              보호자는 본인의 책임 하에 아이 정보를 등록·관리합니다. 14세 미만 아동이 직접 서비스에
              가입하는 것은 허용되지 않습니다.
            </p>
          </Section>

          <Section title="제5조 (아이 정보 및 기록 관리)">
            <p>
              회원은 정확하고 최신의 정보를 입력하도록 노력해야 하며, 부정확한 정보 입력으로 인한
              불이익에 대해 운영자는 책임을 지지 않습니다.
            </p>
            <p>
              입력된 정보는 참고용이며, 의료적 판단을 대신하지 않습니다. 아이의 건강 상태에 대한
              판단은 반드시 전문 의료진과 상담하시기 바랍니다.
            </p>
            <p>
              회원은 앱 내에서 언제든지 아이 정보 및 기록을 수정하거나 삭제할 수 있습니다.
            </p>
          </Section>

          <Section title="제6조 (성장 리포트 및 발달 가이드의 성격)">
            <p>
              BabyRoad의 성장 리포트 및 발달 가이드는 공개된 통계 기준 또는 일반적인 참고 정보를
              기반으로 제공됩니다.
            </p>
            <p>
              본 서비스에서 제공하는 성장 기준선, 발달 정보, 예방접종 일정 등은 일반적인 참고
              정보이며, 의학적 진단·처방·치료를 대체하지 않습니다.
            </p>
            <p>
              아이의 건강 상태, 발달 수준, 예방접종 가능 여부는 반드시 소아과 전문의 또는 의료
              기관과 상담하시기 바랍니다.
            </p>
            <p className="text-xs text-amber-700">
              ※ BabyRoad는 의료 기관이 아니며 의료 서비스를 제공하지 않습니다.
            </p>
          </Section>

          <Section title="제7조 (커뮤니티 이용 규칙)">
            <p>회원은 커뮤니티 이용 시 다음 행위를 하여서는 안 됩니다.</p>
            <Ul
              items={[
                '타인 비방, 욕설, 혐오·차별적 표현',
                '타인의 개인정보 노출 (아이 정보, 연락처 등)',
                '광고, 홍보, 스팸성 게시물 작성',
                '불법 정보, 음란물, 저작권 침해 콘텐츠 게시',
                '허위 사실 유포 또는 타인 명예 훼손',
                '서비스 운영 방해 행위',
              ]}
            />
            <p>
              위반 게시물은 운영자가 사전 통보 없이 삭제할 수 있으며, 반복 위반 시 서비스 이용이
              제한될 수 있습니다. 커뮤니티 내용은 다른 회원에게 공개되므로, 아이 사진이나 개인정보를
              직접 노출하지 않도록 주의해 주세요.
            </p>
          </Section>

          <Section title="제8조 (회원의 의무)">
            <Ul
              items={[
                '회원은 관계 법령, 본 약관, 서비스 내 안내 사항을 준수해야 합니다.',
                '회원은 계정 정보(로그인 세션 등)를 안전하게 관리해야 하며, 타인과 공유해서는 안 됩니다.',
                '회원은 서비스를 통해 취득한 다른 회원의 정보를 목적 외로 이용해서는 안 됩니다.',
                '회원은 운영자의 사전 허락 없이 서비스를 영리 목적으로 이용해서는 안 됩니다.',
              ]}
            />
          </Section>

          <Section title="제9조 (금지행위)">
            <Ul
              items={[
                '서비스 해킹, 비정상적인 접근, 자동화 도구를 이용한 대량 요청',
                '타인의 계정 도용 또는 허위 정보 입력',
                '서비스의 소스코드, 알고리즘, 데이터베이스 구조 무단 복제·유출',
                '서비스 운영을 방해하거나 다른 이용자의 이용을 침해하는 행위',
                '법령에 위반되는 모든 행위',
              ]}
            />
          </Section>

          <Section title="제10조 (서비스 이용 제한)">
            <p>
              운영자는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우, 경고,
              일시 정지, 영구 이용 제한 등의 조치를 취할 수 있습니다.
            </p>
            <p>
              이용 제한 조치에 대해 이의가 있는 경우 문의를 통해 이의 신청을 할 수 있으며, 운영자는
              합리적인 기간 내에 검토 결과를 안내합니다.
            </p>
          </Section>

          <Section title="제11조 (게시물의 관리)">
            <p>
              회원이 서비스 내에 게시한 게시글, 댓글 등의 저작권은 해당 회원에게 귀속됩니다. 단,
              운영자는 서비스 운영·홍보 등의 목적으로 저작권법의 범위 내에서 이를 사용할 수 있습니다.
            </p>
            <p>
              게시물은 회원이 직접 수정·삭제할 수 있습니다. 운영자는 서비스 정책 위반 게시물을 삭제할
              수 있습니다.
            </p>
            <p>
              회원 탈퇴 시 커뮤니티에 게시된 글 및 댓글은 비식별 처리되거나 삭제 정책에 따라
              처리됩니다.
            </p>
          </Section>

          <Section title="제12조 (서비스 변경 및 중단)">
            <p>
              운영자는 서비스의 내용, 기능, 이용 요금 등을 변경하거나 서비스를 중단할 수 있습니다.
              변경 또는 중단 시에는 사전에 앱 내 공지를 통해 안내합니다.
            </p>
            <p>
              불가피한 사유(천재지변, 시스템 점검, 긴급 보안 이슈 등)로 인한 서비스 중단의 경우,
              사전 공지 없이 이루어질 수 있습니다.
            </p>
          </Section>

          <Section title="제13조 (책임의 제한)">
            <p>운영자는 다음의 사항에 대해 책임을 지지 않습니다.</p>
            <Ul
              items={[
                '서비스 내 성장 리포트, 발달 가이드, 예방접종 정보 등 참고 정보의 정확성에 관한 의료적 책임',
                '회원이 서비스에 직접 입력한 정보의 정확성',
                '회원 간 커뮤니티 게시물로 인한 분쟁',
                '천재지변, 서비스 제공자(Supabase, Vercel 등)의 귀책 사유로 인한 서비스 장애',
                '회원의 귀책 사유로 발생한 손해',
              ]}
            />
          </Section>

          <Section title="제14조 (계정 탈퇴 및 데이터 삭제)">
            <p>
              회원은 언제든지 서비스 탈퇴를 요청할 수 있습니다. 탈퇴 요청 접수 후 지체 없이 계정 및
              관련 데이터를 삭제 또는 비식별 처리합니다.
            </p>
            <Sub title="삭제 처리 항목">
              <Ul
                items={[
                  '아이 정보 및 모든 기록 (성장, 수유, 수면, 건강, 예방접종)',
                  '계정 프로필 정보',
                  '커뮤니티 게시글 및 댓글 (비식별 처리 또는 삭제)',
                ]}
              />
            </Sub>
            <p>
              단, 법령에 따라 보관이 필요한 정보는 해당 기간 동안 별도 보관 후 파기합니다. 탈퇴
              처리는 {OPERATOR.email} 또는 향후 앱 내 탈퇴 기능을 통해 요청할 수 있습니다.
            </p>
          </Section>

          <Section title="제15조 (준거법 및 분쟁 해결)">
            <p>본 약관은 대한민국 법령에 따라 해석되고 적용됩니다.</p>
            <p>
              서비스 이용과 관련하여 운영자와 회원 간 분쟁이 발생한 경우, 상호 협의를 통해 해결하는
              것을 원칙으로 합니다. 협의가 이루어지지 않을 경우 관할 법원은 운영자 소재지를 관할하는
              법원으로 합니다.
            </p>
          </Section>

          <Section title="제16조 (약관 변경)">
            <p>
              운영자는 필요한 경우 약관을 변경할 수 있습니다. 변경 시 시행 7일 전(이용자에게 불리한
              변경의 경우 30일 전)부터 앱 내 공지를 통해 안내합니다.
            </p>
            <p>
              변경된 약관에 동의하지 않는 경우, 회원은 서비스 탈퇴를 통해 동의를 거부할 수 있습니다.
              변경 시행일 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.
            </p>
          </Section>

          <Section title="제17조 (시행일)">
            <p>본 이용약관은 {OPERATOR.termsEffectiveDate}부터 시행됩니다.</p>
          </Section>

          <div className="rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF7DF]/78 px-4 py-3">
            <p className="text-xs leading-relaxed text-[#9A6A38]">
              본 약관은 초안이며, 실제 서비스 운영 전 법률 전문가의 검토를 권장합니다. 운영자 정보,
              시행일 등 [placeholder] 항목은 서비스 출시 전 반드시 확정 정보로 교체해 주세요.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
