const app = require('./app');

const PORT = 8008;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
