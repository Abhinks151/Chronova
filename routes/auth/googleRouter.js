import express from 'express';
import { googleAuth, googleCallback } from "../../controllers/auth/googleAuth.js";

const googleAuthRouter = express.Router();



googleAuthRouter.get('/auth/google',googleAuth)
googleAuthRouter.get('/auth/google/callback', googleCallback);


export default googleAuthRouter