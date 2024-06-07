const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
// const validateMongoDbId = require("../utils/validateMongodbId");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});
const getProductById = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  });
  
  // Get all products
  const getAllProducts = asyncHandler(async (req, res) => {
    try {
        // fillter
      const quaryobj={...req.query}

      const excludeFields = ["page", "sort", "limit", "fields"];
   
      excludeFields.forEach((el)=> delete quaryobj[el])
  
      let queryStr = JSON.stringify(quaryobj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
         console.log(quaryobj,excludeFields);
        
         let query = Product.find(JSON.parse(queryStr));
           // Sorting

    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }
  
      // limiting the fields
  
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }
  
      // pagination
  
      const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This Page does not exists");
      }
         const product= await query

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

  const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.title = req.body.title || product.title;
      product.slug = req.body.title ? slugify(req.body.title) : product.slug;
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      // Update other fields as needed
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  });
  
  // Delete a product by ID
  const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      await Product.deleteOne({ _id: productId });
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  });
  





module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
};