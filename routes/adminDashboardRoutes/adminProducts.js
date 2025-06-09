import express from 'express';
import productsController from '../../controllers/adminDashboard/adminProducts.js';
import {upload} from '../../config/multer.js';

const router = express.Router();

// Products page routes
router.get('/products', productsController.index);
router.get('/products/add', (req, res) => {
  res.render('Layouts/adminDashboard/addProducts');
});

router.post('/products/add', upload.any(), async (req, res) => {
  try {
    console.log('Text fields:', req.body);
    console.log('Files:', req.files); 

    res.status(200).redirect('/admin/products');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/edit/:id', (req, res) => {
  res.render('products/edit', { title: 'Edit Product', productId: req.params.id });
});

// API routes for AJAX
router.get('/api/products/filter', productsController.getFilteredProducts);
router.get('/api/products/:id', productsController.getProduct);
router.delete('/api/products/:id', productsController.deleteProduct);

export default router;
