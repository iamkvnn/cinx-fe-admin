export interface UpdateProfileRequest {
  name: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  bio?: string;
  isReceivePushNotification?: boolean;
  avatarFileKey?: string;
  cvFileKey?: string;
}

export interface UserDto {
  userId?: string;
  name?: string;
  email?: string;
  role?: "USER" | "INSTRUCTOR" | "ADMIN";
  gender?: "MALE" | "FEMALE";
  isReceivePushNotification?: boolean;
  isInstructorVerified?: boolean;
  status?: "UNVERIFIED" | "ACTIVE" | "BANNED";
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  xp?: number;
  cvUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  lastAccessAt?: string;
  instructorVerifiedAt?: string;
}

export interface DeviceTokenRequest {
  fcmToken: string;
  deviceInfo?: string;
}

export interface PresignedUrlResponse {
  fileKey?: string;
  presignedUrl?: string;
}
