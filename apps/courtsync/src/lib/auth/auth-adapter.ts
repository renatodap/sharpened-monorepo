import { createClient } from '@supabase/supabase-js'
import { db, schema } from '../db/adapters/database'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// Auth adapter interface for different auth providers
export interface AuthAdapter {
  signInWithEmail(email: string, password?: string): Promise<AuthResult>
  signUp(email: string, password: string, userData: SignUpData): Promise<AuthResult>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
  sendMagicLink(email: string, redirectTo?: string): Promise<void>
  verifyToken(token: string): Promise<User | null>
  createTeamInvite(teamId: string, email: string, role: string, invitedBy: string): Promise<string>
  acceptTeamInvite(inviteCode: string, userData: SignUpData): Promise<AuthResult>
}

export interface User {
  id: string
  email: string
  fullName: string
  role: string
  teamId?: string
  avatarUrl?: string
}

export interface SignUpData {
  email: string
  fullName: string
  role: 'coach' | 'assistant_coach' | 'captain' | 'player'
  preferredName?: string
  classYear?: number
}

export interface AuthResult {
  user: User
  session?: {
    accessToken: string
    refreshToken: string
    expiresAt: number
  }
}

// Supabase Auth Adapter
class SupabaseAuthAdapter implements AuthAdapter {
  private client: ReturnType<typeof createClient>

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are required for auth adapter')
    }

    this.client = createClient(supabaseUrl, supabaseKey)
  }

  async signInWithEmail(email: string, password?: string): Promise<AuthResult> {
    if (password) {
      // Password-based sign in
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw new Error(error.message)

      const profile = await this.getProfile(data.user.id)
      return {
        user: this.mapSupabaseUser(data.user, profile),
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        },
      }
    } else {
      // Magic link sign in
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (error) throw new Error(error.message)

      // For magic link, we return a placeholder - the real auth happens in callback
      return {
        user: { id: '', email, fullName: '', role: '' },
      }
    }
  }

  async signUp(email: string, password: string, userData: SignUpData): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          role: userData.role,
          preferred_name: userData.preferredName,
          class_year: userData.classYear,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)

    if (!data.user) {
      throw new Error('User creation failed')
    }

    // Create profile in our database
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        userId: data.user.id,
        email: userData.email,
        fullName: userData.fullName,
        preferredName: userData.preferredName,
        role: userData.role,
        classYear: userData.classYear,
      })
      .returning()

    return {
      user: this.mapSupabaseUser(data.user, profile),
      session: data.session ? {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      } : undefined,
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.client.auth.getUser()
    
    if (!user) return null

    const profile = await this.getProfile(user.id)
    return profile ? this.mapSupabaseUser(user, profile) : null
  }

  async sendMagicLink(email: string, redirectTo?: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)
  }

  async verifyToken(token: string): Promise<User | null> {
    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error || !data.user) return null

    const profile = await this.getProfile(data.user.id)
    return profile ? this.mapSupabaseUser(data.user, profile) : null
  }

  async createTeamInvite(teamId: string, email: string, role: string, invitedBy: string): Promise<string> {
    const inviteCode = this.generateInviteCode()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await db.insert(schema.teamInvitations).values({
      teamId,
      email,
      role: role as any,
      inviteCode,
      invitedBy,
      expiresAt,
    })

    // Send invitation email (would integrate with email service)
    await this.sendInviteEmail(email, inviteCode, teamId)

    return inviteCode
  }

  async acceptTeamInvite(inviteCode: string, userData: SignUpData): Promise<AuthResult> {
    // Find the invitation
    const [invitation] = await db
      .select()
      .from(schema.teamInvitations)
      .where(and(
        eq(schema.teamInvitations.inviteCode, inviteCode),
        eq(schema.teamInvitations.email, userData.email)
      ))
      .limit(1)

    if (!invitation) {
      throw new Error('Invalid or expired invitation')
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired')
    }

    // Create user account
    const { data, error } = await this.client.auth.signUp({
      email: userData.email,
      password: randomBytes(32).toString('hex'), // Generate random password for invited users
      options: {
        data: {
          full_name: userData.fullName,
          role: invitation.role,
          team_id: invitation.teamId,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)

    if (!data.user) {
      throw new Error('User creation failed')
    }

    // Create profile with team assignment
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        userId: data.user.id,
        email: userData.email,
        fullName: userData.fullName,
        preferredName: userData.preferredName,
        role: invitation.role,
        teamId: invitation.teamId,
        classYear: userData.classYear,
      })
      .returning()

    // Mark invitation as accepted
    await db
      .update(schema.teamInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(schema.teamInvitations.id, invitation.id))

    return {
      user: this.mapSupabaseUser(data.user, profile),
      session: data.session ? {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      } : undefined,
    }
  }

  private async getProfile(userId: string) {
    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId))
      .limit(1)

    return profile
  }

  private mapSupabaseUser(supabaseUser: any, profile: any): User {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      teamId: profile.teamId,
      avatarUrl: profile.avatarUrl,
    }
  }

  private generateInviteCode(): string {
    return randomBytes(16).toString('hex')
  }

  private async sendInviteEmail(email: string, inviteCode: string, teamId: string): Promise<void> {
    // This would integrate with an email service like Resend, SendGrid, etc.
    // For now, we'll just log the invite details
    console.log(`Invitation sent to ${email} with code ${inviteCode} for team ${teamId}`)
    
    // In production, you would:
    // 1. Generate an email template
    // 2. Include the invite link: `${process.env.NEXT_PUBLIC_APP_URL}/auth/invite?code=${inviteCode}`
    // 3. Send via email service
  }
}

// Local Auth Adapter (for development without Supabase)
class LocalAuthAdapter implements AuthAdapter {
  private users: Map<string, User> = new Map()
  private sessions: Map<string, any> = new Map()

  async signInWithEmail(email: string, password?: string): Promise<AuthResult> {
    // Find user by email
    const user = Array.from(this.users.values()).find(u => u.email === email)
    
    if (!user) {
      throw new Error('User not found')
    }

    // For local adapter, we'll skip password validation
    const sessionToken = randomBytes(32).toString('hex')
    const session = {
      accessToken: sessionToken,
      refreshToken: randomBytes(32).toString('hex'),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    this.sessions.set(sessionToken, { userId: user.id, ...session })

    return { user, session }
  }

  async signUp(email: string, password: string, userData: SignUpData): Promise<AuthResult> {
    const userId = randomBytes(16).toString('hex')
    
    const user: User = {
      id: userId,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
    }

    this.users.set(userId, user)

    // Create profile in database
    await db.insert(schema.profiles).values({
      userId,
      email: userData.email,
      fullName: userData.fullName,
      preferredName: userData.preferredName,
      role: userData.role,
      classYear: userData.classYear,
    })

    return { user }
  }

  async signOut(): Promise<void> {
    // In a real implementation, you'd clear the session
  }

  async getCurrentUser(): Promise<User | null> {
    // Would get from session storage in browser
    return null
  }

  async sendMagicLink(email: string, redirectTo?: string): Promise<void> {
    console.log(`Magic link sent to ${email}`)
  }

  async verifyToken(token: string): Promise<User | null> {
    return null
  }

  async createTeamInvite(teamId: string, email: string, role: string, invitedBy: string): Promise<string> {
    const inviteCode = this.generateInviteCode()
    
    await db.insert(schema.teamInvitations).values({
      teamId,
      email,
      role: role as any,
      inviteCode,
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return inviteCode
  }

  async acceptTeamInvite(inviteCode: string, userData: SignUpData): Promise<AuthResult> {
    // Similar to Supabase implementation but with local user management
    const invitation = await db.query.teamInvitations.findFirst({
      where: (invitations, { eq, and }) => and(
        eq(invitations.inviteCode, inviteCode),
        eq(invitations.email, userData.email)
      ),
    })

    if (!invitation) {
      throw new Error('Invalid invitation')
    }

    return this.signUp(userData.email, 'password', userData)
  }

  private generateInviteCode(): string {
    return randomBytes(16).toString('hex')
  }
}

// Auth adapter factory
export function createAuthAdapter(): AuthAdapter {
  const adapter = process.env.DATABASE_ADAPTER || 'supabase'
  
  switch (adapter) {
    case 'local':
      return new LocalAuthAdapter()
    case 'supabase':
    default:
      return new SupabaseAuthAdapter()
  }
}

// Default auth instance
export const auth = createAuthAdapter()