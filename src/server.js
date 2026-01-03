import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError } from 'graphql';

import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import { buildContext } from './graphql/context.js';

export async function startServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Missing MONGODB_URI');

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production'
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const apollo = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    formatError: (formattedError, error) => {
      const original = error?.originalError;

      if (original?.code === 'UNAUTHENTICATED') {
        return new GraphQLError(formattedError.message, {
          extensions: { ...formattedError.extensions, code: 'UNAUTHENTICATED' }
        });
      }
      if (original?.code === 'FORBIDDEN') {
        return new GraphQLError(formattedError.message, {
          extensions: { ...formattedError.extensions, code: 'FORBIDDEN' }
        });
      }

      if (process.env.NODE_ENV === 'production') {
        if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return new GraphQLError('Internal server error', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
      }

      return formattedError;
    }
  });

  await apollo.start();

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => buildContext({ req })
    })
  );

  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    // no console comments per project rules; runtime log is fine
    console.log(`GraphQL ready at http://localhost:${port}/graphql`);
  });
}
