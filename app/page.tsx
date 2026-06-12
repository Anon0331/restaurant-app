'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Post } from '@/lib/types'
import PostCard from '@/components/PostCard'
import NewPostModal from '@/components/NewPostModal'
import AuthModal from '@/components/AuthModal'
import Header from '@/components/Header'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sort, setSort] = useState<'new' | 'rating' | 'likes'>('new')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles ( username, avatar_url ),
        likes ( count )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      let sorted = [...data] as Post[]
      if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
      if (sort === 'likes') sorted.sort((a, b) => (b.likes?.[0]?.count ?? 0) - (a.likes?.[0]?.count ?? 0))

      if (user) {
        const { data: likedData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
        const likedIds = new Set(likedData?.map((l: any) => l.post_id))
        sorted = sorted.map(p => ({ ...p, user_liked: likedIds.has(p.id) }))
      }
      setPosts(sorted)
    }
    setLoading(false)
  }, [sort, user])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) { setShowAuth(true); return }
    if (liked) {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id })
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
    }
    fetchPosts()
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onAuthClick={() => setShowAuth(true)} onNewPost={() => {
        if (!user) { setShowAuth(true); return }
        setShowNewPost(true)
      }} />

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-tight mb-3">
            一生モノの一皿
          </h1>
          <p className="text-ink/60 text-sm tracking-wide">
            人生で一番おいしかったお店を、世界とシェアしよう
          </p>
          <div className="w-16 h-px bg-amber-400 mx-auto mt-4" />
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          {(['new', 'rating', 'likes'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                sort === s
                  ? 'bg-ink text-paper'
                  : 'border border-ink/20 text-ink/60 hover:border-ink/40'
              }`}
            >
              {s === 'new' ? '新着' : s === 'rating' ? '評価順' : 'いいね順'}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-48 animate-pulse bg-amber-50/60" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-ink/40">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm">まだ投稿がありません。最初の一件を投稿しよう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <div key={post.id} className="fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <PostCard post={post} onLike={handleLike} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => { if (!user) { setShowAuth(true); return } setShowNewPost(true) }}
        className="fixed bottom-6 right-6 bg-ink text-paper w-14 h-14 rounded-full text-2xl
                   shadow-lg hover:bg-amber-800 transition-all hover:scale-105 active:scale-95"
      >
        +
      </button>

      {showNewPost && (
        <NewPostModal
          userId={user?.id}
          onClose={() => setShowNewPost(false)}
          onSuccess={() => { setShowNewPost(false); fetchPosts() }}
        />
      )}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </div>
  )
}
