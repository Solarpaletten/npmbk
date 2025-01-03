const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Проверяем роль текущего пользователя
    const user = await req.prisma.users.findUnique({ where: { id: userId } });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Получаем параметры запроса
    const { search = "", sort = "username", order = "asc" } = req.query;

    // Формируем фильтр поиска
    const users = await req.prisma.users.findMany({
      where: {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { role: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: {
        [sort]: order === "desc" ? "desc" : "asc",
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Получаем пользователя
    const user = await req.prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Получаем клиента, связанного с пользователем
    const client = await req.prisma.clients.findFirst({
      where: { created_by: Number(user.id) },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ ...user, ...client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { username, email } = req.body;
  const password = req.body.password || "default1234";
  const role = req.body.role || "standard";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await req.prisma.users.create({
      data: {
        username,
        email,
        role,
        password_hash: hashedPassword,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const updatedUser = await req.prisma.users.update({
      where: { id: Number(id) },
      data: { username, email, role },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await req.prisma.users.delete({ where: { id: Number(id) } });

    res.json({ message: "User deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
