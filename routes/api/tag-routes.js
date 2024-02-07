const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// Find all tags, including its associated Product data
router.get('/', async (req, res) => {
  try {
    // Use .findAll() Model method to get all tags
    const tagData = await Tag.findAll({
      // Use the 'include' attribute to get associated Product data 
      include: [{model: Product}]
    });

    // Return status 404 if no tag data was found 
    if (!tagData) {
      res.status(404).json({
        message: 'No tags were found'
      });
    }

    // If tags were found, return status 200 and the tagData 
    res.status(200).json(tagData);
  } catch (err) {
    // Return any other errors with status code 500
    res.status(500).json(err);
  }
});

// Find a single tag by its `id`, incuding its associated Product data 
router.get('/:id', async (req, res) => {
  try {
    // Use .findByPk() Model method to get the tag using the id in the request params
    const tagData = await Tag.findByPk(
      req.params.id,
      {
        // Use the 'include' attribute to get associated Product data 
        include: [{ model: Product }]
      }
    );

    if (!tagData) {
      res.status(404).json({
        message: 'No tag was found with the requested id.'
      });
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new tag 
router.post('/', (req, res) => {
  // Use the .create() method from Tag Model to create the tag instance 
  Tag.create({
    tag_name: req.body.tag_name,
    product_ids: req.body.product_ids
  }).then((tag) => {
    // If there are product ids, create pairings to bulkCreate in the ProductTag Model
    if (req.body.product_ids.length) {
      const productTagIdArr = req.body.product_ids.map((product_id) => {
        return {
          product_id,
          tag_id: tag.id
        }
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // If ther eare no product ids, respond with the created tag 
    res.status(200).json(tag);
  }).then((productTagIds) => {
    res.status(200).json(productTagIds);
  }).catch((err) => {
    res.status(500).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
