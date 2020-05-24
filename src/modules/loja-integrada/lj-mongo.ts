import { Document, Schema } from 'mongoose';

export interface LjHook extends Document {}

export const LjHookSchema = new Schema(
  {},
  {
    strict: false,
  },
);

export const getLjHookSchema = function() {
  const schema = LjHookSchema;
  return schema;
};
