'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppButton from '@/components/ui/AppButton'
import { createClient } from '@/lib/supabase/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

type ChildPhotoUploaderProps = {
  userId: string
  childId: string
  currentPhotoUrl: string | null
  gender: string
  status: string
  compact?: boolean
  editHref?: string
  isOwner?: boolean
}

const ICON: Record<string, string> = {
  pregnancy: '🤰',
  male: '👦',
  female: '👧',
  unknown: '👶',
}

export default function ChildPhotoUploader({
  userId,
  childId,
  currentPhotoUrl,
  gender,
  status,
  compact = false,
  editHref,
  isOwner = true,
}: ChildPhotoUploaderProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Full-mode only
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  // Shared
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const icon = status === 'pregnancy' ? ICON.pregnancy : (ICON[gender] ?? ICON.unknown)

  function showMessage(text: string, error = false, autoClear = false) {
    setMessage(text)
    setIsError(error)
    if (autoClear) {
      setTimeout(() => setMessage(null), 3000)
    }
  }

  async function doUpload(file: File): Promise<boolean> {
    setUploading(true)
    setMessage(null)
    setIsError(false)

    const supabase = createClient()
    const filePath = `${userId}/${childId}/profile.jpg`

    const { error: uploadError } = await supabase.storage
      .from('child-profiles')
      .upload(filePath, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      showMessage(compact ? '업로드 실패. 다시 시도해 주세요.' : '업로드 중 오류가 발생했어요. 다시 시도해 주세요.', true)
      setUploading(false)
      return false
    }

    const { data: { publicUrl } } = supabase.storage
      .from('child-profiles')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('children')
      .update({ profile_image_url: `${publicUrl}?t=${Date.now()}` } as never)
      .eq('id', childId)
      .eq('user_id', userId)

    if (updateError) {
      showMessage(compact ? '저장 실패. 다시 시도해 주세요.' : '사진 정보 저장 중 오류가 발생했어요.', true)
      setUploading(false)
      return false
    }

    showMessage(compact ? '사진이 등록되었어요.' : '프로필 사진이 등록되었어요.', false, compact)
    setUploading(false)
    router.refresh()
    return true
  }

  async function doDelete() {
    setDeleting(true)
    setMessage(null)
    setIsError(false)

    const supabase = createClient()
    const filePath = `${userId}/${childId}/profile.jpg`

    await supabase.storage.from('child-profiles').remove([filePath])

    const { error: updateError } = await supabase
      .from('children')
      .update({ profile_image_url: null } as never)
      .eq('id', childId)
      .eq('user_id', userId)

    if (updateError) {
      showMessage(compact ? '삭제 실패. 다시 시도해 주세요.' : '사진 삭제 중 오류가 발생했어요.', true)
      setDeleting(false)
      return
    }

    setPreviewUrl(null)
    setImgError(false)
    showMessage(compact ? '사진이 삭제되었어요.' : '프로필 사진이 삭제되었어요.', false, compact)
    setDeleting(false)
    router.refresh()
  }

  // ── COMPACT MODE ──────────────────────────────────────────────────────────

  async function handleFileSelectCompact(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      showMessage('jpg, png, webp 형식만 가능해요.', true)
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      showMessage('5MB 이하만 가능해요.', true)
      e.target.value = ''
      return
    }

    await doUpload(file)
    e.target.value = ''
  }

  async function handleDeleteCompact() {
    if (!window.confirm('사진을 삭제할까요?')) return
    await doDelete()
  }

  if (compact) {
    const isBusy = uploading || deleting

    return (
      <div className="flex w-[118px] shrink-0 flex-col items-end gap-1.5 min-[380px]:w-[132px]">
        {editHref ? (
          <Link
            href={editHref}
            className="inline-flex min-h-8 w-full items-center justify-center rounded-full border border-white/80 bg-white/72 px-3 text-center text-xs font-bold text-[#2F8F84] shadow-[0_8px_18px_rgba(79,169,154,0.10)] transition hover:bg-white"
          >
            아이 정보 수정
          </Link>
        ) : null}

        {isOwner && (isBusy ? (
          <span className="inline-flex min-h-8 w-full items-center justify-center rounded-full bg-[#EAF6F2] px-3 text-xs font-semibold text-[#9AA8BA]">
            {uploading ? '업로드 중...' : '삭제 중...'}
          </span>
        ) : !currentPhotoUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-8 w-full items-center justify-center rounded-full bg-[#EAF6F2] px-3 text-xs font-semibold text-[#2F8F84] transition-colors hover:bg-[#D4EDE6]"
          >
            사진 등록
          </button>
        ) : (
          <div className="flex w-full gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-8 flex-1 items-center justify-center rounded-full bg-[#EAF6F2] px-2 text-xs font-semibold text-[#2F8F84] transition-colors hover:bg-[#D4EDE6]"
            >
              사진 변경
            </button>
            <button
              onClick={handleDeleteCompact}
              className="inline-flex min-h-8 w-11 items-center justify-center rounded-full bg-[#FFF3E9] px-2 text-xs font-semibold text-[#D77C5B] transition-colors hover:bg-[#FEEADB]"
            >
              삭제
            </button>
          </div>
        ))}

        {message && (
          <p className={`text-right text-xs ${isError ? 'text-red-500' : 'text-[#2F766E]'}`}>
            {message}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileSelectCompact}
          className="hidden"
        />
      </div>
    )
  }

  // ── FULL MODE ─────────────────────────────────────────────────────────────

  function handleFileSelectFull(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setMessage(null)
    setIsError(false)

    if (!ALLOWED_TYPES.includes(file.type)) {
      showMessage('jpg, png, webp 형식의 사진만 등록할 수 있어요.', true)
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      showMessage('5MB 이하의 사진만 등록할 수 있어요.', true)
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleUploadFull() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    const success = await doUpload(file)
    if (success) {
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl ?? (imgError ? null : currentPhotoUrl)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-24 w-24 overflow-hidden rounded-full">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="아이 프로필"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#EAF6F2] text-4xl">
            {icon}
          </div>
        )}
      </div>

      {message && (
        <p className={`text-center text-sm ${isError ? 'text-red-500' : 'text-[#2F766E]'}`}>
          {message}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileSelectFull}
        className="hidden"
      />

      {isOwner && (
        <div className="flex flex-wrap justify-center gap-2">
          {previewUrl ? (
            <>
              <AppButton variant="primary" size="sm" loading={uploading} onClick={handleUploadFull}>
                {uploading ? '저장 중...' : '이 사진으로 저장'}
              </AppButton>
              <AppButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewUrl(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                취소
              </AppButton>
            </>
          ) : (
            <>
              <AppButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                {currentPhotoUrl ? '사진 변경' : '사진 등록'}
              </AppButton>
              {currentPhotoUrl && (
                <AppButton variant="outline" size="sm" loading={deleting} onClick={doDelete}>
                  {deleting ? '삭제 중...' : '사진 삭제'}
                </AppButton>
              )}
            </>
          )}
        </div>
      )}

      {isOwner && <p className="text-xs text-[#9AA8BA]">jpg, png, webp · 최대 5MB</p>}
    </div>
  )
}
