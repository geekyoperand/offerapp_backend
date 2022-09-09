const path = require('path');
require('dotenv').config();

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const stagingId = 'dayout-dev';
const prodId = 'dayout-prod';

const isEnvDev = () => process.env.NODE_ENV === 'development'; // Boolean(process.env.FUNCTIONS_EMULATOR) === true;

const firebaseConfig = () => {
  if (firebaseProjectId === stagingId) {
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      defaultFunctionsRegion: process.env.FIREBASE_FUNCTIONS_DEFAULT_REGION,
    };
  }
  if (firebaseProjectId === prodId) {
    return {
      apiKey: process.env.FIREBASE_API_KEY_PROD,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN_PROD,
      projectId: process.env.FIREBASE_PROJECT_ID_PROD,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET_PROD,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_PROD,
      appId: process.env.FIREBASE_APP_ID_PROD,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID_PROD,
      defaultFunctionsRegion: process.env.FIREBASE_FUNCTIONS_DEFAULT_REGION_PROD,
    };
  }
  return `Invalid firebase project ID : ${firebaseProjectId}`;
};

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  defaultSesRegion: process.env.AWS_SES_DEFAULT_REGION,
};

const algoliaConfig = {
  applicationId: process.env.ALGOLIA_APPLICATION_ID,
  adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
};

const paytm = {
  MID: 'KAfyWc57112019818864',
  KEY: '#gnRcZL1rfO4hyl7',
  CALLBACK_URL: `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=`,
  URL_SCHEME: 'paytmMIDKAfyWc57112019818864',
};

const mongoose = {
  url: process.env.MONGODB_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
};

const redis = {
  host: '127.0.0.1',
  timeToLive: 604800,
};

const port = process.env.PORT;

const appConfig = () => {
  return {
    jwtSecretKey: process.env.APP_JWT_SECRET_KEY,
    primaryEmailAddress: process.env.APP_PRIMARY_EMAIL_ADDRESS,
    appEnvironment: isEnvDev() ? 'development' : 'production',
    // domainName: isEnvDev()
    //   ? process.env.APP_DOMAIN_NAME_DEV
    //   : firebaseProjectId === stagingId
    //   ? process.env.APP_DOMAIN_NAME_STAGING
    //   : process.env.APP_DOMAIN_NAME_PROD,
    rootDir: __dirname,
    emailTemplatesPath: path.join(__dirname, 'email_templates/html'),
    companyName: 'ProgressPicture',
    infoEmailAddress: 'info@progresspicture.com',
    supportEmailAddress: 'support@progresspicture.com',
    defaultPhotoUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig().storageBucket}/o/no-img.jpg?alt=media`,
    defaultEmailSubscription: false,
    imageThumbnailSizes: {
      userAvatarImage: ['128x128'],
      planAvatarImage: ['345x180', '128x128'],
      transformationImage: ['300x600', '173x345'],
      trainerServiceImage: ['350x200', '175x100'],
      trainerPlanImage: ['400x200', '200x100'],
      headerImage: ['560x400', '200x100'],
    },
  };
};

module.exports = {
  isEnvDev: isEnvDev(),
  firebaseProjectId,
  firebaseConfig: firebaseConfig(),
  awsConfig,
  algoliaConfig,
  appConfig: appConfig(),
  mongoose,
  port,
  redis,
  paytm,
};
