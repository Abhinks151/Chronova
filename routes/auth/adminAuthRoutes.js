import {Router} from 'express'
import {adminLogout, getAdminLogin , postAdminLogin} from '../../controllers/auth/adminAuthController.js'
import validate from '../../utils/validationRules.js';
import { getDashboard } from '../../controllers/dashboardController.js';
import { authenticateAdmin } from '../../middlewares/adminAuthMiddleware.js';


const adminAuthRouter = Router();

adminAuthRouter.get('/login', getAdminLogin);
adminAuthRouter.post('/login',validate(['email', 'password']), postAdminLogin);
adminAuthRouter.get('/logout',authenticateAdmin,adminLogout);

adminAuthRouter.get('/dashboards',authenticateAdmin,getDashboard);



export default adminAuthRouter;


