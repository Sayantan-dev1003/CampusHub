require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║     🎓 CampusHub Backend Server        ║
  ║     Running on port ${PORT}              ║
  ║     Environment: ${process.env.NODE_ENV}   ║
  ╚════════════════════════════════════════╝
  `);
});
