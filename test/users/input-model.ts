function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const newUserBody = {
  login: 'user' + randomInteger(1, 20) + '_login',
  password:
    'a' +
    randomInteger(1, 9) +
    'f' +
    randomInteger(1, 9) +
    'q' +
    randomInteger(1, 9) +
    't' +
    randomInteger(1, 9),
  email: 'testEmail' + randomInteger(1, 20) + '@mail.ru',
};
