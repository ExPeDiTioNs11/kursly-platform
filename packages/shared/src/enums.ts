/** User roles. Mirrors the Prisma `Role` enum. */
export enum Role {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

/** Lifecycle of an internship listing. */
export enum InternshipStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

/** Status of a student's application to an internship. */
export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/** Publication lifecycle of a course. Mirrors Prisma `CourseStatus`. */
export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/** Difficulty level shown on the course card. */
export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

/** Course format. FULL = standard course; MINI = short bite-sized lesson. */
export enum CourseFormat {
  FULL = 'FULL',
  MINI = 'MINI',
}
