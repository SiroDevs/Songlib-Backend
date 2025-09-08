const express = require("express");
const router = express.Router();

const Acounter = require('../models/acounter');
const Song = require('../models/song');

/**
 * GET song list.
 *
 * @return song list | empty.
 */
router.get('/', async (res, next) => {
  try {
    await Song.find({}).select('-_id').sort('songId')
      .then((songs) => res.json({ count: songs.length, data: songs }))
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

/**
 * GET songs matching a book numbers.
 *
 * @return song details | empty.
 */
router.get('/book/:ids', async (req, res, next) => {
  try {
    const ids = req.params.ids.split(',');
    Song.find({ book: { $in: ids } }).select('-_id').sort('songId')
      .then((songs) => {
        if (songs.length === 0)
          return res.status(404).json({ message: 'No songs found for the specified books' });
        else res.status(200).json({ count: songs.length, data: songs });
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * POST new song.
 *
 * @return song details | empty.
 */
router.post('/', (req, res, next) => {
  if (Array.isArray(req.body)) {
    const promises = [];

    req.body.forEach((song) => {
      if (song.title) {
        const promise = Acounter.findOne({ _id: 'songs' })
          .then((counter) => {
            song.songId = counter.seq + 1;

            return Song.create(song)
              .then((data) => {
                return Acounter.findOneAndUpdate({ _id: 'songs' }, { $inc: { seq: 1 } }, { new: true });
              });
          });
        promises.push(promise);
      }
    });

    Promise.all(promises).then(songs => {
      res.json(songs.length + ' songs saved successfully');
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
      next(error);
    });

  } else {
    if (req.body.title) {
      Acounter.findOne({ _id: 'songs' })
        .then((counter) => {
          req.body.songId = counter.seq + 1;

          Song.create(req.body)
            .then((data) => {
              Acounter.findOneAndUpdate({ _id: 'songs' }, { $inc: { seq: 1 } }, { new: true }).then();
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
 * GET single song.
 *
 * @return song details | empty.
 */
router.get('/:songId', (req, res, next) => {
  try {
    Song.findOne({ songId: req.params.songId })
      .then((song) => {
        if (!song) res.status(404).json({ message: 'Song not found' });
        else res.status(200).json(song);
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * PUT song. (Update a song)
 *
 * @return song details | empty.
 */
router.put('/:songId', (req, res, next) => {
  if (req.body.title) {
    Song.findOneAndUpdate({ songId: req.params.songId }, req.body, { new: true })
      .then((song) => {
        if (song)
          res.status(200).json(song);
        else
          res.status(404).json({ error: 'Song not found' });

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
 * PUT many songs (Update many songs)
 */
router.put('/bulk/:value', (req, res, next) => {
  try {
    const valueToAdd = parseInt(req.params.value);
    Song.find({ book: req.params.songId })
      .then((songs) => {
        if (songs.length === 0) {
          return res.status(404).json({ message: 'No songs found for the specified book' });
        } else {
          const promises = songs.map((song) => {
            return Song.findOneAndUpdate(
              { _id: song._id },
              { $set: { songId: song.songNo + valueToAdd } },
              { new: true }
            );
          });

          Promise.all(promises)
            .then((updatedSongs) => {
              res.status(200).json(songs.length + ' songs updated successfully');
            })
            .catch((error) => {
              res.status(500).json({ error: 'Internal server error' });
              next(error);
            });
        }
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * DELETE a song.
 *
 * @return delete result | empty.
 */
router.delete('/:songId', (req, res, next) => {
  try {
    Song.deleteOne({ songId: req.params.songId })
      .then((song) => {
        if (!song)
          return res.status(404).json({ message: 'Song not found' });
        else
          return res.status(200).json({ message: 'Song deleted successfully' });
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

/**
 * DELETE a song.
 *
 * @return delete result | empty.
 */
router.delete('/bulk/:book', (req, res, next) => {
  try {
    Song.find({ book: req.params.book })
      .then((songs) => {
        if (songs.length === 0) {
          return res.status(404).json({ message: 'No songs found for the specified book' });
        } else {
          const promises = songs.map((song) => {
            return Song.deleteOne({ songId: song.songId });
          });

          Promise.all(promises)
            .then((updatedSongs) => {
              res.status(200).json(songs.length + ' songs deleted successfully');
            })
            .catch((error) => {
              res.status(500).json({ error: 'Internal server error' });
              next(error);
            });
        }
      })
      .catch(next);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
