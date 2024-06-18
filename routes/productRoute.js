const express = require("express");
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadProductImages,

} = require("../controllers/productCtrl");
const upload = require("../middlewares/fileUpload");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/",  authMiddleware,isAdmin,createProduct);
router.get("/:id",getProductById);
router.get("/",getAllProducts);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware,isAdmin,updateProduct);
router.delete("/:id", authMiddleware,isAdmin,deleteProduct);

// File upload route
router.post(
  "/upload",
  authMiddleware,
  isAdmin,
  upload.array("images", 10), // Handle multiple file uploads
  uploadProductImages // Controller to handle the file paths and update the product
);
module.exports = router;