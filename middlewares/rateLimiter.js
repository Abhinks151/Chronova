import rateLimit from 'express-rate-limit';

export const limit = rateLimit({
  windowMs:1*60*1000,
  max:10,
  standardHeaders:true,
  legacyHeaders:false,
  message:{
    success:false,
    message:'Too many request, Please try again later.'
  }
})