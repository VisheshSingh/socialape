const isEmpty = field => {
  if (field.trim() === '') return true;
  return false;
};

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  return false;
};

exports.validateSignupDetails = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Email must not be empty';
  } else if (!isEmail(data.email)) {
    errors.email = 'Email is not valid';
  }

  if (isEmpty(data.password)) {
    errors.password = 'Password cannot be empty';
  }

  if (isEmpty(data.handle)) {
    errors.handle = 'Handle must not be empty';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Password must match';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginDetails = data => {
  // VALIDATE DATA
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Email must not be empty';
  } else if (!isEmail(data.email)) {
    errors.email = 'Email is not valid';
  }

  if (isEmpty(data.password)) {
    errors.password = 'Password cannot be empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
