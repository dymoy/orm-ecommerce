/**
 * @file index.js
 * Executes association methods on the Sequelize models to create relationships between them
 */

// Import the Sequelize models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// `Products` belongs to `Category`
Product.belongsTo(Category, {
  foreignKey: 'category_id'
});

// `Category` has many `Product` models
Category.hasMany(Product, {
  foreignKey: 'category_id'
});

// `Product` belongs to many `Tag` models, through the `ProductTag` model
Product.belongsToMany(Tag, {
  through: ProductTag,
  foreignKey: 'product_id'
});

// `Tag` belongs to many `Product` models, through the `ProductTag` model
Tag.belongsToMany(Product, {
  through: ProductTag,
  foreignKey: 'tag_id'
})

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
