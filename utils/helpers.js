module.exports.validatePhoneNumber = (phone) => {
  const [code, phoneNo] = (phone || '').split(' ');
  if (!code || code !== '+65') {
    return {
      success: false,
      message: 'Phone code invalid',
    }
  }

  if (!phoneNo || phoneNo.toString().length !== 8) {
    return {
      success: false,
      message: 'Phone number invalid',
    }
  }

  return {
    success: true,
    message: '',
  }
}
