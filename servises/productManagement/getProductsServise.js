import { Products } from "../../models/products.js";

export const getProductsServise = async () => {
  const products = await Products.find({isDeleted : false}).sort({ createdAt: -1 }).lean();

  const updatedProducts = products.map(product => {
    return {
      ...product,
      specifications: {
        "Strap Type": product.strapType || 'N/A',
        "Color": product.color || 'N/A',
        "Dial Size": product.dialSize ? `${product.dialSize}mm` : 'N/A',
        "Dial Shape": product.dialShape || 'N/A',
        "Movement": product.movement || 'N/A',
        "Water Resistance": product.waterResistance || 'N/A',
        "Warranty": product.warranty || 'N/A',
        "Weight": product.weight ? `${product.weight}g` : 'N/A'
      }
    };
  });

  return {
    data: updatedProducts,
    brands: [
      "Apple", "Samsung", "Sony", "Nike", "Adidas", "LG", "Puma", "Whirlpool"
    ],
    categories: ['All', 'Men', 'Women', 'Kids'],
    types: ['All', 'Mechanical', 'Automatic', 'Quartz']
  };
};
