export interface PagingResponse<T> {
  top: number;
  skip: number;
  total: number;
  data: T[];
}
