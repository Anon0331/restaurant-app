'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Props = {
  onClose: () => void
}

export default function AuthModal({ onClose }: Props) {
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })
      if (err) { setError(err.message); setLoading(false); return }
      // Create profile
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: username || email.split('@')[0],
        })
      }
      setDone(true)
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      onClose()
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,18,8,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-paper w-full max-w-sm rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-50">×</button>
        </div>

        {done ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">📬</p>
            <p className="text-sm text-ink/70">確認メールを送りました。<br />メール内のリンクをクリックしてください。</p>
            <button onClick={onClose} className="btn-primary mt-4 w-full">閉じる</button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-ink/50 mb-1 block">ニックネーム</label>
                <input className="input" placeholder="例：たろう" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            )}
            <div>
              <label className="text-xs text-ink/50 mb-1 block">メールアドレス</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink/50 mb-1 block">パスワード（6文字以上）</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button onClick={submit} disabled={loading} className="btn-primary w-full py-3 rounded-2xl disabled:opacity-50">
              {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
            </button>

            <p className="text-center text-xs text-ink/50">
              {mode === 'login' ? (
                <>アカウントがない場合は{' '}
                  <button onClick={() => setMode('signup')} className="text-amber-700 underline">新規登録</button>
                </>
              ) : (
                <>既にアカウントをお持ちの方は{' '}
                  <button onClick={() => setMode('login')} className="text-amber-700 underline">ログイン</button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
