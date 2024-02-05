const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// Find all categories, including its associated products
router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }]
    });
    
    if (!categoryData) {
      res.status(404).json({
        message: 'No categories were found'
      });
      return;
    }
    
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Find a category by its `id` value, including its associated products
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(
      req.params.id, 
      {
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

router.post('/', (req, res) => {
  // create a new category
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
