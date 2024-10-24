const cors = require('cors');
app.use(cors({
  origin: ['https://my-react-app.onrender.com', 'http://localhost:3001'],
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));
