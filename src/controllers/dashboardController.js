const getDashboard = async (req, res) => {
  try {
    // Используем Prisma для выполнения подсчетов
    const totalUsers = await req.prisma.users.count();
    const adminUsers = await req.prisma.users.count({
      where: { role: "admin" },
    });
    const standardUsers = await req.prisma.users.count({
      where: { role: "standard" },
    });

    res.json({
      total_users: totalUsers,
      admin_users: adminUsers,
      standard_users: standardUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
};
