import { Category } from '../../models/category.js';
import { logger } from '../../config/logger.js';

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
    logger.error('Error:', error);
    throw error;
  }
};
