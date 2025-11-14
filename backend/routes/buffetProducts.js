const express = require('express');
const router = express.Router();
const buffetProductsController = require('../controllers/buffetProductsController');
const { authenticateToken, checkRole } = require('../middleware/auth');

// همه route ها نیاز به احراز هویت دارند
router.use(authenticateToken);

// GET /api/buffet-products - دریافت همه محصولات
router.get('/', buffetProductsController.getAllProducts);

// GET /api/buffet-products/categories - دریافت دسته‌بندی‌ها
router.get('/categories', buffetProductsController.getCategories);

// GET /api/buffet-products/low-stock - محصولات کم موجودی
router.get('/low-stock', buffetProductsController.getLowStockProducts);

// GET /api/buffet-products/:id - دریافت یک محصول
router.get('/:id', buffetProductsController.getProductById);

// POST /api/buffet-products - ایجاد محصول (فقط ادمین و آشپز)
router.post('/', checkRole(['admin', 'super_admin', 'chef']), buffetProductsController.createProduct);

// PUT /api/buffet-products/:id - به‌روزرسانی محصول (فقط ادمین و آشپز)
router.put('/:id', checkRole(['admin', 'super_admin', 'chef']), buffetProductsController.updateProduct);

// PATCH /api/buffet-products/:id/stock - به‌روزرسانی موجودی (فقط ادمین و آشپز)
router.patch('/:id/stock', checkRole(['admin', 'super_admin', 'chef']), buffetProductsController.updateStock);

// DELETE /api/buffet-products/:id - حذف محصول (فقط ادمین و آشپز)
router.delete('/:id', checkRole(['admin', 'super_admin', 'chef']), buffetProductsController.deleteProduct);

module.exports = router;
