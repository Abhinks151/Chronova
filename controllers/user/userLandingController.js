import { Products } from '../../models/products.js'
import { Category } from '../../models/category.js'


export const getLandingPage = async (req, res) => {
  res.render('Layouts/users/userLanding')
}
export const getCategories = async (req, res) => {
  const categories = await Category.find().lean();
  // console.log(categories)
  res.json({
    categories
  })
}
export const getProducts = async (req, res) => {
  // console.log(req.params.id)
  const categoryProducts = await Products.find({
    category: { $in: [req.params.id] }
  }).lean();
  // console.log(products)
  res.json({
    categoryProducts
  })
}


