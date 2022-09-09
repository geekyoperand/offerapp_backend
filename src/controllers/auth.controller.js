/* eslint-disable no-console */
const httpStatus = require('http-status');
const otpGenerator = require('otp-generator');
const {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
} = require('firebase/auth');
const jwtDecode = require('jwt-decode');
const catchAsync = require('../utils/catchAsync');
const redisClient = require('../config/redis');
const { auth } = require('../config/firebase');
const logger = require('../config/logger');
const { registeration } = require('../templates/sms');
const {
  authService,
  cartService,
  userService,
  tokenService,
  deviceService,
  // emailService,
  // configurationService,
  refferalhistoryService,
  // pointhistoryService,
  registerUserTrackingService,
  otpService,
} = require('../services');
const { otpDBService } = require('../db');
const {
  // pointEarningTypes,
  otpTypes,
  providerTypes,
  roleTypes,
} = require('../constants');
const { User } = require('../models');
const { error, success } = require('../utils/responseApi');

const firebaseAuth = getAuth();

const sendOtp = catchAsync(async (req, res) => {
  let { email, name } = req.body;
  const { dateOfBirth } = req.body;
  const { phoneNumber, googleIdToken, provider, referCode, location, gender, type } = req.body;
  if (provider === providerTypes.GOOGLE) {
    const user = jwtDecode(googleIdToken);
    email = user.email;
    name = user.name;
  }
  const phoneExist = await User.countDocuments({ phoneNumber });
  if (phoneExist) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH001', {}, httpStatus.BAD_REQUEST));
  }
  const emailExist = await User.countDocuments({ email });
  if (emailExist) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH002', {}, httpStatus.BAD_REQUEST));
  }
  const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
  let phoneMessage;
  if (type === otpTypes.REGISTER) {
    phoneMessage = registeration(otp);
  }
  await otpService.send({
    Message: phoneMessage,
    PhoneNumber: `+91${phoneNumber}`,
  });
  await redisClient.setEx(`${otpTypes.REGISTER}-${phoneNumber}`, 660, otp);
  await otpDBService.updateOTP(
    {
      phoneNumber,
    },
    {
      otp,
      expiryTime: otpService.calculateExpiryTime(),
      type: otpTypes.REGISTER,
      phoneNumber,
      provider,
    },
    { upsert: true }
  );
  await registerUserTrackingService.createRegisterUserTracking({
    name,
    email,
    provider,
    phoneNumber,
    referCode,
    location,
    gender,
    dateOfBirth,
  });
  return res.status(httpStatus.OK).send(success('AUTH003', {}, httpStatus.OK));
});

const register = catchAsync(async (req, res) => {
  const { phoneNumber, email, password, otp, dateOfBirth } = req.body;
  const verified = await otpService.verifyOTP(phoneNumber, otp, otpTypes.REGISTER, providerTypes.EMAIL_PASSWORD);
  if (!verified) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH004', {}, httpStatus.BAD_REQUEST));
  }

  const users = await userService.findUsers(
    {
      $or: [
        {
          email,
        },
        {
          phoneNumber,
        },
      ],
    },
    'email phoneNumber'
  );
  if (users.length) {
    if (users.length === 2) {
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH005', {}, httpStatus.BAD_REQUEST));
    }
    const user = users[0];
    if (user.email === email) {
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH002', {}, httpStatus.BAD_REQUEST));
    }
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH001', {}, httpStatus.BAD_REQUEST));
  }

  let user;
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const { uid } = userCredential.user;
    let cart = {};
    try {
      const userData = {
        phoneNumber,
        email,
        uid,
        provider: providerTypes.EMAIL_PASSWORD,
        password,
        dateOfBirth,
      };
      logger.info('New user registered : ', email);
      user = await userService.createUser(userData);
      cart = await cartService.createCart({ userId: user.id, createdBy: user.id });
      await userService.updateUserById(user.id, { cartId: cart.id });
    } catch (err) {
      logger.error(err);
      await userCredential.delete();
      logger.warn('-- User Deleted --');
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH006', {}, httpStatus.BAD_REQUEST));
    }
    await auth.setCustomUserClaims(uid, {
      userId: user._id,
      cartId: cart.id,
      role: roleTypes.USER,
      requireAccountDetails: true,
    });
    const additionalClaims = {
      userId: user._id,
      role: roleTypes.USER,
      requireAccountDetails: true,
    };
    const token = await auth.createCustomToken(uid, additionalClaims);
    res.status(httpStatus.CREATED).send(success('AUTH014', { user, token }, httpStatus.CREATED));
    await otpService.makeOtpInvalid(phoneNumber, otpTypes.REGISTER, providerTypes.EMAIL_PASSWORD);
  } catch (err) {
    let message = '';
    if (err.code === 'auth/email-already-in-use') {
      message = 'AUTH002';
    } else if (err.code === 'auth/weak-password') {
      message = 'AUTH007';
    } else {
      message = `${err.message}`;
    }
    return res.status(httpStatus.BAD_REQUEST).send(error(message, {}, httpStatus.BAD_REQUEST));
  }

  // try {
  //   let referBy = null;
  //   let points = 0;
  //   if (referCode) {
  //     referBy = await userService.getUser({ referCode });
  //     if (!referBy) {
  //       return res.status(httpStatus.BAD_REQUEST).send();
  //     }
  //     const refferedUserPoints = await configurationService.getConfiguration({ code: 'REFERRED_USER_POINTS' });
  //     points = refferedUserPoints;
  //   }

  //   if (referCode) {
  //     const refferalPoints = await configurationService.getConfiguration({ code: 'REFERRING_USER_POINTS' });
  //     let totalPoints = referBy.points;
  //     if (refferalPoints && refferalPoints.value) {
  //       totalPoints += refferalPoints.value;
  //     }
  //     await userService.updateUserById(referBy._id, {
  //       points: totalPoints,
  //     });
  //     await refferalhistoryService.createRefferalHistory({
  //       from: referBy._id,
  //       to: user._id,
  //       refferalCode: referCode,
  //     });
  //     await pointhistoryService.createPointHistories([
  //       {
  //         userId: referBy._id,
  //         type: pointEarningTypes.REFFERAL,
  //         points: refferalPoints.value,
  //       },
  //       {
  //         userId: user._id,
  //         type: pointEarningTypes.REFFERED,
  //         points,
  //       },
  //     ]);
  //   }
});

const continueWithGoogle = catchAsync(async (req, res) => {
  const { phoneNumber, referCode, otp, emailUpdates, location, gender, googleIdToken, dateOfBirth } = req.body;
  const verified = await otpService.verifyOTP(phoneNumber, otp, otpTypes.REGISTER, providerTypes.GOOGLE);
  if (!verified) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH004', {}, httpStatus.BAD_REQUEST));
  }

  const credential = await GoogleAuthProvider.credential(googleIdToken);
  const cred = await signInWithCredential(firebaseAuth, credential);
  const { email } = cred.user;
  const users = await userService.findUsers(
    {
      $or: [
        {
          email,
        },
        {
          phoneNumber,
        },
      ],
    },
    'email phoneNumber'
  );
  if (users.length) {
    if (users.length === 2) {
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH005', {}, httpStatus.BAD_REQUEST));
    }
    const user = users[0];
    if (user.email === email) {
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH002', {}, httpStatus.BAD_REQUEST));
    }
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH001', {}, httpStatus.BAD_REQUEST));
  }
  let user;
  try {
    try {
      const name = cred.user.displayName;
      const splittedName = name.split(' ');
      let referBy = null;
      if (referCode) {
        referBy = await userService.getUser({ referCode }, 'id');
        if (!referBy) {
          return res.status(httpStatus.BAD_REQUEST).send(error('AUTH019', {}, httpStatus.BAD_REQUEST));
        }
      }

      const userData = {
        firstName: splittedName.length > 0 ? splittedName[0] : '',
        lastName: splittedName.length > 1 ? splittedName[1] : '',
        phoneNumber,
        email: cred.user.email,
        uid: cred.user.uid,
        provider: providerTypes.GOOGLE,
        referBy,
        isEmailVerified: cred.user.emailVerified,
        emailUpdates,
        avatarUrl: cred.user.photoURL,
        requireAccountDetails: false,
        location, // || defaultLocationData,
        gender,
        dateOfBirth,
      };
      logger.info('New user registered : ', email);
      user = await userService.createUser(userData);
      const cart = await cartService.createCart({ userId: user.id, createdBy: user.id });
      await userService.updateUserById(user.id, { cartId: cart.id });
      if (referCode) {
        await refferalhistoryService.createRefferalHistory({
          from: referBy.id,
          to: user.id,
          text: `{{#name}} joined dayout using your refferal code`,
          refferalCode: referCode,
          createdBy: user.id,
        });
      }
      await auth.setCustomUserClaims(cred.user.uid, {
        cartId: cart.id,
        userId: user._id,
        role: roleTypes.USER,
      });
    } catch (err) {
      logger.error(err);
      await cred.user.delete();
      logger.warn('-- User Deleted --');
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH006', {}, httpStatus.BAD_REQUEST));
    }
    const additionalClaims = {
      userId: user._id,
      role: roleTypes.USER,
    };
    const token = await auth.createCustomToken(cred.user.uid, additionalClaims);
    res.status(httpStatus.CREATED).send(success('AUTH014', { user, token }, httpStatus.CREATED));
    await otpService.makeOtpInvalid(phoneNumber, otpTypes.REGISTER, providerTypes.EMAIL_PASSWORD);
  } catch (err) {
    logger.error(err);
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH008', {}, httpStatus.BAD_REQUEST));
  }

  // try {
  //   let referBy = null;
  //   let points = 0;
  //   if (referCode) {
  //     referBy = await userService.getUser({ referCode });
  //     if (!referBy) {
  //       return res.status(httpStatus.BAD_REQUEST).send();
  //     }
  //     const refferedUserPoints = await configurationService.getConfiguration({ code: 'REFERRED_USER_POINTS' });
  //     points = refferedUserPoints;
  //   }

  //   if (referCode) {
  //     const refferalPoints = await configurationService.getConfiguration({ code: 'REFERRING_USER_POINTS' });
  //     let totalPoints = referBy.points;
  //     if (refferalPoints && refferalPoints.value) {
  //       totalPoints += refferalPoints.value;
  //     }
  //     await userService.updateUserById(referBy._id, {
  //       points: totalPoints,
  //     });
  //     await refferalhistoryService.createRefferalHistory({
  //       from: referBy._id,
  //       to: user._id,
  //       refferalCode: referCode,
  //     });
  //     await pointhistoryService.createPointHistories([
  //       {
  //         userId: referBy._id,
  //         type: pointEarningTypes.REFFERAL,
  //         points: refferalPoints.value,
  //       },
  //       {
  //         userId: user._id,
  //         type: pointEarningTypes.REFFERED,
  //         points,
  //       },
  //     ]);
  //   }
});

const addRequiredAccountDetails = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const user = await userService.getUserById(userId, 'requireAccountDetails provider uid cartId');
  if (!user.requireAccountDetails || user.provider === providerTypes.GOOGLE) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH009', {}, httpStatus.BAD_REQUEST));
  }
  const { name, referCode, emailUpdates, location, gender, dateOfBirth } = req.body;
  const splittedName = name.split(' ');
  let referBy = null;
  if (referCode) {
    referBy = await userService.getUser({ referCode }, 'id');
    if (!referBy) {
      return res.status(httpStatus.BAD_REQUEST).send(error('AUTH019', {}, httpStatus.BAD_REQUEST));
    }
  }
  await userService.updateUserById(userId, {
    firstName: splittedName.length > 0 ? splittedName[0] : '',
    lastName: splittedName.length > 1 ? splittedName[1] : '',
    referBy,
    isEmailVerified: false,
    emailUpdates,
    requireAccountDetails: false,
    location, // || defaultLocationData,
    gender,
    dateOfBirth,
  });
  if (referCode) {
    await refferalhistoryService.createRefferalHistory({
      from: referBy.id,
      to: user.id,
      message: `{{#name}} joined dayout using your refferal code`,
      refferalCode: referCode,
      createdBy: user.id,
    });
  }
  await auth.setCustomUserClaims(user.uid, {
    requireAccountDetails: false,
    userId: user.id,
    cartId: user.cartId,
    role: roleTypes.USER,
  });
  const token = await auth.createCustomToken(user.uid, {
    requireAccountDetails: false,
    userId: user.id,
  });
  return res.status(httpStatus.OK).send(success('AUTH010', { token }, httpStatus.OK));
});
// const googleRegister = catchAsync(async (req, res) => {
//   // user creation
//   const user = await userService.createUser(req.body);
//   // refferal system
//   const { referCode } = req.body;
//   if (referCode) {
//     const referBy = await userService.getUser({ referCode });
//     const refferalPoints = await configurationService.getConfiguration({ code: 'REFERRING_USER_POINTS' });
//     let totalPoints = referBy.points;
//     if (refferalPoints && refferalPoints.value) {
//       totalPoints = referBy.points + refferalPoints.value;
//     }
//     await userService.updateUserById(referBy._id, {
//       referBy: referBy._id,
//       points: totalPoints,
//     });
//     await refferalhistoryService.createRefferalHistory({
//       from: referBy._id,
//       to: user._id,
//       refferalCode: referCode,
//     });
//     await pointhistoryService.createPointHistory({
//       userId: user._id,
//       type: pointEarningTypes.REFFERAL,
//       points: refferalPoints.value,
//     });
//   }

//   // token generation
//   const tokens = await tokenService.generateAuthTokens(user);
//   res.status(httpStatus.CREATED).send({ user, tokens });
// });
const checkUser = catchAsync(async (req, res) => {
  const { googleIdToken } = req.body;
  const decodedToken = jwtDecode(googleIdToken);
  const { email } = decodedToken;

  const user = await userService.getUserByEmail(email, 'provider');
  return res.status(httpStatus.OK).send(
    success(
      user ? 'AUTH015' : 'AUTH016',
      {
        isUserFound: !!user,
        isGoogleProvider: user && user.provider === providerTypes.GOOGLE,
      },
      httpStatus.OK
    )
  );
});

const updateProfileDetails = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const user = await userService.updateUserById(userId, req.body);
  return res.status(httpStatus.OK).send(success('AUTH021', { user }, httpStatus.OK));
});

const me = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const user = await userService.getUserById(userId, 'firstName lastName email phoneNumber gender referCode points');
  if (req.headers.fcmtoken) {
    deviceService.updateDevice({ token: req.headers.fcmtoken }, { userId: req.user.id }, { upsert: true });
  }
  return res.status(httpStatus.OK).send(
    success(
      'AUTH020',
      {
        user,
      },
      httpStatus.OK
    )
  );
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email, 'provider');
  if (!user) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH017', {}, httpStatus.BAD_REQUEST));
  }
  if (providerTypes.GOOGLE === user.provider) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH011', {}, httpStatus.BAD_REQUEST));
  }
  await sendPasswordResetEmail(firebaseAuth, email);
  return res.status(httpStatus.OK).send(success('AUTH018', {}, httpStatus.OK));
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const { user } = req;
  const { provider, isEmailVerified } = user;
  if (providerTypes.GOOGLE === provider) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH011', {}, httpStatus.BAD_REQUEST));
  }
  if (isEmailVerified) {
    return res.status(httpStatus.BAD_REQUEST).send(error('AUTH013', {}, httpStatus.BAD_REQUEST));
  }
  await sendEmailVerification(user);
  return res.status(httpStatus.OK).send(error('AUTH012', {}, httpStatus.OK));
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

// const googleLogin = catchAsync(async (req, res) => {
//   const { googleIdToken, email } = req.body;
// try {
// let isExistingEmailPasswordUser = false;
// let isExistingEmailVerified = false;
// const user = await userService.getUser({ provider: providerTypes.EMAIL_PASSWORD, email });
// if (user) {
//   isExistingEmailPasswordUser = true;
//   if (user.isEmailVerified) isExistingEmailVerified = true;
//   if (isExistingEmailPasswordUser && !isExistingEmailVerified) {
//     return res.status(400).json({ error: 'Email address already registered - please verify it via the email link first' });
//   }
// }
// if (isExistingEmailPasswordUser && isExistingEmailVerified) console.log('Adding new auth provider : Google');
// performing google login
// const credential = firebase.auth.GoogleAuthProvider.credential(googleIdToken);
// const cred = await auth.signInWithCredential(credential);
// const isNewGoogleUser = cred.additionalUserInfo.isNewUser;
// // if new user, add to db
// if (isNewGoogleUser) {
//   try {
//     const { displayName } = cred.user;
//     const username = await generateUsername(displayName);
//     if (!username) return res.status(500).json({ error: 'Unable to create username' });
//     const currentTimestamp = new Date().toISOString();
//     const newUser = {
//       createdOn: currentTimestamp,
//       lastUpdated: currentTimestamp,
//       uid: cred.user.uid,
//       accountType,
//       username,
//       displayName,
//       email: cred.user.email,
//       role: 'user',
//       provider: 'google',
//       emailVerified: cred.user.emailVerified,
//       emailSubscription: !!appConfig.defaultEmailSubscription,
//       avatarUrl: cred.user.photoURL,
//       requireAccountDetails: true,
//       userPrivacy: 'PUBLIC',
//       deleted: false,
//       location: req.body.location || defaultLocationData,
//       unitPreference: getUnitPreference('metric'),
//       verificationStatus: {},
//     };
//     if (cred.user.phoneNumber) newUser.phoneNumber = cred.user.phoneNumber;
//     // if (accountType === "trainer") {
//     //     const trainerSpecificData = {
//     //         businessName: "",
//     //         availability: true,
//     //         clientTransformations: [],
//     //         services: [],
//     //         plans: [],
//     //         reviewCount: 0,
//     //         avgRating: 0,
//     //     }
//     //     newUser = {...newUser, ...trainerSpecificData}
//     // }
//     const { errors, valid } = validateSignupData(newUser);
//     if (!valid) {
//       logger.error('Errors = ', errors);
//       return res.status(400).json({ errors });
//     }
//     try {
//       // adding the new user to the database
//       await db.doc(`/users/${newUser.username}`).set(newUser);
//       // adding a default follower document for the user
//       await db.doc(`/followers/${newUser.username}`).set(
//         getDefaultFollowerData({
//           username: newUser.username,
//           displayName: newUser.displayName,
//           avatarUrl: newUser.avatarUrl,
//         })
//       );
//       return res.status(201).json({ token: userData.googleIdToken });
//     } catch (err) {
//       logger.error(err);
//       throw err;
//     }
//   } catch (err) {
//     logger.error(err);
//     await cred.user.delete();
//     logger.warn('-- User Deleted --');
//     return res.status(500).json({ error: 'Unable to login with Google' });
//   }
// } else {
//   return res.status(200).json({ token: userData.googleIdToken });
// }
// } catch (err) {
//   logger.error(err);
//   return res.status(500).json({ error: 'Unable to verify Google login token' });
// }
// });

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  // googleLogin,
  sendOtp,
  addRequiredAccountDetails,
  // googleRegister,
  continueWithGoogle,
  checkUser,
  me,
  updateProfileDetails,
};
