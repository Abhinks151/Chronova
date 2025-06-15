import { Category } from '../../models/category.js';

export const editCategoryService = async (id, updateData) => {
  try {
    const update = {
      categoryName: updateData.name,
      type: updateData.type,
      description: updateData.description,
      products: updateData.products || []
    };

    const updatedCategory = await Category.findByIdAndUpdate(id, update, {
      new: true
    });

    return updatedCategory;
  } catch (error) {
    console.error('Error in service while updating category:', error);
    throw error;
  }
};
