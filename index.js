const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const mqtt = require('mqtt');

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books },
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  const client  = mqtt.connect('mqtt://localhost:1884');
  client.on('connect', function () {
    client.publish('743ae58f-fd34-48a5-a3ce-a845687c6f6d', JSON.stringify({"czesc": "czesc"}), {qos: 2});
    client.subscribe('743ae58f-fd34-48a5-a3ce-a845687c6f6d',{qos: 2}, function (err) {
      if (err) {
        console.log(err);
      }
      client.publish('743ae58f-fd34-48a5-a3ce-a845687c6f6d', JSON.stringify({"czesc": "czesc"}), {qos: 2});
    });
  });
  client.on('message', function (topic, message) {
    console.log(topic, message.toString());
  });
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});
