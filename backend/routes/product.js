const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { getProducts, 
    getSingleProduct,
    getAdminProducts,
    deleteProduct,
    newProduct,
    updateProduct,
    createProductReview,
    getProductReviews,
    deleteReview,
    productSales,
 } = require('../controllers/product');

 const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/products', getProducts)
router.get('/product/:id', getSingleProduct)
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
// router.delete('/admin/product/:id', isAuthenticatedUser, deleteProduct);
router.route('/admin/product/:id', isAuthenticatedUser, ).put(updateProduct).delete(deleteProduct);
router.post('/admin/product/new', isAuthenticatedUser, upload.array('images', 10), newProduct);
router.put('/review', isAuthenticatedUser, createProductReview);
router.get('/reviews',isAuthenticatedUser, getProductReviews)
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview)
router.get('/admin/product-sales', productSales);
module.exports = router;