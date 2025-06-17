import { Category } from '../../models/category.js';
import mongoose from 'mongoose';
import { Products } from '../../models/products.js';


export const editCategoryService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: 'Invalid category ID' };
  }

  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    return { error: 'Category not found' };
  }

  if (!updateData.name || !updateData.name.trim()) {
    return { error: 'Category name is required' };
  }

  if (!updateData.type || !['audience', 'style', 'function', 'seasonal'].includes(updateData.type)) {
    return { error: 'Invalid or missing category type' };
  }

  if (!updateData.description || !updateData.description.trim()) {
    return { error: 'Category description is required' };
  }

  const nameExists = await Category.findOne({
    categoryName: updateData.name,
    _id: { $ne: id }
  });
  if (nameExists) {
    return { error: 'Another category with this name already exists' };
  }

  const update = {
    categoryName: updateData.name,
    type: updateData.type,
    description: updateData.description,
  };

  const updatedCategory = await Category.findByIdAndUpdate(id, update, {
    new: true
  });

  if (!updatedCategory) {
    return { error: 'Failed to update category' };
  }

  if (updateData.products && Array.isArray(updateData.products)) {
    const validProductIds = updateData.products.filter(p => mongoose.Types.ObjectId.isValid(p));
    await Products.updateMany(
      { _id: { $in: validProductIds } },
      { $addToSet: { category: updatedCategory._id } }
    );
  }

  return { data: updatedCategory };
};

