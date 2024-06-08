const express = require("express");
const {
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlog,
  deleteBlog,

} = require("../controllers/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/:id", getBlog);
router.post("/", authMiddleware, isAdmin, createBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);
router.get("/", getAllBlogs);

module.exports = router;