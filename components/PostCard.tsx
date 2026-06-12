'use client'
import Image from 'next/image'
import type { Post } from '@/lib/types'

const CUISINE_COLORS: Record<string, string> = {
  '和食': 'bg-blue-50 text-blue-700',
  'イタリアン': 'bg-green-50 text-green-700',
  'フレンチ': 'bg-purple-50 text-purple-700',
  '中華': 'bg-red-50 text-red-700',
  '韓国料理': 'bg-orange-50 text-orange-700',
  'タイ料理': 'bg-emerald-50 text-emerald-700',
  'インド料理': 'bg-yellow-50 text-yellow-700',
  'ラーメン': 'bg-rose-50 text-rose-700',
  '焼肉': 'bg-amber-50 text-amber-700',
  'その他': 'bg-gray-50 text-gray-600',
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

type Props = {
  post: Post
  onLike: (postId: string, liked: boolean) => void
}

export default function PostCard({ post, onLike }: Props) {
  const username = post.profiles?.username ?? '匿名'
  const likeCount = post.likes?.[0]?.count ?? 0
  const cuisineClass = CUISINE_COLORS[post.cuisine] ?? CUISINE_COLORS['その他']
  const initials = getInitials(username)

  return (
    <article className="card hover:shadow-md transition-shadow duration-200">
      {post.image_url && (
        <div className="relative h-52 w-full">
          <Image
            src={post.image_url}
            alt={post.restaurant_name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-100 text-amber-800"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg font-bold leading-tight">{post.restaurant_name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cuisineClass}`}>
                {post.cuisine}
              </span>
            </div>
            <p className="text-xs text-ink/50 mt-0.5">
              {username} さんの人生最高の一皿
              {post.dish && <> — <span className="italic">{post.dish}</span></>}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Stars n={post.rating} />
              <span className="text-xs text-ink/40">📍 {post.location}</span>
            </div>
          </div>
        </div>

        {/* Comment */}
        {post.comment && (
          <p className="mt-3 text-sm text-ink/70 leading-relaxed border-t border-amber-50 pt-3 italic">
            "{post.comment}"
          </p>
        )}

        {/* Like */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => onLike(post.id, !!post.user_liked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all
              ${post.user_liked
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'border border-ink/15 text-ink/50 hover:border-ink/30'
              }`}
          >
            {post.user_liked ? '♥' : '♡'} {likeCount}
          </button>
        </div>
      </div>
    </article>
  )
}
