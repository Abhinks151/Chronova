import { Cart } from '../../models/cart.js';
import { Products } from '../../models/products.js';
import { Wishlist } from '../../models/wishlist.js';


export const getCartedProducts = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    populate: {
      path: 'category',
      model: 'Category'
    }
  });

  if (!cart) return null;

  const validItems = cart.items.filter(item => {
    const product = item.productId;

    if (!product) return false;

    if (product.isBlocked || product.isDeleted) return false;

    const categoryIssue = Array.isArray(product.category)
      ? product.category.some(cat => cat.isBlocked || cat.isDeleted)
      : false;

    return !categoryIssue;
  });

  if (validItems.length === 0) {
    await Cart.deleteOne({ userId });
    return null;
  }

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    populate: {
      path: 'category',
      model: 'Category'
    }
  });

  return cart;
};

  
export const postAddToCartService = async (userId, productId, quantity) => {
  const product = await Products.findById(productId).populate('category');
  if (!product || product.isDeleted || product.isBlocked) {
    throw new Error('Product is unavailable.');
  }

  const cateogryBlocked = product.category.some((cat) => {
    return cat.isBlocked || cat.isDeleted;
  })
  if (cateogryBlocked) {
    throw new Error('Product category is unavailable.');
  }

  if (!product.stockQuantity || product.stockQuantity < 1) {
    throw new Error('Product is out of stock.');
  }

  if (quantity < 1) {
    throw new Error('Quantity must be at least 1.');
  }

  if (quantity > 5) {
    throw new Error('Maximum 5 items allowed per product.');
  }

  if (quantity > product.stockQuantity) {
    throw new Error(`Only ${product.stockQuantity} item(s) in stock.`);
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [{ productId, quantity }]
    });
    return await cart.save();
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId.toString());

  if (cartItem) {
    const newTotalQty = cartItem.quantity + quantity;

    if (newTotalQty > 5) {
      throw new Error('Cannot add more than 5 units of this product.');
    }

    if (newTotalQty > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} item(s) in stock.`);
    }

    cartItem.quantity = newTotalQty;
  } else {
    if (quantity > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} item(s) in stock.`);
    }

    cart.items.push({ productId, quantity });
  }

  //remove from wishlist
  await Wishlist.deleteOne({userId,productId});
  // Wishlist.save();

  return await cart.save();
};

export const updateCartService = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;

  const product = await Products.findById(productId);
  if (!product || product.isDeleted || product.isBlocked) {
    throw new Error('Product is unavailable.');
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId.toString());
  if (!cartItem) return null;

  if (quantity > 5) {
    throw new Error('Maximum 5 items allowed per product.');
  }

  if (quantity > product.stockQuantity) {
    throw new Error(`Only ${product.stockQuantity} item(s) in stock.`);
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return null;
    }
  } else {
    cartItem.quantity = quantity;
  }

  await cart.save();
  return cart;
};



export const removeCartService = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return null;
  }

  cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());

  if (cart.items.length === 0) {
    await Cart.deleteOne({ userId });
    return null;
  }

  return await cart.save();
}


export const getCartCountService = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return 0;

  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

