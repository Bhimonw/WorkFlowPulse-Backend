const app = require('./src/app');
const environment = require('./src/config/environment');

const PORT = environment.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${environment.NODE_ENV}`);
});