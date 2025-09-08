const express = require("express");
const router = express.Router();

const Acounter = require('../models/acounter');
const Edit = require('../models/edit');

/**
 * GET edit list.
 *
 * @return edit list | empty.
 */
router.get('/', (req, res, next) => {
  try {
    Edit.find({}).then((data) => res.json(data)).catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

/**
 * GET single edit.
 *
 * @return edit details | empty.
 */
router.get('/:editid', (req, res, next) => {
  try {
    Edit.findOne({ editid: req.params.editid })
      .then((edit) => {
        if (!edit)
          return res.status(404).json({ message: 'Edit not found' });
        else res.status(200).json(edit);
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * POST new edit.
 *
 * @return edit details | empty.
 */
router.post('/', (req, res, next) => {
  if (req.body.title) {
    Acounter.findOne({ _id: 'edits' })
      .then((counter) => {
        req.body.editid = counter.seq + 1;

        Edit.create(req.body)
          .then((data) => {
            Acounter.findOneAndUpdate({ _id: 'edits' }, { $inc: { seq: 1 } }, { new: true }).then();
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
 * POST edit edit.
 *
 * @return edit details | empty.
 */
router.post('/:editid', (req, res, next) => {
  let myquery = { _id: ObjectId(req.params.editid) };
  if (req.body.title) {
    Edit.updateOne(myquery, req.body, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      response.json(res);
    }).then((data) => res.json(data)).catch(next);
  } else {
    res.json({ error: 'An input field is either empty or invalid', });
  }
});

/**
 * DELETE a edit.
 *
 * @return delete result | empty.
 */
router.delete('/:editid', (req, res, next) => {
  try {
    Edit.deleteOne({ editid: req.params.editid })
      .then((edit) => {
        if (!edit)
          return res.status(404).json({ message: 'Edit not found' });
        else
          return res.status(200).json({ message: 'Edit deleted successfully' });
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
