import mongoose from "mongoose";

const invitationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    batch: {
      type: String,
      required: true,
      trim: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    maxUses: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

invitationCodeSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.createdById = ret.createdBy?.toString() || null;
    delete ret.__v;
    delete ret.createdBy;
    return ret;
  }
});

export default mongoose.model("InvitationCode", invitationCodeSchema, "invitation_codes");
