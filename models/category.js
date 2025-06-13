import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
},{
  timestamps: true
});

export const Category = mongoose.model("Category", categorySchema);