const express = require("express");
const router = express.Router();

const Acounter = require('../models/acounter');
const Listing = require('../models/listing');

/**
 * GET listing list.
 *
 * @return listing list | empty.
 */
router.get('/', (req, res, next) => {
  try {
    Listing.find({}).then((data) => res.json(data)).catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

/**
 * GET single listing.
 *
 * @return listing details | empty.
 */
router.get('/:listingid', (req, res, next) => {
  try {
    Listing.findOne({ listingid: req.params.listingid })
      .then((listing) => {
        if (!listing)
          return res.status(404).json({ message: 'List not found' });
        else res.status(200).json(listing);
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * POST new listing.
 *
 * @return listing details | empty.
 */
router.post('/', (req, res, next) => {
  if (req.body.title) {
    Acounter.findOne({ _id: 'listings' })
      .then((counter) => {
        req.body.listingid = counter.seq + 1;

        Listing.create(req.body)
          .then((data) => {
            Acounter.findOneAndUpdate({ _id: 'listings' }, { $inc: { seq: 1 } }, { new: true }).then();
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
});

/**
 * POST edit listing.
 *
 * @return listing details | empty.
 */
router.put('/:listingid', (req, res, next) => {
  try {
    const update = req.body;
    Listing.findOneAndUpdate({ _id: req.params.listingid }, update, { new: true })
      .then((data) => res.json({
        status: 200,
        data: data,
        message: 'Listing updated successfully',
      }))
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

/**
 * DELETE a listing.
 *
 * @return delete result | empty.
 */
router.delete('/:listingid', (req, res, next) => {
  try {
    Listing.deleteOne({ listingid: req.params.listingid })
      .then((listing) => {
        if (!listing)
          return res.status(404).json({ message: 'List not found' });
        else
          return res.status(200).json({ message: 'List deleted successfully' });
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
