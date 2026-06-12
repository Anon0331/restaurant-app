'use client'
import { createClient } from '@/lib/supabase'

type Props = {
  user: any
  onAuthClick: () => void
  onNewPost: () => void
}

export default function Header({ user, onAuthClick, onNewPost }: Props) {
  const supabase = createClient()

  return (
    <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-sm border-b border-amber-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight">🍽️ 一生モノの一皿</span>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={onNewPost} className="btn-primary text-xs px-4 py-2">
                + 投稿
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-ink/40 hover:text-ink/70 transition-colors"
              >
                ログアウト
              </button>
            </>
          ) : (
            <button onClick={onAuthClick} className="btn-primary text-xs px-4 py-2">
              ログイン / 登録
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
