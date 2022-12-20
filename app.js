const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const expressUpload = require('express-fileupload');
const swaggerDocs = require(`./storage/${process.env.SWAGGER_FILE || 'swagger.json'}`);
const { notFoundHandler, errorHandler } = require('./middlewares/error');

const createQxpressPickupCronJob = require('./crons/create_qxpress_pickup');
const broadcastSpinwheelResetNotification = require('./crons/spinwheel_reminder');
const jtexpressReLoginCronJob = require('./crons/jtexpress_relogin');

global.BaseResponse = require('./utils/response');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev', {
  skip: (req, res) => {
    return req.originalUrl === '/healthz';
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(expressUpload({
  useTempFiles: true,
  tempFileDir: path.resolve('storage/tmp/files')
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// createQxpressPickupCronJob.start();
broadcastSpinwheelResetNotification.start();
jtexpressReLoginCronJob.start();

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
