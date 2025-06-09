import HttpStatusCode from "../../utils/httpStatusCode.js";
import { getPaginatedUsers } from '../../servises/adminUserManagement/paginationQuires.js';
import { User } from "../../models/userModels.js";



export const getAdminUserManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const statusFilter = req.query.status || 'all';
    const sort = req.query.sort;

    const data = await getPaginatedUsers({ page, limit, statusFilter, sort });

    res.render('Layouts/adminDashboard/userManagement', {
      title: 'User Management',
      ...data,
    });
  } catch (err) {
    console.error('Admin User Management Error:', err);
    res.status(500).render('error', { message: 'Something went wrong', error: err });
  }
};

export const getAdminUsersPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const statusFilter = req.query.status || 'all';
    const sort = req.query.sort;
    const search = req.query.search || '';

    const data = await getPaginatedUsers({ page, limit, statusFilter, sort, search });

    res.status(HttpStatusCode.OK.code).json({
      users: data.users,
      totalUsers: data.totalUsers,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      limit: data.limit,
    });
  } catch (err) {
    console.error('Admin Users API Error:', err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Failed to fetch users',
      error: err.message,
    });
  }
};



export const togleBlock = async (req, res) => {
  try {
    console.log(req.params.id);;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND.code).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(HttpStatusCode.OK.code).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    });


  } catch (error) {
    console.error('Toggle block error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR.code).json({ success: false, message: 'Internal server error' });
  }
}