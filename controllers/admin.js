const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const Brand = require('../models/brand');
const Category = require('../models/category');

exports.getAddProduct = (req, res, next) => {
  let brands;
  let categories;

  Brand
    .findAll()
    .then(fetchedbrands => {
      brands = fetchedbrands;
      return Category.findAll();
    })
    .then(fetchedcategory => {
      categories = fetchedcategory;
      return categories;
    })
    .then(cat => {
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
      brandslist: brands,
       categories: cat, 
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [] 
      }); 
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

 
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const brand = req.body.brand_id;
  const category = req.body.category_id;
  const image = req.file;
  const color = req.body.color;
  const selling_price = req.body.selling_price;
  const discount_price = req.body.discount_price;
  const product_qty = req.body.product_qty;
  const product_code = req.body.product_code;
  const description = req.body.description;

 
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  console.log(category);
  console.log(brand);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const product = {
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    brandId: brand,
    categoryId: category,
    imageUrl: imageUrl,
    color: color,
    selling_price: selling_price,
    discount_price: discount_price,
    product_qty: product_qty,
    status: product_qty,
    product_code: product_code,
    description: description,
    userId: req.user.id
  };
  Product
    .create(product)
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findByPk(prodId)
    .then(product => {
      
      if (product.userId.toString() !== req.user.id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



// brand

exports.getAddBrand = (req, res, next) => {
  res.render('admin/add_brand', {
    pageTitle: 'Add Brand',
    path: '/admin/add-brand',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddBrand = (req, res, next) => {
  const brand_name = req.body.title;
  const image = req.file;
  if (!image) {
    return res.status(422).render('admin/add_brand', {
      pageTitle: 'Add Brand',
      path: '/admin/add-brand',
      hasError: true,
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/add_brand', {
      pageTitle: 'Add Brand',
      path: '/admin/add_brand',
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const brand = {
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    brand_name: brand_name,
    imageUrl: imageUrl
  };
  Brand
    .create(brand)
    .then(result => {
      // console.log(result);
      console.log('Brand Added');
      res.redirect('/admin/home');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// end brand



// category


exports.getAddCategory = (req, res, next) => {
  res.render('admin/add_category', {
    pageTitle: 'Add Category',
    path: '/admin/add-category',
    hasError: false,
    editing: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddCategory = (req, res, next) => {
  const cat_title = req.body.title;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/add_category', {
      pageTitle: 'Add Category',
      path: '/admin/add-category',
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const category = {
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    category_name: cat_title,
  };
  Category
    .create(category)
    .then(result => {
      // console.log(result);
      console.log('Added Category');
      res.redirect('/admin/home');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// end category

exports.getProducts = (req, res, next) => {
  Product.findAll( {
    where: {
      userId: req.user.id
    }
  } )
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.destroy({ where: { id: prodId, userId: req.user.id } });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
