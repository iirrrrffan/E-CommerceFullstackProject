const jwt = require("jsonwebtoken")

// Verify Tocken-----------
  
module.exports = function verifyTocken(req,res,next) {
        const token = req.headers["authorization"].split(" ")[1];
        if (!token) {
                
                return res.status(403).json({ error: "No token provided" }); 
                
              }
              jwt.verify(token,process.env.USER_ACCESS_TOKEN_SECRET,(err,decoded)=>{
                if(err){
                  return res.status(401).json({error:"unauthiorized"})
                }
                req.username = decoded.username;
                next();
              })
}