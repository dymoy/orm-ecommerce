/**
 * @file category-routes.js
 * Implements the API routes for the `Category` model using endpoint `/api/categories`
 */

const router = require('express').Router();
const { Category, Product } = require('../../models');

/**
 * @route GET `/api/categories/`
 * Finds and returns all categories, including its associated `Products`
 */
router.get('/', async (req, res) => {
  try {
    // Uses the .findAll() method to read all `Category` data 
    const categoryData = await Category.findAll({
      // Uses `include` option to aggregate the associated `Product` data 
      include: [{ model: Product }]
    });
    
    // Return a 404 status code if no categories were found
    if (!categoryData) {
      res.status(404).json({
        message: 'No categories were found.'
      });
      return;
    }
    
    // Else, return the found instances of `Category` to the client
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @route GET '/api/categories/:id`
 * Find and return a category by its `id` value, including its associated `Products`
 */
router.get('/:id', async (req, res) => {
  try {
    // Uses the .findByPk() method to search `Category` by primary key, using the `id` in the route parameters
    const categoryData = await Category.findByPk(
      req.params.id, 
      {
        // Uses `include` option to aggregate the associated `Product` data 
        include: [{ model: Product }]
      }
    );

    if(!categoryData) {
      res.status(404).json({
        message: 'The requested category id was not found.'
      });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @route POST '/api/categories/'
 * Creates a new `Category` instance with req.body: 
 *    {
 *      "category_name": STRING
 *    }
 */
router.post('/', async (req, res) => {
  try {
    // Uses the .create() method to instantiate an instance of `Category` with the `category_name` from req.body
    const categoryData = await Category.create({
      category_name: req.body.category_name
    });

    res.status(200).json(categoryData);
  } catch (err) {
    // Returns 400 bad request 
    res.status(400).json(err);
  }
});

/**
 * @route PUT '/api/categories/:id'
 * Update a `Category` by `id`
 */
router.put('/:id', async (req, res) => {
  try {
    // Uses the .update() method with the `where` option to update the Category with `id` information in req.body
    const categoryData = await Category.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    if (!categoryData) {
      res.status(404).json({
        message: 'The requested category id was not found.'
      });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @route DELETE '/api/categories/:id'
 * Delete a `Category` by its `id` value
 */
router.delete('/:id', async (req, res) => {
  try {
    // Uses the .destroy() method with the `where` option to remove the `Category` with the requested  `id`.
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!categoryData) {
      res.status(404).json({
        message: 'The requested category id was not found.'
      });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
