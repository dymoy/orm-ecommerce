/**
 * @file tag-routes.js
 * Implements the API routes for the `Tag` model using endpoint '/api/tags'
 */

const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

/**
 * @route GET '/api/tags/'
 * Finds and returns all tags, including its associated `Product` data 
 */
router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{model: Product}]
    });

    if (!tagData) {
      res.status(404).json({
        message: 'No tags were found'
      });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @route GET '/api/tags/:id'
 * Find and return a single tag by its `id`, including its associated `Product` data
 */
router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(
      req.params.id,
      {
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

/**
 * @route POST '/api/tags/'
 * Creates a new `Tag` instance with req.body: 
 *    {
 *      "tag_name": STRING,
 *      "product_ids": ARRAY 
 *    }
 */
router.post('/', async (req, res) => {
  try { 
    await Tag.create({
      tag_name: req.body.tag_name,
      product_ids: req.body.product_ids
    }).then((tag) => {
      // If there are product tags, create pairings to bulkCreate in the `ProductTag` model
      if (req.body.product_ids.length) {
        const productTagIdArr = req.body.product_ids.map((product_id) => {
          return {
            product_id,
            tag_id: tag.id
          }
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // If there are no product tags, respond with the created tag 
      res.status(200).json(tag);
    }).then((productTagIds) => {
      res.status(200).json(productTagIds);
    });
  } catch(err) {
    res.status(500).json(err);
  }
});

/**
 * @route PUT '/api/tags/:id'
 * Update a `Tag` by its `id` value
 */
router.put('/:id', async (req, res) => {
  try {
    await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    }).then((tag) => {
      if (req.body.product_ids && req.body.product_ids.length) {
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
          
          // Find any productTags that are not included in the req.body
          const productTagsToRemove = productTags
          .filter(({product_id}) => !req.body.product_ids.includes(product_id))
          .map(({id}) => id);
  
          // Run both actions
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

/**
 * @route DELETE '/api/tags/:id'
 * Delete a `Tag` by its `id` value
 */
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
