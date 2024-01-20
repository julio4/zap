import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Zap Source',
    description: 'Zap Source API',
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.ts'];

swaggerAutogen()(outputFile, routes, doc);
