const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');
const User = require('../models/user');
const Brand = require('../models/brand');
const Category = require('../models/category');
const Review = require('../models/review');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
 let brandlist;
 let categorylist;
 let uname = null;
 if(req.user){
   uname = req.user.name;
 }
Brand.findOne({ where: { brand_name: 'turtle' }})
.then(b =>{
  b.getProducts({limit: 4})
  .then(bpro => {
    brandlist = bpro;
    Category.findOne({ where:{ category_name: 'style'}})
    .then(c => {
      c.getProducts({limit: 4})
      .then(cpro => {
        categorylist = cpro;
        Product.findAll({limit: 4})
        .then(products => {
          res.render('shop/product-list', {
            prods: products,
            brandslist: brandlist,
            categorieslist: categorylist,
            name: uname
          })
            
          });
        })
      })
    })
  })
 
};

exports.getProduct = (req, res, next) => {
const prodId = req.params.productId;
 let categorylist;
 let dprod;
 let dbrand;
 let uname = null;

 if(req.user){
   uname = req.user.name;
 }
  Product.findByPk(prodId)
    .then(detproduct => {
      dprod = detproduct;
      detproduct.getBrand()
      .then(bfprod => {
        dbrand = bfprod;
    Category.findOne({ where:{ category_name: 'style'}})
    .then(c => {
      c.getProducts({limit: 4})
      .then(cpro => {
        categorylist = cpro;
        Product.findAll({limit: 4})
        .then(products => {
          Review.findAll({ where: { productId: prodId } })
          .then(rev => {
            
           res.render('shop/product-detail', {
              prods: products,
              categorieslist: categorylist,
              name: uname,
              detailedproduct: dprod,
              bofprod: dbrand,
              pid: prodId,
              revie: rev
  
            }) 

          })
              
          });
        })
      })
      })
     
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
    
};


exports.postReview = (req, res, next) => {
 const name = req.body.name;
 const review = req.body.review;
 const prid = req.body.proid;
 const newreview = {
  // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
  comment: name,
  summary: review,
  userId: req.user.id,
  productId: prid
};
Review
  .create(newreview)
  .then(result => {
    // console.log(result);
    console.log('Review Added');
    res.redirect('/products');
  })
 
}

exports.getIndex = (req, res, next) => {
  
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
       
      });
   
    
};

exports.getCart = (req, res, next) => {

  let categorylist;
 let uname = null;

  if(req.user){
    uname = req.user.name;
  }

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {

      Category.findOne({ where:{ category_name: 'style'}})
    .then(c => {
      c.getProducts({limit: 4})
      .then(cpro => {
        categorylist = cpro;
        Product.findAll({limit: 4})
        .then(productsbycat => {
          res.render('shop/cart', {
            prods: productsbycat,
            products: products,
            categorieslist: categorylist,
            name: uname
          })
            
          });
        })
      })
     
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
    
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(err => console.log(err));
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
 .getOrders({include: ['products']})
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
   
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findByPk(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.userId.toString() !== req.user.id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.getProducts.forEach(prod => {
        totalPrice += prod.quantity * prod.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
