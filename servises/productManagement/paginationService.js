import { Products } from "../../models/products.js";

export const paginationService = async (queryParams) => {
  const {
    page = 1,
    limit = 5,
    category,
    status,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
  } = queryParams;
  // console.log(sort)


  const filter = { isDeleted: false };
  if (category && category !== 'All') filter.category = category;
  if (status) filter.status = status;
  if (brand && brand !== 'All') filter.brand = brand;
  if (search && search.trim()) {
    filter.productName = { $regex: search.trim(), $options: 'i' };
  }

  if (minPrice || maxPrice) {
    filter.salePrice = {};
    if (minPrice) filter.salePrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.salePrice.$lte = parseFloat(maxPrice);
  }

  let sortOption = {};
  if (sort === 'stock-low') {
    filter.stockQuantity = { $lte: 5 };
    sortOption = { stockQuantity: 1 };
  } else if (sort === 'name-asc') sortOption = { productName: -1 };
  else if (sort === 'name-desc') sortOption = { productName: 1 };
  else if (sort === 'price-asc') sortOption = { salePrice: 1 };
  else if (sort === 'price-desc') sortOption = { salePrice: -1 };
  else sortOption = { updatedAt: -1 };


  const skip = (parseInt(page) - 1) * parseInt(limit);
  // console.log(filter)
  // console.log(sortOption)  
  const [products, totalCount] = await Promise.all([
    Products.find(filter)
    .populate('category', 'categoryName')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),

    Products.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const categories = [
    'All',
    'Men',
    'Women',
    'Kids',
    'Unisex',
    'Luxury',
    'Formal',
    'Casual',
    'Sports',
    'Minimalist',
    'Fashion',
    'Retro',
    'Outdoor',
    'Chronograph'
  ];

  const brands = [
    'All',
    'Fossil',
    'Casio',
    'Titan',
    'Timex',
    'Rolex',
    'Seiko',
    'Tissot',
    'Michael Kors',
  ];

  const types = [
    'All',
    'Mechanical',
    'Automatic',
    'Quartz',
    'Smartwatch',
  ];

  return {
    products,
    totalCount,
    totalPages,
    currentPage: parseInt(page),
    limit: parseInt(limit),
    categories,
    brands,
    types,
  };
};

