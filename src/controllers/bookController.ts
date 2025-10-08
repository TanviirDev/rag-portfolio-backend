import type { Request, Response, NextFunction } from 'express';

import pool from '../db.js';

export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await pool.query('select * from books');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new Error('Invalid book ID');
    }
    const book = await pool.query('select * from books where book_id = $1', [
      id,
    ]);
    if (!book.rows.length) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    res.status(200).json(book.rows);
  } catch (error) {
    next(error);
  }
};
