// generate-openapi.js

const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    title: 'My Node Boilerplate API',
    version: '1.0.0',
    description: 'Documentation for My Node Boilerplate API',
  },
  basePath: '/api',
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

fs.writeFileSync('./swagger.yaml', JSON.stringify(swaggerSpec, null, 2));
console.log('OpenAPI specification has been generated.');
