import App from './app';

const port = process.env.PORT || 8040;
const address = '0.0.0.0';

App().then((app) => {
  app.listen(port, address, () => {
    console.log(`Server listening on ${port}`);
  });
});