const express = require("express");
const router = express.Router();

const Acounter = require('../models/acounter');
const Book = require('../models/book');

/**
 * GET book list.
 *
 * @return book list | empty.
 */
router.get('/', async (req, res, next) => {
  try {
    await Book.find({}).select('-_id').sort('bookNo')
    .then((data) => res.json(data))
    .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

/**
 * GET single book.
 *
 * @return book details | empty.
 */
router.get('/:bookId', (req, res, next) => {
  try {
    Book.findOne({ bookId: req.params.bookId })
      .then((data) => {
        if (!data)
          return res.status(404).json({ message: 'Book not found' });
        else res.status(200).json(data);
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * POST new book.
 *
 * @return book details | empty.
 */
router.post('/', (req, res, next) => {
  if (Array.isArray(req.body)) {
    const promises = [];

    req.body.forEach((item) => {
      if (item.title) {
        const promise = Acounter.findOne({ _id: 'books' })
          .then((counter) => {
            item.bookid = counter.seq + 1;

            return Book.create(item)
              .then((data) => {
                return Acounter.findOneAndUpdate({ _id: 'books' }, { $inc: { seq: 1 } }, { new: true });
              });
          });

        promises.push(promise);
      }
    });

    Promise.all(promises).then(results => {
      res.json('items created successfully');
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
      next(error);
    });

  } else {
    if (req.body.title) {
      Acounter.findOne({ _id: 'books' })
        .then((counter) => {
          req.body.bookid = counter.seq + 1;

          Book.create(req.body)
            .then((data) => {
              Acounter.findOneAndUpdate({ _id: 'books' }, { $inc: { seq: 1 } }, { new: true }).then();
              res.json(data);
            })
            .catch((error) => {
              if (error.code === 11000) {
                res.status(409).json({ error: 'Duplicate record found' });
              } else {
                res.status(500).json({ error: 'Internal server error' });
              }
              next(error);
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
          next(error);
        });
    } else {
      res.json({ error: 'An input field is either empty or invalid', });
    }
  }
});

/**
 * POST edit book.
 *
 * @return book details | empty.
 */
router.put('/:bookid', (req, res, next) => {
  if (req.body.title) {
    Book.findOneAndUpdate({ bookid: req.params.bookid }, req.body, { new: true })
      .then((book) => {
        if (book)
          res.status(200).json(book);
        else
          res.status(404).json({ error: 'Book not found' });

      })
      .catch((error) => {
        res.status(500).json({ error: 'Internal server error' });
        next(error);
      });
  } else {
    res.status(400).json({ error: 'Invalid input field(s)' });
  }
});

/**
 * DELETE a book.
 *
 * @return delete result | empty.
 */
router.delete('/:bookid', (req, res, next) => {
  try {
    Book.deleteOne({ bookid: req.params.bookid })
      .then((book) => {
        if (!book)
          return res.status(404).json({ message: 'Book not found' });
        else
          return res.status(200).json({ message: 'Book deleted successfully' });
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
