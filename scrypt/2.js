const getWarehouses = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Используем Prisma для получения складов пользователя
    const warehouses = await req.prisma.warehouses.findMany({
      where: { user_id: userId }, // Фильтрация по user_id
      include: {
        user: {
          select: {
            username: true, // Получаем имя пользователя, создавшего склад
          },
        },
      },
    });

    // Преобразуем данные, чтобы добавить поле `created_by_name`
    const formattedWarehouses = warehouses.map(warehouse => ({
      ...warehouse,
      created_by_name: warehouse.user.username,
    }));

    res.json(formattedWarehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWarehouses,
};
