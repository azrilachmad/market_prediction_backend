require('dotenv').config({ path: `${process.cwd()}/.env` })

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    "seederStorage": 'sequelize'
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "postgres",
    "seederStorage": 'sequelize',
    // Optional logging
    logging: false,            // Set to true for debug logs; false for no logging

    // Connection options
    dialectOptions: {
      connectTimeout: 60000,    // Connection timeout in milliseconds (60 seconds)
      statement_timeout: 60000, // Timeout for individual queries (60 seconds)
      query_timeout: 60000,
      ssl: {
        require: true,
        rejectUnauthorized: false, // Adjust based on your setup
      },    // Additional query timeout (60 seconds)
    },

    // Pool settings
    pool: {
      max: 10,                 // Maximum number of connections in the pool
      min: 0,                  // Minimum number of connections in the pool
      acquire: 60000,          // Maximum time (ms) Sequelize will wait to acquire a connection
      idle: 10000,             // Maximum time (ms) a connection can remain idle before being released
    },

    // Timezone
    timezone: "UTC",           // Set to your 
  }
}
