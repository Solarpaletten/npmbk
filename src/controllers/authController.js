const bcrypt = require("bcryptjs"); // Библиотека для хэширования паролей
const jwt = require("jsonwebtoken"); // Библиотека для создания и проверки токенов JWT

// Функция входа пользователя
const loginUser = async (req, res) => {
  const { email, password } = req.body; // Извлекаем email и пароль из запроса

  try {
    // Ищем пользователя в базе данных по email
    const user = await req.prisma.users.findUnique({
      where: { email }, // Поиск по уникальному полю email
    });

    if (!user) {
      // Если пользователь не найден, возвращаем ошибку
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Сравниваем введенный пароль с хэшем из базы данных
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      // Если пароль неверный, возвращаем ошибку
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Генерируем JWT токен с id пользователя
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Токен действует 1 час
    });

    // Возвращаем токен и информацию о пользователе
    res.json({
      token,
      username: user.username,
      role: user.role,
      userId: user.id,
    });
  } catch (error) {
    // Обрабатываем ошибки и возвращаем сообщение об ошибке
    res.status(500).json({ error: error.message });
  }
};

// Функция регистрации пользователя
const registerUser = async (req, res) => {
  const { username, email } = req.body; // Извлекаем имя пользователя и email из запроса
  const password = req.body.password || "default1234"; // Если пароль не указан, задаем значение по умолчанию
  const role = req.body.role || "standard"; // Если роль не указана, задаем "standard"
  const hashedPassword = await bcrypt.hash(password, 10); // Хэшируем пароль с солью 10

  try {
    // Создаем нового пользователя
    const newUser = await req.prisma.users.create({
      data: {
        username, // Имя пользователя
        email, // Email
        role, // Роль пользователя
        password_hash: hashedPassword, // Хэш пароля
        // Добавлено: создание записи клиента, связанного с пользователем
        clients: {
          create: {
            name: `${username} Company`, // Название компании по умолчанию
            email, // Email компании
            phone: null, // Телефон компании (по умолчанию null)
            code: null, // Код компании (по умолчанию null)
            vat_code: null, // Налоговый код компании (по умолчанию null)
            is_main: true, // Указываем, что клиент основной
          },
        },
        // Добавлено: создание склада, связанного с пользователем
        warehouses: {
          create: {
            name: "Main Warehouse", // Название склада по умолчанию
          },
        },
      },
      include: {
        clients: true, // Включаем данные о клиентах в ответ
        warehouses: true, // Включаем данные о складах в ответ
      },
    });

    // Возвращаем данные о созданном пользователе, клиенте и складе
    res.status(201).json(newUser);
  } catch (error) {
    // Обрабатываем ошибки и возвращаем сообщение об ошибке
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser, registerUser };
