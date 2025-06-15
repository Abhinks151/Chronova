import { Category } from '../../models/category.js';

export const deleteCategoryService = async (id) => {
  try {
    const category = await Category.findById(id);
    
    if (!category) return null;

    category.isDeleted = true;
    await category.save();

    return category;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
