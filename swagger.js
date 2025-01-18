const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API Documentation cho dự án Backend ExpressJS',
  },
  servers: [
    {
      url: 'http://170.205.36.201:5005',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
      },
    },
  },
  
};

const options = {
  swaggerDefinition,
  apis: ['./routers/*.js'], // Đường dẫn tới các file định nghĩa API
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
