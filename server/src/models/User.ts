import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    publicKey: {
      type: String, // Base64 encoded JWK or PEM
    },
    encryptedPrivateKey: {
      type: String, // AES encrypted private key
      select: false, // Keep it from being queried generally without explicitly asking
    },
    keySalt: {
      type: String, // Salt used to derive the KEK
      select: false,
    },
    passwordResetOTP: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    bio: {
      type: String,
      maxlength: [160, 'Bio cannot exceed 160 characters'],
      default: '',
    },
    statusMessage: {
      type: String,
      maxlength: [50, 'Status message cannot exceed 50 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search (automatically created by unique: true)

// Hash password before saving
userSchema.pre('save', async function (this: any, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate default avatar if not set
userSchema.pre('save', function (this: any, next) {
  if (!this.avatar) {
    this.avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(this.username)}`;
  }
  next();
});

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;
