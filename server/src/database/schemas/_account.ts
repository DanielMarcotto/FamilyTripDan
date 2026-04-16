import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  email: string;
  password: string;
  user: {
    name: string;
    surname: string;
    username: string;
    profile_picture: string;
    birthdate: Date | string; // You can adjust the type here
    type: 'user' | 'admin' | 'operator';
  };
  contacts: {
    phone: string;
    address: string;
  };
  settings: {
    currency: string;
    preferred_language: string;
    timezone: string;
  };
  finances: {
    stripe_customer_id: string;
    stripe_payment_method: string;
    stripe_payment_methods: string[];
    billing_address: string;

    subscription_plan: 'free' | 'hazel_c_01' | 'hazel_c_12'
    subscription_expiry: Date

  };
  booleans: {
    isVerified: boolean;
    isAdmin: boolean;
  };
  tokens: {
    verificationToken?: string;
    passwordResetToken?: string;
  };
  notifications: {
    expo_push_token?: string;
  };
  children: Array<{
    _id?: string;
    name: string;
    age: number;
  }>;
  createdAt: Date
}


const accountSchema = new mongoose.Schema<IAccount>({
    email: {
      type: String,
      required: true,
      trim: true,
      //minlength: 5,
      maxlength: 255,
      unique: false
    },
    password: {
      type: String,
      //required: true,
    },
    user: {
      name: {
        type: String,
        default: "",
      },
      surname: {
        type: String,
        default: "",
      },
      username: {
        type: String,
        default: "",
      },
      profile_picture: {
        type: String,
        default: "",
      },
      birthdate: {
        type: Date,
        default: "",
      },
      type: {
        type: String,
        enum: ['user', 'admin', 'operator'],
        default: 'operator',
      },
    },
    contacts: {
      phone: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
    },
    settings: {
      currency: {
        type: String,
        default: "EUR",
      },
      preferred_language: {
        type: String,
        default: "it",
      },
      timezone: {
        type: String,
        default: "CET",
      },
    },
    finances: {
      stripe_customer_id: { 
        type: String, 
        default: "" 
      },
      stripe_payment_method: {
        type: String, 
        default: "",
      },
      stripe_payment_methods: {
        type: [String],
        default: [],
      },
      billing_address: {
        type: String,
        default: "",
      },

      subscription_expiry:{
        type: Date,
        default: Date.now()
      },

      subscription_plan:{
        type: String,
        enum: ['free','hazel_c_01','hazel_c_12'],
        default: 'free'
      }
    },
    booleans: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    tokens: {
      verificationToken: {
        type: String,
      },
      passwordResetToken: {
        type: String,
      },
    },
    notifications: {
      expo_push_token: {
        type: String,
        default: "",
      },
    },
    children: {
      type: [{
        name: {
          type: String,
          required: true,
          trim: true,
        },
        age: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  });
  
  export default mongoose.model<IAccount>('Account', accountSchema);
  