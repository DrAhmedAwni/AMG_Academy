import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { mapApiErrorToUi, type UiErrorState } from '../lib/errors';

export type QueryUiState<T> =
  | { status: 'loading'; data: undefined; error: undefined; isEmpty: false }
  | { status: 'empty'; data: T; error: undefined; isEmpty: true }
  | { status: 'error'; data: T | undefined; error: UiErrorState; isEmpty: false }
  | { status: 'success'; data: T; error: undefined; isEmpty: false };

export interface QueryStateOptions<T> {
  isEmpty?: (data: T) => boolean;
}

function defaultIsEmpty<T>(data: T) {
  return Array.isArray(data) && data.length === 0;
}

export function useQueryState<T>(
  query: Pick<UseQueryResult<T>, 'data' | 'error' | 'isError' | 'isLoading' | 'isFetching'>,
  options: QueryStateOptions<T> = {},
): QueryUiState<T> & { isRefreshing: boolean } {
  return useMemo(() => {
    if (query.isLoading) {
      return {
        status: 'loading',
        data: undefined,
        error: undefined,
        isEmpty: false,
        isRefreshing: false,
      };
    }

    if (query.isError) {
      return {
        status: 'error',
        data: query.data,
        error: mapApiErrorToUi(query.error),
        isEmpty: false,
        isRefreshing: query.isFetching,
      };
    }

    const data = query.data as T;
    const isEmpty = options.isEmpty?.(data) ?? defaultIsEmpty(data);

    if (isEmpty) {
      return {
        status: 'empty',
        data,
        error: undefined,
        isEmpty: true,
        isRefreshing: query.isFetching,
      };
    }

    return {
      status: 'success',
      data,
      error: undefined,
      isEmpty: false,
      isRefreshing: query.isFetching,
    };
  }, [options, query.data, query.error, query.isError, query.isFetching, query.isLoading]);
}
