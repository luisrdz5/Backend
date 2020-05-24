/**Network to manage endpoints about Addresses of an user
 * @module routes/auth/network
 */
const express = require('express');
const router = express.Router();
const response = require('../../../network/response');
const authController = require('./index')
const boom = require('@hapi/boom');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../config/index')
const ControllerUser = require('../users/index');


/**Validations */
const validationHandler = require('../../utils/middleware/validationHandler');
const { createUserSchema } = require('../../utils/schemas/users');



/**Basic Strategy */
require('../../utils/auth/strategies/basic');

//Router
router.get('/', (req, res) => {
    res.send(`API auth v 0.01`);
  });


  /**
 * API Endpoint to update an User information.
 * @method PUT 
 * @param {Object} req - The User information to be updated
 * @returns {Object} res - result of User update
 * @example
 *      body = {
 *          "email": "email@host.com"
 * 	        "password": "1234"     
 *      }
 */
router.post('/sign-in', async function (req, res, next) {
    const {apiKeyToken} = req.body;
    if (!apiKeyToken) {
        next(boom.unauthorized('apiKeyToken is required'));
    }
    passport.authenticate('basic', function(error, user) {
        try {
          if (error || !user) {
            response.error(req, res, error.message, 401, 'Unauthorized');
            return false;
          }
          req.login(user, { session: false }, async function(error) {
            
            if (error) {
              next(error);
            }
            const apiKey = await authController.getAuth(apiKeyToken);
            let scopes = [];
            apiKey.forEach((item) => {
              scopes.push(item.access);
            })
            if (!apiKey) {
              response.error(req, res, error.message, 401, 'Unauthorized');
              return false;
            } 
            const { id_users, login, email} = user;
            const payload = {
              sub: id_users,
              login,
              email,
              scopes
            };
            const token = jwt.sign(payload, config.authJwtSecret, {
              expiresIn: '15m'
            });
            response.success(req, res, { token, user: { id_users, login, email } }, 200);
          });
        } catch (error) {
          next(error);
        }
      })(req, res, next);
});



/**
 * API Endpoint to update an User information.
 * @method PUT 
 * @param {Object} req - The User information to be updated
 * @returns {Object} res - result of User update
 * @example
 *      body = {
 *          "email": "email@host.com"
 * 	        "password": "1234"     
 *      }
 */

router.post('/sign-up', 
            validationHandler(createUserSchema), 
            async function(req,res, next) {
          const { ...user } = req.body;
          
          try {
            try {

              const createdUserId = await ControllerUser.insertUser({ email: user.email, password: user.password });
              response.success(req, res, createdUserId, 201);
            } catch( err){
                response.error(req, res, err.message, 500, 'error network user Insert');
            }

/*
            const payload = {
              sub: createdUserId,
              name: user.name,
              email: user.email,
              scopes: apiKey.scopes
            };
            const userName= user.name;
            const userEmail= user.email;
            const token = jwt.sign(payload, config.authJwtSecret, {
              expiresIn: '15m'
            });
            return res.status(201).json({ token, user: { id: createdUserId, userName, userEmail } });
          */
          }catch(error){
            next(error);
          }

});



module.exports = router;