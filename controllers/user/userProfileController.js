


export const updateUserData = async (req, res) => {
  const user = req.body;
  console.log(req.user)
  console.log(user);
  return res.status(200).json(user);
}