import Sequelize from 'sequelize';

const CURRENT_LAMBDA_FUNCTION_TIMEOUT= 3000;
export const sequelize = new Sequelize('d851o8v6clfdma', 'u2gv12cp6hijc6', 'p04370ef449f2dbf91748f8d9324f4ac899376a8fcc8f9a3ad5b943c672a511c3', {
  host: 'cd34mo1pb3u614.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    /*
     * Lambda functions process one request at a time but your code may issue multiple queries
     * concurrently. Be wary that `sequelize` has methods that issue 2 queries concurrently
     * (e.g. `Model.findAndCountAll()`). Using a value higher than 1 allows concurrent queries to
     * be executed in parallel rather than serialized. Careful with executing too many queries in
     * parallel per Lambda function execution since that can bring down your database with an
     * excessive number of connections.
     *
     * Ideally you want to choose a `max` number where this holds true:
     * max * EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS < MAX_ALLOWED_DATABASE_CONNECTIONS * 0.8
     */
    max: 10,
    /*
     * Set this value to 0 so connection pool eviction logic eventually cleans up all connections
     * in the event of a Lambda function timeout.
     */
    min: 0,
    /*
     * Set this value to 0 so connections are eligible for cleanup immediately after they're
     * returned to the pool.
     */
    idle: 0,
    // Choose a small enough value that fails fast if a connection takes too long to be established.
    acquire: 3000,
    /*
     * Ensures the connection pool attempts to be cleaned up automatically on the next Lambda
     * function invocation, if the previous invocation timed out.
     */
    evict: CURRENT_LAMBDA_FUNCTION_TIMEOUT
  }
});
export const loadSequelize = async () => {
  // or `sequelize.sync()`
  await sequelize.sync({force:false});

  return sequelize;
};


// module.exports.sequelize = sequelize;
// module.exports.loadSequelize = loadSequelize;
// // exports = {
// //   sequelize: sequelize,
// //   loadSequelize: loadSequelize
// // }