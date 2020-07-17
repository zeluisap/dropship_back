import {
  PaginateModel,
  PaginateOptions,
  PaginateResult,
  Document,
} from 'mongoose';

export interface AggregatePaginateModel<T extends Document>
  extends PaginateModel<T> {
  paginateAggregate(
    agrregation: Object,
    options?: PaginateOptions,
    callback?: (err: any, result: PaginateResult<T>) => void,
  ): Promise<PaginateResult<T>>;
}
