const express = require("express");
const {
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlog,
  deleteBlog,
  liketheBlog,
  disliketheBlog,
  uploadImages,

} = require("../controllers/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileUpload");
const router = express.Router();
router.get("/:id", getBlog);
router.post("/", authMiddleware, isAdmin, createBlog)
router.put("/likes", authMiddleware, liketheBlog);;
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

router.get("/", getAllBlogs);

router.put("/dislikes", authMiddleware, disliketheBlog);
router.post("/upload", upload.array("images", 10), authMiddleware,isAdmin,uploadImages);

module.exports = router;