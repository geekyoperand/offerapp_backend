const paymentModes = {
  CARD: 'CARD',
  UPI: 'UPI',
  AMAZONPAY: 'AMAZONPAY',
  PAYTM: 'PAYTM',
  WALLET: 'WALLET',
};

const paymentStatus = {
  COMPLETE: 'COMPLETE',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

const resultCode = {
  TXN_SUCCESS_01: '01',
  TXN_FAILURE_227: '227',
  TXN_FAILURE_235: '235',
  TXN_FAILURE_295: '295',
  NO_RECORD_FOUND_331: '331',
  TXN_FAILURE_334: '334',
  TXN_FAILURE_335: '335',
  PENDING_400: '400',
  TXN_FAILURE_401: '401',
  PENDING_402: '402',
  TXN_FAILURE_501: '501',
  TXN_FAILURE_810: '810',
};

const transactionStatuses = {
  TXN_SUCCESS: "TXN_SUCCESS",
  TXN_FAILURE: "TXN_FAILURE",
  PENDING: "PENDING",
  NO_RECORD_FOUND: "NO_RECORD_FOUND"
}

module.exports = {
  paymentModes,
  paymentStatus,
  resultCode,
  transactionStatuses 
};
