const router = require('express').Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const OAuthModel = require('../models/oauth');

router.get('/', (req, res, next) => {
    res.render('index', {
        title: '同豪验证服务器'
    });
});

router.get('/register-user', (req, res, next) => {
    res.render('register-user', { message: req.flash('message'), title: '同豪验证服务器' });
});

router.get('/register-client', (req, res, next) => {
    res.render('register-client', { message: req.flash('message'), title: '同豪验证服务器' });
});

router.post('/register-user', async (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword) {
        return res.send('Passwords does not match', 422);
    }

    let UserModel = mongoose.model('User');

    // Create User
    let _user = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        verificationCode: crypto.randomBytes(16).toString('hex'),
    });
    _user.setPassword(req.body.password);
    let user = null;
    try {
        user = await _user.save();
    } catch (error) {
        return res.send(error.errmsg, 422);
    }

    if (!user) {
        return res.send('Error creating user', 422);
    }

    req.flash('message', 'User Registration successful!');

    return res.redirect('/register-user');
});

router.post('/register-client', async (req, res, next) => {
    let OAuthClientModel = mongoose.model('OAuthClient');

    // Create OAuth Client
    let _client = await OAuthModel.getClient(
        req.body.clientId,
        req.body.clientSecret
    );

    if (!_client) {
        _client = new OAuthClientModel({
            clientId: req.body.clientId,
            clientSecret: req.body.clientSecret,
            redirectUris: req.body.redirectUris.split(','),
            grants: ['authorization_code', 'client_credentials',
                'refresh_token', 'password']
        });
        _client.save();
    }

    req.flash('message', 'Client Registration successful!');

    return res.redirect('/register-client');
});

module.exports = router;
