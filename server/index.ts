import App from './app';
require('dotenv').config();

const port = process.env.SERVER_PORT || 8040;
const address = process.env.SERVER_ADDRESS || '0.0.0.0';

App().then((app) => {
  app.listen(port, address, () => {
    console.log(`Server listening on ${port}`);
  });
});