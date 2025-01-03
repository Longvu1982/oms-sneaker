import express from 'express';
import * as OrderController from '../controllers/order.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

// Acess : Public
// GET: List all the books
router.post('/list', OrderController.listOrders);

// Acess : Public
// GET : Get One book by ID
// Params query : id
router.get('/:id', OrderController.checkExistingBook, OrderController.getBook);

// Acess : Private
// POST : Create one book
// Params body : title , authorId , datePublished , isFiction
router.post(
  '/create',
  protectAuth,
  OrderController.validateOrderData,
  // OrderController.checkExistingBookAuthor,
  OrderController.createOrder
);

// Acess : Private
// PUT : update one book
// Params query : id
// Params body : title , authorId , datePublished , isFiction
router.put(
  '/:id',
  protectAuth,
  OrderController.validateOrderData,
  OrderController.checkExistingBook,
  OrderController.checkExistingBookAuthor,
  OrderController.updateBook
);

router.put('/:id/changeStatus', protectAuth, OrderController.updateOrderStatus);

// Acess : Private
// DELETE : delete a book
// Params query : id
router.delete('/:id', protectAuth, OrderController.checkExistingBook, OrderController.deleteBook);

export default router;
