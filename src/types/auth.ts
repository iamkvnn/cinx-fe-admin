export interface BanUserRequest {
    reasonType: "SPAM" | "NEGATIVE_WORDS" | "INSULT" | "POLICY_ABUSE";
    details: string;
    durationDays?: number;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: "USER" | "INSTRUCTOR" | "ADMIN";
    gender?: "MALE" | "FEMALE";
    phoneNumber?: string;
    bio?: string;
    cvFileKey?: string;
}

export interface RefreshTokenRequest {
    token: string;
}

export interface TokenResponseDto {
    accessToken?: string;
    refreshToken?: string;
}

export interface AuthRequestDto {
    email: string;
    password: string;
}

export interface OAuthRequest {
    code: string;
    codeVerifier: string;
    device?: "WEB" | "MOBILE";
}

export interface ChangePasswordRequest {
    email: string;
    oldPassword: string;
    newPassword: string;
}

export interface ChangeEmailRequest {
    oldEmail: string;
    otp: string;
    newEmail: string;
}