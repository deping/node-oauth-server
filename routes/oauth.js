const router = require('express').Router();
const OAuthServer = require('express-oauth-server');
const OAuthModel = require('../models/oauth');
const mongoose = require('mongoose');

oauth = new OAuthServer({
    model: OAuthModel,
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 1 * 60 * 60,
    // debug: true
});

router.post('/oauth/access_token', oauth.token({
    requireClientAuthentication: {
        authorization_code: false,
        refresh_token: false
    }
}));

router.get('/oauth/authenticate', async (req, res, next) => {
    return res.render('authenticate')
});

router.post('/oauth/authenticate', async (req, res, next) => {

    let UserModel = mongoose.model('User');
    req.body.user = await UserModel.findOne({ username: req.body.username });
    if (req.body.user && req.body.user.validatePassword(req.body.password)) {
        return next();
    }
    next(new Error('User or Password is wrong.'));
}, oauth.authorize({
    authenticateHandler: {
        handle: req => {
            return req.body.user;
        }
    }
}));

router.use('/account', oauth.authenticate(), (req, res) => {
    return res.json(res.locals.oauth.token.user);
});

router.use('/secured/profile', oauth.authenticate(), (req, res) => {
    return res.render('secured', { token: JSON.stringify(res.locals) });
});

module.exports = router;