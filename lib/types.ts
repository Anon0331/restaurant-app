export type Post = {
  id: string
  user_id: string
  restaurant_name: string
  location: string
  cuisine: string
  rating: number
  dish: string | null
  comment: string | null
  image_url: string | null
  created_at: string
  profiles: { username: string; avatar_url: string | null } | null
  likes: { count: number }[]
  user_liked?: boolean
}

export type Profile = {
  id: string
  username: string
  avatar_url: string | null
}

export const CUISINES = [
  '和食', 'イタリアン', 'フレンチ', '中華', '韓国料理',
  'タイ料理', 'インド料理', 'ラーメン', '焼肉', 'その他'
] as const
