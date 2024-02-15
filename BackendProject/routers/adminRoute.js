const express = require("express")
const adminRoute = express.Router()
const adminController = require("../contoller/adminController")
const trycatch = require("../middleware/tryCatchMiddleware")
const upload = require("../middleware/imageupload")

adminRoute.post("/login",trycatch(adminController.login))
adminRoute.get("/users",trycatch(adminController.getAllUsres))
adminRoute.get("/users/:id",trycatch(adminController.getUsersbyId))
adminRoute.post("/products",upload,trycatch(adminController.createProduct))
adminRoute.get("/products",trycatch(adminController.getAllProduct)) 
adminRoute.get("/products/category/:categoryname",trycatch(adminController.getProductsByCatogory))
adminRoute.get("/products/:id",trycatch(adminController.getProductById))
// -----------------------------------------------------------
adminRoute.put("/products",trycatch(adminController.updateProduct))
adminRoute.delete("/products",trycatch(adminController.deleteProduct))
adminRoute.get('/order',trycatch(adminController.orderDetails))
   

module.exports = adminRoute