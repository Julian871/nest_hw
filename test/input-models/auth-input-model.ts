// Login, logout, devices, tokens URI
export const publicLoginUri = '/auth/login/';
export const publicLogoutUri = '/auth/logout/';
export const publicRefreshTokenURI = '/auth/refresh-token/';
export const publicMeURI = '/auth/me/';
export const publicDevicesURI = '/security/devices/';

// Basic auth
export const basicAuthLogin = 'admin';
export const basicAuthPassword = 'qwerty';

// Users URI
export const saUsersURI = '/sa/users/';
export const bloggerUsersURI = '/blogger/users/';
export const banURI = '/ban/';

// User creation strings
export const user01Login = 'login01';
export const user01Email = 'login01@test.com';
export const user02Login = 'login02';
export const user02Email = 'login02@test.com';
export const user03Login = 'login03';
export const user03Email = 'login03@test.com';
export const user04Login = 'login04';
export const user04Email = 'login04@test.com';
export const userPassword = 'qwerty';

export const sleep = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const userProfileObject = {
  email: user01Email,
  login: user01Login,
  userId: expect.any(String),
};

export const deviceObject = {
  ip: expect.any(String),
  title: expect.any(String),
  lastActiveDate: expect.any(String),
  deviceId: expect.any(String),
};
