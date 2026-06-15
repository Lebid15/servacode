/**
 * =====================================================
 * أنواع عامة مشتركة للـ API
 * =====================================================
 */

export type UUID = string;

export type PaginatedMeta = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};
