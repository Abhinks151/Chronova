import { Category } from '../../models/category.js';
import { logger } from '../../config/logger.js';

export const deleteCategoryService = async (id) => {
  try {
    const category = await Category.findById(id);

    if (!category) return null;

    category.isDeleted = true;
    await category.save();


    return category;
  } catch (error) {
    logger.error('Error:', error);
    throw error;
  }
};
