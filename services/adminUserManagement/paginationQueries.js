import { User } from '../../models/userModels.js';


export const getPaginatedUsers = async ({
  page = 1,
  limit = 5,
  statusFilter = 'all',
  sort,
  search = '',
}) => {
  const filter = {};

  // Status filter
  if (statusFilter === 'active') filter.isBlocked = false;
  else if (statusFilter === 'blocked') filter.isBlocked = true;

  // Search filter (case-insensitive match for firstname, lastname, or email)
  if (search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { firstname: { $regex: regex } },
      { lastname: { $regex: regex } },
      { email: { $regex: regex } },
    ];
  }

  // Sorting option
  let sortOption = {};
  if (sort === 'az') sortOption = { firstname: 1 };
  else if (sort === 'za') sortOption = { firstname: -1 };
  else sortOption = { createdAt: -1 };

  const totalUsers = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    totalUsers,
    totalPages,
    currentPage: page,
    limit,
    statusFilter,
    sort,
  };
};



