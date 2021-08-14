const { createServer } = require('http');
const app = require('./server');
const { logger } = require('./src/utils/logger');
const { PORT } = require('./src/core/config');

const server = createServer(app);
server.listen(PORT, () => logger.info(`Server Started on port ${PORT}`));
