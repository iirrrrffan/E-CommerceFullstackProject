const Users=require("../models/userSchema")
const {joiUserSchema}=require("../models/validationSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Product = require("../models/productSchema")
// --------------------------------------------------------------
const Stripe = require("stripe")(process.env.STRIPE_SECRET_key);
const userSchema = require("../models/userSchema")
const orderSchema = require("../models/orderSchema")
const mongoose = require("mongoose")


module.exports={
    createUser:async(req,res)=>{
        const {username,email,password}=req.body;

        console.log(req.body,"www");
 
        await Users.create({
          
          
            username:username,
            email:email,
            password:password
        })
        res.status(201).json({
            status:"success",
            message:"user registration is success"
        })
    },
    
    // Login--
    userLogin:async (req,res)=>{
        const {value,error} = joiUserSchema.validate(req.body)
        if(error){
            res.status(400).json({
                status:error,
                message:"somthing wrong"
            })
        }
        const {username,password} = value;
        const user = await Users.findOne({username:username})
        if(!user){
            res.status(400).json({
                status:error,
                message:"not a user"
            })
        }

         const username1 = user.username
         const user1 = user._id

        if(!password || !user.password){
            res.status(400).json({
                status:error,
                messsage:"invalid input"
            })
        }
        const checkpass = await bcrypt.compare(password,user.password)
        if(!checkpass){
            res.status(400).json({
                status:error,
                message:"incorrect password"
            })
        }
        const token = jwt.sign(
            {usernam:user.username},
            process.env.USER_ACCESS_TOKEN_SECRET,
            {expiresIn: 86400}
        )
           res.status(200).json({
            status:"success",
            message:"login success",     
            data:token,
            username:username1,
            userId:user1
           })
     
    },
   
  //product list-------
    
    productList : async (req,res)=>{
        const product = await Product.find();
        if(product.length === 0){
           return res.status(400).json({message:"no product"})
        }
        res.status(201).json({
            status:"success",
            message:"successfully listed",
            data:product
        })
        
    },
    // product by id ---------

    productGetById :  async (req,res)=>{
        const Id = req.params.id
        const productId = await Product.findById(Id)
        if(!productId){
          res.status(404).json({error : "error in fetching"})
        }
        res.status(200).json({
          status : "success",
          message : "product succesfully fetched",
          data : productId
        })
        
      },

      ProductByCategory: async (req, res) => {
        const Category = req.params.categoryname;
        const products = await Product.find({ category: Category });
        if (!products) {
          return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({
          status: "success",
          message: "Successfully fetched category details.",
          data: products,
        });
      },
      
      addToCart: async (req,res)=>{
        const userId = req.params.id;
        const productId = req.body.productId;
        await Users.updateOne({_id:userId},{$push:{cart:productId}});
        console.log(productId);
        res.status(200).json({
          status:'success',
          message : "product succesfully added to cart"
        })
      },

      
    deleteFromCart : async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      console.log(productId,"qqqq");

      await Users.updateOne({_id : userId},{$pull:{cart : productId}})
      res.status(201).json({
        status : "success",
        message :"product removed from the cart",
        
      })
    },
    showCart: async (req, res) => {
      const userId = req.params.id;
      const cart = await Users.findOne({ _id: userId }).populate("cart");
      console.log(cart)
      if (!cart) {
        return res.status(404).json({ error: "Nothing to show on Cart" });
      }
      res.status(200).json({
        status: "success",
        message: "Successfully fetched cart details.",
        data:cart,
      });
    },

    addWishList : async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      console.log(productId);
      await Users.updateOne(
        {_id : userId},
        {$addToSet:{wishList : productId}}
      )

      res.status(201).json({
        status :"success", 
        message : "product added to wish list "
      })
    },

    showWishList : async (req,res)=>{
      const userId = req.params.id;
      const wishList = await Users.find({_id:userId}).populate('wishList');
      

      if(!wishList){res.status(404).json({error : "nothing to show in wish list"})}
      res.status(201).json({
        status : "success",
        message : "products in wish list ",
        data : wishList
      })
    },

    deleteWishList : async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      await Users.updateOne({_id :userId},{$pull:{wishList:productId}})

      res.status(201).json({
        status : "success",
        message : "wish list data deleted"
      })
   },
   payment: async (req, res) => {
    const id = req.params.id;
    uid = id; //for passing as global variable
    const user = await Users.findOne({ _id: id }).populate("cart"); //user with cart
    if (!user) {
      return res.status(404).json({ message: "user not found " });
    }
    const cartItems = user.cart;
    if (cartItems.length === 0) {
      return res.status(200).json({ message: "Your cart is empty" });
    }

    const lineItems = cartItems.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100), 
        },
        quantity: 1,
      };
    });
    session = await Stripe .checkout.sessions.create({
      payment_method_types: ["card"], //steripe session -----
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3001/api/users/payment/success`, //success route
      cancel_url: "http://localhost:3003/api/users/payment/cancel", //cancel route
    });

    if (!session) {
      return res.json({
        status: "Failure",
        message: " Error occured on  Session side",
      });
    }
    sValue = {
      //values to be sent to success function
      id,
      user,
      session,
    };

    res.status(200).json({
      status: "Success",
      message: "Strip payment session created",
      url: session.url,
    });
    


    },

    success : async (req,res)=>{
      const {id,user,session} = sValue ;
      const cartItem = user.cart ; 


      const order = await orderSchema.create({
        userId : id ,
        products : cartItem.map(
          (value)=> new mongoose.Types.ObjectId(value._id)
  
          ) , //we get product in cart
          order_id: session.id,
          payment_id: `demo ${Date.now()}`,
          total_amount: session.amount_total / 100,
      })
      console.log(order,"dh");            

      if(!order){
        res.status(403).json({message : "error include while inputing orderschema"})
      }
      const orderId = order._id;

      const updateUser = await Users.updateOne(
        {_id : id},
        {
          $push:{orders :orderId },
           $set:{cart : []}
          }
        );

        res.status(201).json({
          status :"success",
          message : "paymentsuccesful"})
    },
    cancel: async (req, res) => {
      res.status(200).json({
        status: "Success",
        message: "Payment cancelled.",
      });
    },
     
    showOrders: async (req, res) => {
      
      const id = req.params.id;
      const user = await userSchema.findById(id).populate("orders");
      if (!user) {
        return res 
          .status(404)
          .json({ status: "Failure", message: "User not found." });
      }
      const uOrder = user.orders; 
      
      if (!uOrder || uOrder.length === 0) {
        return res.status(200).json({ message: "you have no orders to show" });
      }
      const orderProductDetails = await orderSchema.find({ _id: { $in: uOrder } })
      .populate("products")
       
      
      res.status(200).json({
        status: "Success.",
        message: "Fetched Order Details",
        orderProductDetails,
      });
    }

}