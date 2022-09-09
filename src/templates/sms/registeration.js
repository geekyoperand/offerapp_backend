const message = (otp) => {
  return (
    `Dear User,\n` +
    `${otp} is your otp for verification on Dayout. Please enter the OTP to verify your phone number.\n` +
    `Regards\n` +
    `Dayout life`
  );
};

module.exports = message;
