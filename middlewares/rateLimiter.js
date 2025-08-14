import rateLimit from 'express-rate-limit';

// export const limit = rateLimit({
//   windowMs:1*60*1000,
//   max:100,
//   standardHeaders:true,
//   legacyHeaders:false,
//   message:{
//     success:false,
//     message:'Too many request, Please try again later.'
//   }
// })


export const limit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    if (req.accepts('html')) {
      return res.status(options.statusCode).render('Layouts/rate-limit', {
        title: '429-Too Many Requests',
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    } else {
      res.status(options.statusCode).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    }
  }
});