const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
      body('color')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('selling_price').isFloat(),
    body('discount_price').isFloat(),
    body('product_code').isFloat(),
    body('product_qty').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

// brand

// /admin/add-brand => GET
router.get('/add-brand', isAuth, adminController.getAddBrand);

// /admin/add-brand => POST
router.post(
  '/add-brand',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim()
  ],
  isAuth,
  adminController.postAddBrand
);

// end brand


// category

// /admin/add-category => GET
router.get('/add-category', isAuth, adminController.getAddCategory);

// /admin/add-category => POST
router.post(
  '/add-category',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim()
  ],
  isAuth,
  adminController.postAddCategory
);

// end category

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
