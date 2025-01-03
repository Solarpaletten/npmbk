// bankOperationsController.js

const getBankOperations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const operations = await req.prisma.bank_operations.findMany({
      where: {
        user_id: userId
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    // Преобразуем данные в тот же формат
    const formattedOperations = operations.map(op => ({
      ...op,
      created_by_name: op.user.username
    }));

    res.json(formattedOperations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBankOperation = async (req, res) => {
  const { id } = req.params;
  try {
    const operation = await req.prisma.bank_operations.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!operation) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBankOperation = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { 
      date, 
      type, // D or K
      amount,
      client,
      description = null,
      account = "271",
      corresponding_account
    } = req.body;

    if (!date || !type || !amount || !client || !corresponding_account) {
      return res.status(400).json({
        message: "Date, type, amount, client and corresponding account are required",
        received: { date, type, amount, client, corresponding_account },
      });
    }

    const newOperation = await req.prisma.bank_operations.create({
      data: {
        date: new Date(date),
        type,
        amount: Number(amount),
        client,
        description,
        account,
        corresponding_account,
        user_id: userId
      }
    });

    res.status(201).json(newOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBankOperation = async (req, res) => {
  const { id } = req.params;
  const { 
    date, 
    type,
    amount,
    client,
    description,
    account,
    corresponding_account 
  } = req.body;

  try {
    const updatedOperation = await req.prisma.bank_operations.update({
      where: {
        id: Number(id)
      },
      data: {
        date: new Date(date),
        type,
        amount: Number(amount),
        client,
        description,
        account,
        corresponding_account
      }
    });
    
    if (!updatedOperation) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json(updatedOperation);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteBankOperation = async (req, res) => {
  const { id } = req.params;
  try {
    await req.prisma.bank_operations.delete({
      where: {
        id: Number(id)
      }
    });
    res.json({ message: "Operation deleted" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

const copyBankOperation = async (req, res) => {
  const { id } = req.params;
  try {
    const sourceOperation = await req.prisma.bank_operations.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!sourceOperation) {
      return res.status(404).json({ message: "Operation not found" });
    }

    // Создаем копию, исключая id
    const { id: _, created_at, updated_at, ...operationData } = sourceOperation;

    const newOperation = await req.prisma.bank_operations.create({
      data: {
        ...operationData,
        description: `${operationData.description || ''} (Copy)`,
      }
    });

    res.status(201).json(newOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBankOperations,
  getBankOperation,
  createBankOperation,
  updateBankOperation,
  deleteBankOperation,
  copyBankOperation,
};