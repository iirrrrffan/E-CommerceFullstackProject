
const user = require("../models/userSchema")
const jwt = require("jsonwebtoken")
const Product = require("../models/productSchema")
// ------------------ 
const orderSchema = require("../models/orderSchema")
const mongoose  = require("mongoose")
const {joiProductSchema} = require("../models/validationSchema")



module.exports = {
    login:async (req,res)=>{ 
        const {username,password} = req.body;
        if(
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
            
            ){
                const token = jwt.sign(
                    {username:user.username},
                    process.env.ADMIN_ACCESS_TOKEN_SECRET,
                    
                )
                res.status(200).json({
                    status:"success",
                    message:"token provided",
                    data: {jwt_token:token}
                })
            }else{
                return res.status(400).json({
                    status:"error",
                    message:"not an admin"
                })
            }
        },
        // get users--

        getAllUsres: async (req,res)=>{
            const allUsers = await user.find();
            res.status(200).json({
                status:"success",
                message:"successfully fetched users",
                data: allUsers
            })
        },

        getUsersbyId: async(req,res)=>{
            const userId = req.params.id
           const  usersbyId = await user.findById(userId)
           if(!usersbyId){
            res.status(400).json({   
                status:"error",
                message:"not an user"
            })
           }
           res.status(200).json({
            status:"success",
            message:"successfully fetched user By ID",
            data:usersbyId
           })
        },
        
        // create product----
        createProduct : async (req,res)=>{
            const {title,description,price,image,category} = req.body ;
          
            const data = await Product.create ({
                title ,
                description,
                price,
                image,
                category,
             });
           

           
             res.status(201).json({
                status : "success",
                message : "product successfully created",
                data:data
             })
          },

          //take all product----
          getAllProduct : async(req, res)=>{
            const getAllProduct = await  Product.find();
            res.status(201).json({
              status : "success",
              message: "succesfully fetch product",   
              data : getAllProduct
            })
          },

          getProductsByCatogory: async (req, res) => {
            const productCategory=req.params.categoryname   
            try {  
                   const Products = await Product.find({category:productCategory});      
                  if (!Products.length) {
                    return res.status(404).json({   
                      status: 'error',
                      message: 'No products found in the specified category',
                    });
                }
                res.status(200).json({
                    status: 'success',
                    message: 'Product Category Fetched ✅',
                    data: Products,
                });
            } catch (error) {
                console.error('Error fetching products by category:', error);
                res.status(500).json({
                  status: 'error',
                  message: 'Internal Server Error',
                })
            }
            },

      getProductById: async (req, res) => {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
          status: "success",
          message: "Successfully fetched product details.",
          data: product,
        });
      },
      
      updateProduct: async (req, res) => {
        const { title, description, image, price, category, id } = req.body;
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        await Product.updateOne(
          { _id: id },
          {
            $set: {
              title: title,
              description: description,
              price: price,
              image: image,
              category: category,
            },
          }
        );
        res.status(201).json({
          status: "success",
          message: "Successfully updated the product.",
        });
      },

      deleteProduct : async (req,res)=>{
        const {id} = req.body;
        await Product.findByIdAndDelete(id);
        res.status(201).json({
          status:"success",
          message : "product succesfully deleted"
        })        
      },
      orderDetails : async (req,res)=>{
        const order = await orderSchema.find();
        console.log(order);
        if(order.length === 0){
          res.status(404).json({message :'no orders yet' })
        }

        res.status(201).json({status : "success",message : "oreder successfully fetched",data : order})
      },

      stats : async (req,res) => {
        const order = await orderSchema.find();

        const data = await orderSchema.aggregate([
          {
            $group:{
              _id : null ,
              totalProductPurchaced :{$sum:{$size:"$products"}},
              revenu: {$sum:"$total_amount"},
            },
          },
          {$project:{_id : 0}}
        ])

        res.json({data})


      }
       
};