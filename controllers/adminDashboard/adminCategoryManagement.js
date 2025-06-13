import { addCategoryService } from "../../servises/adminCategoryManagemnt/addCategoryService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";


export const addCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await addCategoryService(categoryData);
    res.status(httpStatusCode.CREATED.code).json(category);
  } catch (error) {
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'An error occurred' });
  }
};