import {
  Schema, Document, Model, model,
} from 'mongoose';

const RefreshTokenSchema = new Schema({
  token: { type: 'string', unique: true, required: true },
  expirationDate: { type: 'number', required: true },
  userId: { type: 'string', required: true },
  isActive: { type: 'boolean', required: true, default: true },
  __v: { type: Number, select: false },
});

export interface RefreshToken extends Document {
  _id: string;
  token: string;
  expirationDate: number;
  userId: string;
  isActive: boolean;
}

export const RefreshTokenModel: Model<RefreshToken> = model<RefreshToken>('RefreshToken', RefreshTokenSchema);
