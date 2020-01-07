const router = require('express').Router();
const OAuthServer = require('express-oauth-server');
const OAuthModel = require('../models/oauth');

// let oauth = new OAuthServer({
//     model: OAuthModel,
//     useErrorHandler: true,
//     debug: true
// });

router.use(require('./oauth'));
router.use(require('./public'));

module.exports = router;