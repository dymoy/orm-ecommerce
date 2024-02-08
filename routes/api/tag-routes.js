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
      return;
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
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new tag 
router.post('/', async (req, res) => {
  try { 
    // Use the .create() method from Tag Model to create the tag instance 
    await Tag.create({
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
      // If there are no product ids, respond with the created tag 
      res.status(200).json(tag);
    }).then((productTagIds) => {
      res.status(200).json(productTagIds);
    });
  } catch(err) {
    res.status(500).json(err);
  }
});

// Update a tag's name by its `id` value
router.put('/:id', async (req, res) => {
  // Use the .update() method in Tag Model 
  try {
    await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    }).then((tag) => {
      // If there are product ids provided in the req.body, update the products as well in ProductTag Model
      if (req.body.product_ids && req.body.product_ids.length) {
        // Find all productTag pairings with the tag_id we're updating 
        ProductTag.findAll({
          where: {tag_id: req.params.id}
        }).then((productTags) => {
          // Create filtered lists of new product_ids
          const productTagIds = productTags.map(({product_id}) => product_id);
  
          const newProductTags = req.body.product_ids
          .filter((product_id) => !productTagIds.includes(product_id))
          .map((product_id) => {
            return {
              product_id,
              tag_id: req.params.id
            }
          });
          
          // Remove any productTags that are not included in the req.body
          const productTagsToRemove = productTags
          .filter(({product_id}) => !req.body.product_ids.includes(product_id))
          .map(({id}) => id);
  
          return Promise.all([
            ProductTag.destroy({
              where: {
                id: productTagsToRemove
              }
            }),
            ProductTag.bulkCreate(newProductTags)
          ]);
        });
      }
      return res.status(200).json(tag);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Delete a Tag by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!tagData) {
      res.status(404).json({
        message: 'The requested tag id was not found.'
      });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
