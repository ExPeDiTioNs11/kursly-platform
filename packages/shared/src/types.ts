import type {
  ApplicationStatus,
  CourseFormat,
  CourseLevel,
  CourseStatus,
  InternshipStatus,
  Role,
} from './enums.js';

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
  format: CourseFormat;
  price: number;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  category: Category | null;
  instructor: Pick<PublicUser, 'id' | 'name' | 'avatarUrl'>;
}

/** A category with its immediate subcategories (one level deep). */
export interface CategoryNode extends Category {
  parentId: string | null;
  children: Category[];
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

// ─────────────────────────────────────────────────────────────
// Social layer (feed posts, stories, follow graph)
// ─────────────────────────────────────────────────────────────

/** Lightweight author shape embedded in posts, comments and stories. */
export interface SocialAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
}

/** A course reference attached to a post (subset of CourseSummary). */
export type PostCourseRef = Pick<CourseSummary, 'id' | 'slug' | 'title' | 'thumbnailUrl'>;

export interface PostComment {
  id: string;
  content: string;
  author: SocialAuthor;
  createdAt: string;
}

/** A feed post by an instructor or student. */
export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  author: SocialAuthor;
  course: PostCourseRef | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
}

/** A single story item within an author's story group. */
export interface StorySummary {
  id: string;
  mediaUrl: string;
  caption: string | null;
  createdAt: string;
  viewedByMe: boolean;
}

/** All active (< 24h) stories from one author, as shown in the story rail. */
export interface StoryGroup {
  author: SocialAuthor;
  stories: StorySummary[];
  hasUnseen: boolean;
}

/** A highlighted review shown as a testimonial on the landing page. */
export interface FeaturedReview {
  id: string;
  rating: number;
  comment: string;
  user: { id: string; name: string; avatarUrl: string | null; role: Role };
  courseTitle: string;
  courseSlug: string;
}

/** Public platform statistics for the landing page. */
export interface PlatformStats {
  courses: number;
  students: number;
  instructors: number;
  enrollments: number;
  featuredReviews: FeaturedReview[];
}

// ─────────────────────────────────────────────────────────────
// Internships
// ─────────────────────────────────────────────────────────────

export interface InternshipCompany {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface InternshipSummary {
  id: string;
  title: string;
  field: string | null;
  location: string | null;
  isRemote: boolean;
  durationMonths: number | null;
  status: InternshipStatus;
  company: InternshipCompany;
  applicantCount: number;
  createdAt: string;
}

export interface InternshipDetail extends InternshipSummary {
  description: string;
  /** Whether the current student has already applied. */
  hasApplied: boolean;
}

/** An applicant as seen by the company that owns the listing. */
export interface InternshipApplicant {
  id: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  applicant: { id: string; name: string; avatarUrl: string | null };
}

/** A student's own application, with the internship it targets. */
export interface MyApplication {
  id: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  internship: {
    id: string;
    title: string;
    status: InternshipStatus;
    company: InternshipCompany;
  };
}

/** Aggregated payload for the logged-in home screen. */
export interface FeedResponse {
  stories: StoryGroup[];
  posts: Post[];
  miniCourses: CourseSummary[];
  recommendedCourses: CourseSummary[];
}

/** Editable course detail returned to its owner (any status), for the instructor panel. */
export interface ManageLesson {
  id: string;
  title: string;
  order: number;
  durationSeconds: number;
  isPreview: boolean;
  videoKey: string | null;
}

export interface ManageSection {
  id: string;
  title: string;
  order: number;
  lessons: ManageLesson[];
}

export interface ManageCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  level: CourseLevel;
  status: CourseStatus;
  format: CourseFormat;
  price: number;
  categoryId: string | null;
  sections: ManageSection[];
}

/** A user's public profile with social counts, for the profile screen. */
export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  role: Role;
  createdAt: string;
  counts: {
    posts: number;
    followers: number;
    following: number;
    courses: number;
  };
  isFollowing: boolean;
  isMe: boolean;
}

/** A course review with its author, as returned by the reviews endpoint. */
export interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  user: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
}

/** One row of a lesson's progress for the current user. */
export interface ProgressRow {
  lessonId: string;
  completed: boolean;
  positionSeconds: number;
}

/** An enrollment with its embedded course, for the "My courses" screen. */
export interface EnrollmentItem {
  id: string;
  courseId: string;
  createdAt: string;
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    thumbnailUrl: string | null;
    level: CourseLevel;
    format: CourseFormat;
    price: number;
    instructor: { id: string; name: string; avatarUrl: string | null };
    category: Category | null;
  };
}
