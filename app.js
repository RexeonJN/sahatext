const path = require('path');
var fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");


const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const Brand = require('./models/brand');
const Category= require('./models/category');
const Review = require('./models/review');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const app = express();


const csrfProtection = csrf();

//const privateKey = fs.readFileSync('server.key');
//const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
    
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use(
  session({
    secret: "keyboard cat",
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    proxy: true, // if you do SSL outside of node.
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));


app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
Product.belongsTo(Brand, { constraints: true, onDelete: 'CASCADE' });
Brand.hasMany(Product);
Product.belongsTo(Category, { constraints: true, onDelete: 'CASCADE' });
Category.hasMany(Product);
Review.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Review);
Review.belongsTo(Product, { constraints: true, onDelete: 'CASCADE' });
Product.hasMany(Review);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
 //  .sync({ force: true })
 .sync()
  .then(result => {

    
   // https.
   // createServer({key:privateKey, cert:certificate}, app).
   // listen(process.env.PORT || 3000);
    app.listen(8000);
  })
  .catch(err => {
    console.log(err);
  });
