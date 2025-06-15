import { Category } from '../../models/category.js';

export const toggleBlockCategoryService = async (id) => {
  try {
    const category = await Category.findById(id);

    if (!category) {
      return null;
    }

    category.isBlocked = !category.isBlocked;
    await category.save();

    return category;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
