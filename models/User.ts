import mongoose, { Document, Schema } from 'mongoose';

// Add profile completion interfaces
export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredFields: string[];
}

export interface IFreelancer extends Document {
  fullname: string;
  email: string;
  password: string;
  // Profile Information
  title?: string;
  avatar?: string;
  bio?: string;
  description?: string;
  location?: string;
  
  // Professional Details
  skills: string[];
  category?: string;
  hourlyRate?: number;
  availability?: string;
  languages: string[];
  
  // Performance Metrics
  rating: number;
  reviewCount: number;
  completedJobs: number;
  successRate: number;
  responseTime?: string;
  
  // Status Flags
  verified: boolean;
  topRated: boolean;
  
  // Portfolio
  portfolio: {
    title: string;
    description?: string;
    image?: string;
    url?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Profile completion methods
  getProfileCompletionStatus(): ProfileCompletionStatus;
  isProfileComplete(): boolean;
  getMissingProfileFields(): string[];
}

export interface IClient extends Document {
  fullname: string;
  email: string;
  password: string;
  // Client-specific fields can be added here
  company?: string;
  avatar?: string;
  location?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Profile completion methods
  getProfileCompletionStatus(): ProfileCompletionStatus;
  isProfileComplete(): boolean;
  getMissingProfileFields(): string[];
}

const FreelancerSchema = new Schema<IFreelancer>({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  // Profile Information
  title: {
    type: String,
    trim: true,
    default: '',
  },
  avatar: {
    type: String,
    default: '/placeholder.svg?height=80&width=80',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  location: {
    type: String,
    trim: true,
  },
  
  // Professional Details
  skills: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: ['web-dev', 'mobile-dev', 'design', 'writing', 'marketing', 'data', 'photography', 'blockchain', 'other'],
    default: 'other',
  },
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0,
  },
  availability: {
    type: String,
    enum: ['Available now', 'Available in 1 day', 'Available in 2 days', 'Available in 3 days', 'Available in 1 week', 'Not available'],
    default: 'Available now',
  },
  languages: {
    type: [String],
    default: ['English'],
  },
  
  // Performance Metrics
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  completedJobs: {
    type: Number,
    min: 0,
    default: 0,
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  responseTime: {
    type: String,
    default: '24 hours',
  },
  
  // Status Flags
  verified: {
    type: Boolean,
    default: false,
  },
  topRated: {
    type: Boolean,
    default: false,
  },
  
  // Portfolio
  portfolio: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '/placeholder.svg?height=200&width=300',
    },
    url: {
      type: String,
      trim: true,
    },
  }],
}, {
  timestamps: true,
});

const ClientSchema = new Schema<IClient>({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  company: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '/placeholder.svg?height=80&width=80',
  },
  location: {
    type: String,
    trim: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
});

export const Freelancer = mongoose.models.Freelancer || mongoose.model<IFreelancer>('Freelancer', FreelancerSchema);
export const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

// Add methods to FreelancerSchema
FreelancerSchema.methods.getProfileCompletionStatus = function(): ProfileCompletionStatus {
  const requiredFields = [
    'fullname',
    'email',
    'title',
    'bio',
    'location',
    'skills',
    'category',
    'hourlyRate'
  ];
  
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    const value = this[field];
    if (!value || 
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'number' && value === 0 && field === 'hourlyRate')) {
      missingFields.push(field);
    }
  });
  
  // Additional validation for skills (should have at least 3 skills)
  if (this.skills && this.skills.length < 3) {
    if (!missingFields.includes('skills')) {
      missingFields.push('skills');
    }
  }
  
  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
  );
  
  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
    requiredFields
  };
};

FreelancerSchema.methods.isProfileComplete = function(): boolean {
  return this.getProfileCompletionStatus().isComplete;
};

FreelancerSchema.methods.getMissingProfileFields = function(): string[] {
  return this.getProfileCompletionStatus().missingFields;
};

// Add methods to ClientSchema
ClientSchema.methods.getProfileCompletionStatus = function(): ProfileCompletionStatus {
  const requiredFields = [
    'fullname',
    'email',
    'company',
    'location'
  ];
  
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    const value = this[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  });
  
  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
  );
  
  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
    requiredFields
  };
};

ClientSchema.methods.isProfileComplete = function(): boolean {
  return this.getProfileCompletionStatus().isComplete;
};

ClientSchema.methods.getMissingProfileFields = function(): string[] {
  return this.getProfileCompletionStatus().missingFields;
};