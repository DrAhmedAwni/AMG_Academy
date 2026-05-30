export interface CreateCourseDto {
  title: string;
  slug: string;
  description: string;
  instructorId: string;
  categoryId: string;
  thumbnailUrl?: string | null;
  price: number;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  instructorId?: string;
  categoryId?: string;
  thumbnailUrl?: string | null;
  price?: number;
}
