import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { OPERATOR } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: '개인정보처리방침 | BabyRoad',
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

export default function PrivacyPage() {
  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="개인정보처리방침" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">개인정보처리방침</h1>
            <p className="babyroad-subtitle">시행일: {OPERATOR.privacyEffectiveDate}</p>
          </div>

          <Section title="1. 개인정보처리방침 개요">
            <p>
              BabyRoad(이하 "서비스")는 영유아 성장 기록 및 육아 지원 앱으로, 이용자(보호자)의
              개인정보를 소중히 여기며 「개인정보 보호법」 및 관계 법령을 준수합니다.
            </p>
            <p>
              본 방침은 서비스가 어떤 개인정보를 수집하고 어떻게 이용하며 어떻게 보호하는지를
              안내합니다. 이용자는 서비스를 이용함으로써 본 방침에 동의한 것으로 간주됩니다.
            </p>
            <p>
              본 방침은 운영자 판단에 따라 변경될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.
            </p>
          </Section>

          <Section title="2. 처리하는 개인정보 항목">
            <Sub title="① 회원 정보">
              <Ul
                items={[
                  'Google 계정을 통해 제공되는 식별 정보(고유 ID)',
                  '이메일 주소',
                  '닉네임(회원이 직접 설정)',
                ]}
              />
            </Sub>
            <Sub title="② 아이 정보">
              <Ul
                items={[
                  '이름, 성별, 생년월일(또는 출산예정일)',
                  '프로필 사진(선택)',
                  '상태(임신 중 / 출생 후)',
                ]}
              />
              <p className="text-xs text-amber-700">
                ※ 아이 사진 및 생년월일은 개인정보성이 높습니다. 보호자가 직접 입력하며, 본인의
                아이 정보 관리 목적으로만 처리됩니다.
              </p>
            </Sub>
            <Sub title="③ 성장 기록">
              <Ul items={['키, 몸무게, 머리둘레', '기록일, 메모']} />
            </Sub>
            <Sub title="④ 수유/식사 기록">
              <Ul items={['수유/식사 유형, 양, 단위', '음식명, 반응/알레르기, 메모']} />
            </Sub>
            <Sub title="⑤ 수면 기록">
              <Ul items={['수면 시작/종료 시간, 수면 유형', '깬 횟수, 메모']} />
            </Sub>
            <Sub title="⑥ 건강 기록">
              <Ul
                items={[
                  '체온, 증상, 약 복용 여부 및 내용',
                  '병원명, 메모',
                ]}
              />
              <p className="text-xs text-amber-700">
                ※ 건강 기록(체온, 증상, 약 복용 정보 등)은 이용자가 직접 입력하는 참고용 기록입니다.
                BabyRoad는 의료 진단 또는 치료 서비스를 제공하지 않습니다.
              </p>
            </Sub>
            <Sub title="⑦ 예방접종 기록">
              <Ul items={['접종 항목, 접종일, 완료 여부, 메모']} />
            </Sub>
            <Sub title="⑧ 커뮤니티">
              <Ul
                items={[
                  '게시글 제목, 내용, 카테고리',
                  '댓글 내용',
                  '좋아요, 신고 정보',
                  '닉네임(커뮤니티 공개)',
                ]}
              />
            </Sub>
            <Sub title="⑨ 서비스 이용 정보 (자동 수집)">
              <Ul
                items={[
                  '접속 로그, 접속 일시, IP 주소',
                  '기기 및 브라우저 정보',
                  '오류 로그, 서비스 이용 기록',
                ]}
              />
            </Sub>
          </Section>

          <Section title="3. 개인정보의 처리 목적">
            <Ul
              items={[
                '회원가입 및 로그인 처리',
                '아이 성장/수유/수면/건강/예방접종 기록 관리',
                '월령별 발달 가이드 제공',
                '성장 리포트 및 기준선 비교 기능 제공',
                '커뮤니티 서비스 운영(글/댓글 작성, 좋아요, 신고)',
                '서비스 안정성 유지 및 오류 개선',
                '이용자 문의 처리',
              ]}
            />
          </Section>

          <Section title="4. 개인정보의 보유 및 이용기간">
            <p>
              개인정보는 회원 탈퇴 또는 삭제 요청 시까지 보유하며, 요청 즉시 지체 없이 파기합니다.
            </p>
            <p>
              단, 법령에 따라 보관이 필요한 경우에는 해당 법령에서 정한 기간 동안 보유합니다.
            </p>
            <Ul
              items={[
                '전자상거래 등에서의 소비자보호에 관한 법률: 계약·청약 철회 관련 기록 5년, 대금결제 기록 5년',
                '통신비밀보호법: 서비스 이용 관련 로그기록 3개월',
              ]}
            />
            <p>
              커뮤니티 게시글 및 댓글은 회원 탈퇴 시 비식별 처리되거나 삭제 정책에 따라 처리될 수
              있습니다.
            </p>
          </Section>

          <Section title="5. 14세 미만 아동의 개인정보 처리">
            <p>
              BabyRoad는 보호자(부모 등)가 본인의 자녀 정보를 입력·관리하는 서비스입니다. 서비스에
              직접 가입하는 주체는 보호자이며, 아동 본인이 직접 가입하거나 개인정보를 입력하는
              구조가 아닙니다.
            </p>
            <p>
              아동의 정보(이름, 생년월일, 사진, 성장/건강 기록 등)는 보호자의 육아 기록 관리 목적
              범위에서만 처리됩니다.
            </p>
            <p>
              보호자는 언제든지 앱 내에서 아이 정보를 수정하거나 삭제할 수 있으며, 문의를 통해 삭제
              요청도 가능합니다.
            </p>
            <p className="text-xs text-amber-700">
              ※ 아이의 사진, 생년월일, 건강 기록 등은 민감한 개인정보입니다. 이를 타인과 공유하거나
              커뮤니티에 직접 게재하지 않도록 주의해 주세요.
            </p>
          </Section>

          <Section title="6. 건강 관련 정보 안내">
            <p>
              건강 기록, 체온, 증상, 약 복용 정보, 예방접종 기록 등은 이용자(보호자)가 직접 입력하는
              참고용 기록입니다.
            </p>
            <p>
              BabyRoad는 의료 진단, 처방, 치료 서비스를 제공하지 않습니다. 아이의 건강 상태, 증상,
              발달 여부에 관한 판단은 반드시 전문 의료진과 상담하시기 바랍니다.
            </p>
            <p>
              성장 리포트 및 발달 가이드는 공개된 통계 기준 또는 일반적 참고 정보를 기반으로 하며,
              의료적 기준으로 해석되어서는 안 됩니다.
            </p>
          </Section>

          <Section title="7. 개인정보의 제3자 제공">
            <p>
              BabyRoad는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 아래의
              경우에는 예외로 합니다.
            </p>
            <Ul
              items={[
                '이용자가 사전에 동의한 경우',
                '법령에 따른 수사기관의 요청이 있는 경우',
                '서비스 제공에 관한 계약 이행을 위해 필요한 경우',
              ]}
            />
          </Section>

          <Section title="8. 개인정보 처리업무 위탁 및 외부 서비스">
            <p>서비스 운영을 위해 아래 외부 서비스를 이용합니다.</p>
            <Ul
              items={[
                'Supabase (미국): 회원 인증, 데이터베이스, 파일 스토리지',
                'Vercel (미국): 웹 애플리케이션 호스팅 및 배포',
                'Google (미국): Google 소셜 로그인 인증',
              ]}
            />
            <p>
              각 서비스 제공자는 자체 개인정보 처리방침을 보유하고 있으며, 서비스 목적 외의 용도로
              개인정보를 처리하지 않습니다.
            </p>
            <p className="text-xs text-slate-400">
              ※ 추후 Analytics, 푸시 알림, 결제 등 서비스 추가 시 해당 내용이 추가될 수 있습니다.
            </p>
          </Section>

          <Section title="9. 개인정보의 국외 이전">
            <p>
              Supabase, Vercel, Google 등 해외 사업자의 인프라를 이용함에 따라, 이용자의 개인정보
              일부가 해외 서버에 저장·처리될 수 있습니다.
            </p>
            <Ul
              items={[
                '이전 국가: 미국 (및 해당 서비스 제공자의 데이터센터 국가)',
                '이전 항목: 위 8항의 외부 서비스 이용 범위 내 개인정보',
                '이전 목적: 서비스 제공 및 운영',
                '보유기간: 회원 탈퇴 또는 서비스 계약 종료 시까지',
              ]}
            />
            <p className="text-xs text-slate-400">
              ※ 자세한 이전 항목 및 국가 정보는 운영 확정 후 업데이트됩니다.
            </p>
          </Section>

          <Section title="10. 개인정보의 파기 절차 및 방법">
            <p>
              개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우, 지체 없이 해당 개인정보를
              파기합니다.
            </p>
            <Sub title="파기 방법">
              <Ul
                items={[
                  '전자적 파일: 복구 불가능한 방식으로 영구 삭제',
                  '데이터베이스 기록: 비식별 처리 또는 완전 삭제',
                  '법령상 보관이 필요한 경우: 별도 데이터베이스로 분리 보관 후 기간 만료 시 파기',
                ]}
              />
            </Sub>
          </Section>

          <Section title="11. 이용자 및 법정대리인의 권리와 행사 방법">
            <p>이용자(및 법정대리인)는 아래 권리를 행사할 수 있습니다.</p>
            <Ul
              items={[
                '개인정보 열람 요청',
                '개인정보 정정·삭제 요청',
                '개인정보 처리 정지 요청',
                '동의 철회',
              ]}
            />
            <p>
              앱 내 마이페이지에서 직접 수정·삭제할 수 있으며, 처리가 어려운 경우 아래 문의처로
              요청하시기 바랍니다.
            </p>
            <p>문의: {OPERATOR.privacyOfficerEmail}</p>
            <p>
              요청 접수 후 10일 이내에 처리 결과를 안내드립니다. 단, 법령상 보관이 필요한 정보는
              즉시 삭제가 어려울 수 있습니다.
            </p>
          </Section>

          <Section title="12. 개인정보의 안전성 확보조치">
            <Ul
              items={[
                '접근권한 관리: 개인정보 처리 시스템에 대한 접근권한을 최소화하고 관리',
                'RLS(Row Level Security): Supabase 데이터베이스에서 사용자별 데이터 접근 제한',
                '전송구간 암호화: HTTPS/TLS를 통한 데이터 전송 구간 암호화',
                '스토리지 접근 정책: 파일 스토리지에 대한 인증된 사용자만 접근 가능',
                '서비스 역할 키 보호: SUPABASE_SERVICE_ROLE_KEY 등 민감 키는 서버 환경에서만 사용',
                '로그 및 권한 관리: 비정상 접근 및 오류 모니터링',
              ]}
            />
          </Section>

          <Section title="13. 쿠키 및 유사 기술 사용">
            <p>
              BabyRoad는 로그인 세션 유지 및 서비스 개선을 위해 쿠키 또는 브라우저 로컬 스토리지를
              사용할 수 있습니다.
            </p>
            <p>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 기능
              이용이 제한될 수 있습니다.
            </p>
          </Section>

          <Section title="14. 개인정보 보호책임자 및 문의">
            <Sub title="개인정보 보호책임자">
              <Ul
                items={[
                  `이름: ${OPERATOR.privacyOfficer}`,
                  `이메일: ${OPERATOR.privacyOfficerEmail}`,
                  `소속: ${OPERATOR.company}`,
                ]}
              />
            </Sub>
            <p>
              개인정보 관련 문의, 불만, 피해 구제 등은 위 담당자에게 연락하시거나 아래 기관에
              신고하실 수 있습니다.
            </p>
            <Ul
              items={[
                '개인정보보호위원회: privacy.go.kr / 국번 없이 182',
                '개인정보 침해신고센터: privacy.go.kr / 국번 없이 118',
                '경찰청 사이버범죄신고시스템: ecrm.cyber.go.kr',
              ]}
            />
          </Section>

          <Section title="15. 개인정보처리방침 변경">
            <p>
              본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있습니다. 변경 사항은 앱
              내 공지 또는 웹사이트를 통해 사전에 안내합니다.
            </p>
            <p>
              중요한 변경 사항이 있는 경우, 시행 7일 전(이용자에게 불리한 경우 30일 전)부터 공지를
              통해 알립니다.
            </p>
          </Section>

          <Section title="16. 시행일">
            <p>본 개인정보처리방침은 {OPERATOR.privacyEffectiveDate}부터 시행됩니다.</p>
          </Section>

          <div className="rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF7DF]/78 px-4 py-3">
            <p className="text-xs leading-relaxed text-[#9A6A38]">
              본 방침은 초안이며, 실제 서비스 운영 전 법률 전문가의 검토를 권장합니다. 운영자 정보,
              시행일 등 [placeholder] 항목은 서비스 출시 전 반드시 확정 정보로 교체해 주세요.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
