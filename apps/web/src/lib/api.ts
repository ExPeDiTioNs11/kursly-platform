import type { CourseDetail, CourseSummary, Category, Paginated } from '@kursly/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiError {
  status: number;
  message: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    // Course/catalog data can be cached briefly at the edge.
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    const error: ApiError = { status: res.status, message: body.message ?? res.statusText };
    throw error;
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCourses(params: Record<string, string> = {}): Promise<Paginated<CourseSummary>> {
    const query = new URLSearchParams(params).toString();
    return apiFetch<Paginated<CourseSummary>>(`/courses${query ? `?${query}` : ''}`);
  },
  getCourse(slug: string): Promise<CourseDetail> {
    return apiFetch<CourseDetail>(`/courses/${slug}`);
  },
  listCategories(): Promise<Category[]> {
    return apiFetch<Category[]>('/categories');
  },
};
