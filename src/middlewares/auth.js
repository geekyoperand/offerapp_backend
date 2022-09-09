const { getAuth, GoogleAuthProvider, signInWithCredential } = require('firebase/auth');
const { auth } = require('../config/firebase');
const {
  appConfig: { appEnvironment },
} = require('../config/config');
const logger = require('../config/logger');
const { providerTypes, roleTypes } = require('../constants');

const firebaseAuth = getAuth();

const firebaseAuthentication = (requireEmailVerification = false, allowedRoles = [roleTypes.USER]) => {
  return async (req, res, next) => {
    // let accessToken;
    // let authProvider;
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    //   const tokenIdx = 1;
    //   accessToken = req.headers.authorization.split('Bearer ')[tokenIdx];
    // } else {
    //   logger.error('Access token not found');
    //   return res.status(403).json({ error: 'Unauthorized access' });
    // }
    // if (req.headers.provider && Object.values(providerTypes).includes(req.headers.provider)) {
    //   authProvider = req.headers.provider;
    // } else {
    //   return res.status(400).json({ error: 'Invalid auth provider specified' });
    // }
    // try {
    //   let cred;
    //   if (authProvider === providerTypes.GOOGLE) {
    //     const credential = GoogleAuthProvider.credential(accessToken);
    //     cred = await signInWithCredential(firebaseAuth, credential);
    //   } else {
    //     cred = await auth.verifyIdToken(accessToken);
    //   }
    //   const data = await auth.getUser(cred.uid);
    //   req.user = {
    //     ...cred,
    //     provider: authProvider,
    //     ...data.customClaims,
    //     id: data.customClaims.userId,
    //   };
    //   const emailVerified = req.user.emailVerified || req.user.email_verified;
    //   const isAuthenticated = emailVerified || appEnvironment === 'development' || appEnvironment === 'staging';
    //   if (requireEmailVerification && !isAuthenticated) {
    //     logger.error('Access rejected as email is NOT verified');
    //     return res.status(403).json({ error: 'Email verification required' });
    //   }
    //   try {
    //     const { user } = req;
    //     const { role } = user;
    //     if (!allowedRoles.includes(role)) {
    //       logger.error(
    //         `Access rejected as ${user.firstName} with role (${role}) is trying to access ${allowedRoles.join(', ')} routes`
    //       );
    //       return res.status(404).json({ success: false, error: "Don't have rights to access this route" });
    //     }
    req.user = {};
    req.user.id = '62f66751684c2a810b1db897';
    req.user.userId = '62f66751684c2a810b1db897';
    req.user.cartId = '62f66751684c2a810b1db899';
    req.user.placeId = '62a7a5d8c009a51b8a432e8c';
    req.isUser = true;
    req.isManager = false;
    return next();
    //   } catch (error) {
    //     logger.error("Failed to get user's database record : ", error.message);
    //     return res.status(404).json({ error: 'User record not found' });
    //   }
    // } catch (error) {
    //   logger.error('Failed to verify user token : ', error.message);
    //   return res.status(401).json({ error: 'Token verification failed' });
    // }
  };
};

module.exports = firebaseAuthentication;
