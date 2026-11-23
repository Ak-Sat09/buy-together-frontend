export type GroupStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CLOSED' | 'EXPIRED'
export type MemberRole = 'CREATOR' | 'MEMBER'
export type ReportReason = 'SPAM' | 'FAKE' | 'ABUSIVE' | 'OTHER'

export interface Brand {
  code: string
  name: string
}

export interface User {
  id: string
  phone: string | null
  email: string | null
  name: string | null
  city: string | null
  createdAt: string
}

export interface OtpChallenge {
  expiresInSeconds: number
  resendAfterSeconds: number
}

export interface LoginResponse {
  token: string
  expiresAt: string
  newUser: boolean
  user: User
}

export interface Group {
  id: string
  brand: string
  brandName: string
  model: string
  city: string
  note?: string
  targetSize: number
  memberCount: number
  spotsLeft: number
  status: GroupStatus
  deadline?: string
  createdAt: string
  joined: boolean
  createdByMe: boolean
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface GroupSuggestions {
  brand: string
  brandName: string
  city: string
  canCreate: boolean
  peopleInterested: number
  openGroups: Group[]
}

export interface Member {
  userId: string
  name: string
  role: MemberRole
  joinedAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  sentAt: string
  mine: boolean
}

export interface CreateGroupInput {
  brand: string
  model: string
  city: string
  targetSize: number
  note?: string
  deadline?: string
}
