/**
 * @file product-routes.js
 * Implements the API routes for the `Product` model using endpoint '/api/products'
 */

const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

/**
 * @route GET '/api/products/'
 * Finds and returns all products, including its associated `Category` and `Tag` data 
 */
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      // Aggregate id, product_name, price, and stock from `Product`
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
        { model: Category,
          // Aggregate id and category_name from `Category`
          attributes: ['id', 'category_name']
        },
        // Aggregate `Tag` data 
        { model: Tag}
      ]
    });
    
    if (!productData) {
      res.status(404).json({
        message: 'No products were found'
      });
      return;
    }
    
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @route GET '/api/products/:id'
 * Find and return a product by its `id`, including its associated `Category` and `Tag` data
 */
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(
      req.params.id, 
      {
        attributes: ['id', 'product_name', 'price', 'stock'],
        include: [
          { model: Category,
            attributes: ['id', 'category_name']
          },
          { model: Tag}
        ]
      }
    );

    if(!productData) {
      res.status(404).json({
        message: 'The requested product id was not found.'
      });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @route POST '/api/products/'
 * Creates a new `Product` instance with req.body: 
 *    {
 *      "product_name": STRING,
 *      "price": DECIMAL,
 *      "stock": INT,
 *      "category_id": INT,
 *      "tagIds": ARRAY
 *    }
 */
router.post('/', (req, res) => {
  Product.create({
    // Destructure the req.body 
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    tagIds: req.body.tagIds
  }).then((product) => {
      // If there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // If no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

/**
 * @route PUT '/api/products/:id'
 * Update a `Product` by `id`
 */
router.put('/:id', (req, res) => {
  // Update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // Create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

          // Figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
          
          // Run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

/**
 * @route DELETE '/api/products/:id'
 * Delete a `Product` by its `id` value
 */
router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!productData) {
      res.status(404).json({
        message: 'The requested product id was not found.'
      });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
