const express = require("express");
const {
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlog,
  deleteBlog,
  liketheBlog,
  disliketheBlog,

} = require("../controllers/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/:id", getBlog);
router.post("/", authMiddleware, isAdmin, createBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

router.get("/", getAllBlogs);
router.put("/likes", authMiddleware, liketheBlog);
router.put("/dislikes", authMiddleware, disliketheBlog);

module.exports = router;