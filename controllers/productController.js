const { render } = require("../app");
const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('addProduct', { products });
  }
  catch (err) {
    res.status(500).send(err.message);
  }
};

const createProduct = async (req, res) => {

  try {
    const product = new Product(req.body);
    await product.save();
    res.redirect('/products/add'); 


  } catch (err) {
    res.status(500).send(err.message);
  }


};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products/add');
  } catch (err) {
    res.status(500).send(err.message);
  }
}
module.exports = { getProducts, createProduct, deleteProduct };
