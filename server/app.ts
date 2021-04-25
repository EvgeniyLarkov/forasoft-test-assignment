import fastify from 'fastify';
import sockets from 'fastify-socket.io';
import core from './core';

const App = async () => {
    const app = fastify();

    await app.register(sockets, {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"],
        }
      });

    core(app);
    return app;
};

type Await<T> = T extends PromiseLike<infer U> ? U : T

export type FastifySocketInstance = Await<ReturnType<typeof App>>

export default App;
