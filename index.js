const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { GraphQLObjectType, GraphQLString, GraphQLInterfaceType, GraphQLSchema } = require('graphql');
const { printSchema } = require('graphql/utilities');

// Define the GraphQL interface
const CharacterInterface = new GraphQLInterfaceType({
  name: 'Character',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
  },
  resolveType: (value) => {
    if (value.type === 'Hero') {
      return HeroType;
    }
    if (value.type === 'Villain') {
      return VillainType;
    }
    return null;
  },
});

// Define the Hero type
const HeroType = new GraphQLObjectType({
  name: 'Hero',
  interfaces: [CharacterInterface],
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    superpower: { type: GraphQLString },
  },
});

// Define the Villain type
const VillainType = new GraphQLObjectType({
  name: 'Villain',
  interfaces: [CharacterInterface],
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    evilPlan: { type: GraphQLString },
  },
});

const queryFields = {
  character: {
    type: CharacterInterface,
    args: {
      id: { type: GraphQLString },
    },
    resolve: (parent, args) => {
      // Mock data
      const characters = [
        { id: '1', name: 'Superman', superpower: 'Flight', type: 'Hero' },
        { id: '2', name: 'Lex Luthor', evilPlan: 'World Domination', type: 'Villain' },
      ];
      return characters.find(character => character.id === args.id);
    },
  },
};

// Define the Query type
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: queryFields,
});

const schema = new GraphQLSchema({
  types: [ CharacterInterface, HeroType, VillainType ],
  query: QueryType,
});


const typeDefs = gql(printSchema(schema));
const resolvers = {
  Query: queryFields,
};

const subgraph = buildSubgraphSchema([{ typeDefs, resolvers }]);

// Initialize the Express application
const app = express();

// Create the Apollo server
const server = new ApolloServer({
  schema: subgraph,

});

// Apply the Apollo GraphQL middleware to the Express application
server.start().then(() => {
  server.applyMiddleware({ app });

  // Start the server
  app.listen({ port: 4000 }, () => {
    console.log('Server is running at http://localhost:4000' + server.graphqlPath);
  });
});