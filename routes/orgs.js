const express = require("express");
const router = express.Router();

const Acounter = require('../models/acounter');
const Org = require('../models/org');

/**
 * GET org list.
 *
 * @return org list | empty.
 */
router.get('/', (req, res, next) => {
  try {
    Org.find({}).then((data) => res.json(data)).catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

/**
 * GET single org.
 *
 * @return org details | empty.
 */
router.get('/:orgid', (req, res, next) => {
  try {
    Org.findOne({ orgid: req.params.orgid })
      .then((org) => {
        if (!org)
          return res.status(404).json({ message: 'Org not found' });
        else res.status(200).json(org);
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * POST new org.
 *
 * @return org details | empty.
 */
router.post('/', (req, res, next) => {
  if (req.body.title) {
    Acounter.findOne({ _id: 'orgs' })
      .then((counter) => {
        req.body.orgid = counter.seq + 1;

        Org.create(req.body)
          .then((data) => {
            Acounter.findOneAndUpdate({ _id: 'orgs' }, { $inc: { seq: 1 } }, { new: true }).then();
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
 * POST org org.
 *
 * @return org details | empty.
 */
router.post('/:orgid', (req, res, next) => {
  let myquery = { _id: ObjectId(req.params.orgid) };
  if (req.body.title) {
    Org.updateOne(myquery, req.body, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      response.json(res);
    }).then((data) => res.json(data)).catch(next);
  } else {
    res.json({ error: 'An input field is either empty or invalid', });
  }
});

/**
 * DELETE a org.
 *
 * @return delete result | empty.
 */
router.delete('/:orgid', (req, res, next) => {
  try {
    Org.deleteOne({ orgid: req.params.orgid })
      .then((org) => {
        if (!org)
          return res.status(404).json({ message: 'Org not found' });
        else
          return res.status(200).json({ message: 'Org deleted successfully' });
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
