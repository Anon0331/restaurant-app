'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { CUISINES } from '@/lib/types'

type Props = {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function NewPostModal({ userId, onClose, onSuccess }: Props) {
  const supabase = createClient()
  const [form, setForm] = useState({
    restaurant_name: '',
    location: '',
    cuisine: '和食',
    rating: 5,
    dish: '',
    comment: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const submit = async () => {
    if (!form.restaurant_name.trim()) { setError('お店の名前を入力してください'); return }
    setLoading(true)
    setError('')

    let image_url: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('restaurant-images')
        .upload(path, imageFile, { upsert: true })
      if (uploadErr) {
        setError('画像のアップロードに失敗しました: ' + uploadErr.message)
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { error: insertErr } = await supabase.from('posts').insert({
      user_id: userId,
      ...form,
      image_url,
    })

    if (insertErr) {
      setError('投稿に失敗しました: ' + insertErr.message)
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(26,18,8,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-paper w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold">お店を投稿</h2>
            <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-50">×</button>
          </div>

          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-amber-200 rounded-2xl
                           flex flex-col items-center justify-center gap-2 text-ink/40
                           hover:border-amber-400 hover:bg-amber-50/50 transition-all overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="text-xs">料理の写真を追加（任意）</span>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            {/* Restaurant name */}
            <div>
              <label className="text-xs text-ink/50 mb-1 block">お店の名前 *</label>
              <input
                className="input"
                placeholder="例：鮨 さいとう"
                value={form.restaurant_name}
                onChange={e => setForm(f => ({ ...f, restaurant_name: e.target.value }))}
              />
            </div>

            {/* Location + Cuisine */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-ink/50 mb-1 block">場所</label>
                <input
                  className="input"
                  placeholder="例：東京・六本木"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-ink/50 mb-1 block">ジャンル</label>
                <select
                  className="input"
                  value={form.cuisine}
                  onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-xs text-ink/50 mb-1 block">評価</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      n <= form.rating ? 'text-amber-400' : 'text-ink/15'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Dish */}
            <div>
              <label className="text-xs text-ink/50 mb-1 block">一番好きなメニュー</label>
              <input
                className="input"
                placeholder="例：おまかせコース"
                value={form.dish}
                onChange={e => setForm(f => ({ ...f, dish: e.target.value }))}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs text-ink/50 mb-1 block">なぜ人生最高なのか</label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="例：大将の握りはどこへ行っても超えられない。"
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              onClick={submit}
              disabled={loading}
              className="btn-primary w-full py-3 rounded-2xl disabled:opacity-50"
            >
              {loading ? '投稿中...' : '投稿する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
