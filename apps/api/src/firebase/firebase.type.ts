import {
  DocumentSnapshot,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: string | number | boolean | string[] | number[];
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: {
    field: string;
    direction?: OrderByDirection;
  };
  limit?: number;
  offset?: number;
  startAfter?: DocumentSnapshot;
}

export interface PaginationOptions extends QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FilterSummary {
  field: string;
  values: Array<{
    label: string;
    value: number;
  }>;
}
