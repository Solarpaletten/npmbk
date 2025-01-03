// clientsController.js

const getClients = async (req, res) => {
  const userId = req.user.userId;

  try {
    const clients = await req.prisma.clients.findMany({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Преобразуем данные для добавления поля `created_by_name`
    const formattedClients = clients.map(client => ({
      ...client,
      created_by_name: client.user.username,
    }));

    res.json(formattedClients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClient = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await req.prisma.clients.findUnique({
      where: { id: Number(id) },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createClient = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { name, email, phone, code = null, vat_code = null } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email, and phone are required",
        received: { name, email, phone },
      });
    }

    const newClient = await req.prisma.clients.create({
      data: {
        name,
        email,
        phone,
        code,
        vat_code,
        user_id: userId,
      },
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, code, vat_code } = req.body;

  try {
    const updatedClient = await req.prisma.clients.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        code,
        vat_code,
      },
    });

    res.json(updatedClient);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    await req.prisma.clients.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Client deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

const copyClient = async (req, res) => {
  const { id } = req.params;

  try {
    const sourceClient = await req.prisma.clients.findUnique({
      where: { id: Number(id) },
    });

    if (!sourceClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    const { id: _, ...clientData } = sourceClient; // Исключаем id из данных

    const newClient = await req.prisma.clients.create({
      data: {
        ...clientData,
        name: `${clientData.name} (Copy)`,
      },
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  copyClient,
};
