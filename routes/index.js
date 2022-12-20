const express = require('express');
var routesVersioning = require('../configs/app-version-setting')();
const router = express.Router();

const { APP_ENDPOINT } = require('../configs');

const v1Router = require('./v1');
router.use('/', v1Router);

router.get('/public-privacy-policy', (req, res) => {
  res.send({
    message: 'Public Privacy Policy is still in proccess and will be posted soon... Thanks for your patience'
  });
})
router.get('/terms-of-service', (req, res) => {
  res.send({
    message: 'Terms of Service is still in proccess and will be posted soon... Thanks for your patience'
  });
})

router.get('/healthz', (req, res) => {
  res.send('Backend Health check')
})
router.get('/app/endpoint', routesVersioning({
  "1.0.32": respondDev,
  "1.0.31": respondProd,
  "1.0.30": respondProd,
  "1.0.29": respondProd,
  "1.0.28": respondProd,
  "1.0.27": respondProd,
  "1.0.26": respondProd,
  "1.0.25": respondProd,
  "1.0.24": respondProd,
  "1.0.23": respondProd,
  "1.0.22": respondProd,
  "1.0.21": respondProd,
  "1.0.20": respondProd,
  "1.0.19": respondProd,
  "1.0.18": respondProd,
  "1.0.17": respondProd,
  "1.0.16": respondProd,
  "1.0.15": respondProd,
  "1.0.14": respondProd,
  "1.0.13": respondProd,
  "1.0.12": respondProd,
  "1.0.11": respondProd,
  "1.0.10": respondProd,
  "1.0.9": respondProd,
  "1.0.8": respondProd,
  "1.0.7": respondProd,
  "1.0.6": respondProd,
  "1.0.5": respondProd,
  "1.0.4": respondProd,
  "1.0.3": respondProd,
  "1.0.2": respondProd,
  "1.0.1": respondProd,
  "1.0.0": respondProd,
}, NoMatchFoundCallback));


function NoMatchFoundCallback(req, res, next) {
  res.send({
    code: 404,
    endpoint: 'version not found',
    endpoint_app_ios: APP_ENDPOINT.IOS,
    endpoint_app_android: APP_ENDPOINT.ANDROID,
  });
}

function respondProd(req, res, next) {
  res.send({
    code: 100,
    // endpoint: "https://api.store.backend.fdc/"
    endpoint: "https://api-pro.bmart.sg/"
  });
}

function respondDev(req, res, next) {
  res.send({
    code: 100,
    // endpoint: "https://staging-api.store.backend.fdc"
    endpoint: "https://api-staging.bmart.sg",
  });
}

// ============

module.exports = router;
