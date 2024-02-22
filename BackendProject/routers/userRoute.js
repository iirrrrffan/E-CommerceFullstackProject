const express=require("express")
const userRouter=express.Router()
const userController=require("../contoller/userController")
 const trycatch=require("../middleware/tryCatchMiddleware")
 const varifyTocken = require("../middleware/userAuthMiddleware")

 
//   .use(varifyTocken)
 userRouter.post("/register",trycatch(userController.createUser))
 userRouter.post("/login",trycatch(userController.userLogin))
 userRouter.get("/products",trycatch(userController.productList))
 userRouter.get("/products/:id",trycatch(userController.productGetById))


 userRouter.get("/products/category/:categoryname",varifyTocken,trycatch(userController.ProductByCategory))
 userRouter.post("/:id/cart",trycatch(userController.addToCart)) 
userRouter.delete("/:id/cart",trycatch(userController.deleteFromCart))

userRouter.get("/:id/cart",trycatch(userController.showCart))

// -----------------------------------------
userRouter.post("/:id/addtowishList",varifyTocken,trycatch(userController.addWishList))
userRouter.get("/:id/wishList",varifyTocken,trycatch(userController.showWishList))
userRouter.delete("/:id/wishList",varifyTocken,trycatch(userController.deleteWishList))
userRouter.post("/:id/payment",varifyTocken,trycatch(userController.payment))
userRouter.get('/payment/success',trycatch(userController.success))
userRouter.post('/payment/cancel',varifyTocken,trycatch(userController.cancel))
userRouter.get('/order',varifyTocken,trycatch(userController.showOrders))

 module.exports=userRouter; 