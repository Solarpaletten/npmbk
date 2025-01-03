const getAccounts = async (req, res) => {
  try {
    const accounts = await req.prisma.chart_of_accounts.findMany({
      orderBy: { code: 'asc' }, // Сортировка по коду
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const account = await req.prisma.chart_of_accounts.findUnique({
      where: { id: Number(id) },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({ error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { code, name, account_type = null, parent_code = null, is_active = true } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        message: "Code and name are required",
        received: { code, name },
      });
    }

    const newAccount = await req.prisma.chart_of_accounts.create({
      data: {
        code,
        name,
        account_type,
        parent_code,
        is_active,
      },
    });

    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const { code, name, account_type, parent_code, is_active } = req.body;

    const updatedAccount = await req.prisma.chart_of_accounts.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        account_type,
        parent_code,
        is_active,
      },
    });

    res.json(updatedAccount);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Account not found" });
    }
    console.error('Error updating account:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const childAccounts = await req.prisma.chart_of_accounts.findMany({
      where: { parent_code: id },
    });

    if (childAccounts.length > 0) {
      return res.status(400).json({
        message: "Cannot delete account with child accounts",
      });
    }

    await req.prisma.chart_of_accounts.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Account not found" });
    }
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
};

const copyAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const sourceAccount = await req.prisma.chart_of_accounts.findUnique({
      where: { id: Number(id) },
    });

    if (!sourceAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    const { id: _, ...accountData } = sourceAccount;

    const copiedAccount = await req.prisma.chart_of_accounts.create({
      data: {
        ...accountData,
        code: `${accountData.code}_copy`,
        name: `${accountData.name} (Copy)`,
      },
    });

    res.status(201).json(copiedAccount);
  } catch (error) {
    console.error('Error copying account:', error);
    res.status(500).json({ error: error.message });
  }
};

const importAccounts = async (req, res) => {
  try {
    const accounts = req.body;

    if (!Array.isArray(accounts)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const createdAccounts = await req.prisma.$transaction(
      accounts.map(account =>
        req.prisma.chart_of_accounts.upsert({
          where: { code: account.code },
          update: {
            name: account.name,
            account_type: account.account_type,
            parent_code: account.parent_code,
            is_active: account.is_active ?? true,
          },
          create: {
            code: account.code,
            name: account.name,
            account_type: account.account_type,
            parent_code: account.parent_code,
            is_active: account.is_active ?? true,
          },
        })
      )
    );

    res.json(createdAccounts);
  } catch (error) {
    console.error('Error importing accounts:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  copyAccount,
  importAccounts,
};
