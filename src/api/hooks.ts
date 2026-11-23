import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, query } from '../lib/api'
import type {
  Brand,
  CreateGroupInput,
  Group,
  GroupStatus,
  GroupSuggestions,
  LoginResponse,
  Member,
  Message,
  OtpChallenge,
  Page,
  ReportReason,
  User,
} from '../lib/types'

export interface GroupFilters {
  brand?: string
  city?: string
  status?: GroupStatus
  page?: number
}

const keys = {
  brands: ['brands'] as const,
  groups: (filters: GroupFilters) => ['groups', 'list', filters] as const,
  group: (id: string) => ['groups', 'detail', id] as const,
  mine: (page: number) => ['groups', 'mine', page] as const,
  suggestions: (brand: string, city: string) => ['groups', 'suggestions', brand, city] as const,
  members: (id: string) => ['groups', 'members', id] as const,
  messages: (id: string) => ['groups', 'messages', id] as const,
  me: ['me'] as const,
}

/* Reads */

export function useBrands() {
  return useQuery({
    queryKey: keys.brands,
    queryFn: () => api<Brand[]>('/api/brands'),
    staleTime: Infinity,
  })
}

export function useGroups(filters: GroupFilters, size = 20) {
  return useQuery({
    queryKey: keys.groups(filters),
    queryFn: () => api<Page<Group>>(`/api/groups${query({ ...filters, size })}`),
    placeholderData: keepPreviousData,
  })
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: keys.group(id),
    queryFn: () => api<Group>(`/api/groups/${id}`),
  })
}

export function useMyGroups(page: number) {
  return useQuery({
    queryKey: keys.mine(page),
    queryFn: () => api<Page<Group>>(`/api/groups/mine${query({ page })}`),
    placeholderData: keepPreviousData,
  })
}

export function useSuggestions(brand: string, city: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.suggestions(brand, city),
    queryFn: () => api<GroupSuggestions>(`/api/groups/suggestions${query({ brand, city })}`),
    enabled,
    staleTime: 0,
  })
}

export function useMembers(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.members(groupId),
    queryFn: () => api<Page<Member>>(`/api/groups/${groupId}/members${query({ size: 50 })}`),
    enabled,
  })
}

export function useMessages(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.messages(groupId),
    queryFn: () => api<Page<Message>>(`/api/groups/${groupId}/messages${query({ size: 50 })}`),
    enabled,
    refetchInterval: 5000,
  })
}

/* Writes */

/** Phone and email logins share one OTP flow; only the endpoint and the field name differ. */
export type LoginChannel = 'phone' | 'email'

const otpPath: Record<LoginChannel, string> = {
  phone: '/api/auth/otp',
  email: '/api/auth/email',
}

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ channel, address }: { channel: LoginChannel; address: string }) =>
      api<OtpChallenge>(`${otpPath[channel]}/send`, { method: 'POST', body: { [channel]: address } }),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ channel, address, otp, name }: { channel: LoginChannel; address: string; otp: string; name?: string }) =>
      api<LoginResponse>(`${otpPath[channel]}/verify`, { method: 'POST', body: { [channel]: address, otp, name } }),
  })
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: (credential: string) => api<LoginResponse>('/api/auth/google', { method: 'POST', body: { credential } }),
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: { name: string; city?: string }) => api<User>('/api/users/me', { method: 'PUT', body: input }),
  })
}

export function useCreateGroup() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGroupInput) => api<Group>('/api/groups', { method: 'POST', body: input }),
    onSuccess: (group) => {
      client.setQueryData(keys.group(group.id), group)
      client.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

type GroupAction = 'join' | 'leave' | 'complete' | 'close'

export function useGroupAction(groupId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (action: GroupAction) => api<Group>(`/api/groups/${groupId}/${action}`, { method: 'POST' }),
    onSuccess: (group) => {
      client.setQueryData(keys.group(groupId), group)
      client.invalidateQueries({ queryKey: ['groups'], predicate: (q) => q.queryKey[1] !== 'detail' })
    },
  })
}

export function useSendMessage(groupId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (text: string) =>
      api<Message>(`/api/groups/${groupId}/messages`, { method: 'POST', body: { text } }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.messages(groupId) }),
  })
}

export function useReportGroup(groupId: string) {
  return useMutation({
    mutationFn: (input: { reason: ReportReason; details?: string }) =>
      api<{ id: string }>(`/api/groups/${groupId}/reports`, { method: 'POST', body: input }),
  })
}

export { keys as queryKeys }
