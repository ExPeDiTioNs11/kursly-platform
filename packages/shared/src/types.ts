import type { CourseLevel, CourseStatus, Role } from './enums.js';

/** Authenticated user as exposed to clients (never includes the password hash). */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

/** Payload encoded inside the access/refresh JWTs. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Response returned by the auth endpoints. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  level: CourseLevel;
  status: CourseStatus;
  price: number;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  category: Category | null;
  instructor: Pick<PublicUser, 'id' | 'name' | 'avatarUrl'>;
}

export interface LessonSummary {
  id: string;
  title: string;
  order: number;
  durationSeconds: number;
  isPreview: boolean;
}

export interface SectionWithLessons {
  id: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
}

export interface CourseDetail extends CourseSummary {
  description: string | null;
  sections: SectionWithLessons[];
}

/** Generic paginated envelope returned by list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Presigned upload contract for direct-to-R2 video uploads. */
export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}
