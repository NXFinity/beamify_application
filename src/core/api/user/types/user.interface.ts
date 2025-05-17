import { BanType, BanIssuerType } from '../../admin/types/admin.interface';

export interface UserProfile {
  avatar?: string;
  cover?: string;
  displayName?: string;
  bio?: string;
}

export interface Photo {
  _id: string;
  user: string;
  url: string;
  type: 'avatar' | 'cover' | 'photo';
  caption?: string;
  createdAt: string;
}

export interface UserBan {
  type: BanType;
  issuerType: BanIssuerType;
  issuerId: string;
  targetId?: string;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface UserStatus {
  isActive: boolean;
  isBanned: boolean;
}

export interface UserSocial {
  discordId?: string;
  twitchId?: string;
  twitterId?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash?: string;
  roles: string[];
  profile?: UserProfile;
  social?: UserSocial;
  status?: UserStatus;
  developer?: string | null;
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  bans?: UserBan[];
}
