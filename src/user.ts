// import { Err, ErrKind, UserId, UserData, SessionId, EmptyObj, UserDataSummary } from './types';

// import validator from 'validator';

// /**
//  * Register a user with an email, password, and names, then returns their
//  * userId value
//  *
//  * @param {string} email - Users email
//  * @param {string} password - Users password
//  * @param {string} nameFirst - Users first name
//  * @param {string} nameLast - Users last name
//  * @returns {{userId: number}} userId - Unique identifier for an
//  * authenticated user
//  */
// export function userRegister(
//     email: string,
//     password: string,
//     nameFirst: string,
//     nameLast: string
//   ): never | { userId: UserId } {
//   const store = getData().users; // this may have to change according to Josh.

//   if (!validator.isEmail(email)) {
//     throw new Err('Email is invalid', ErrKind.EINVALID);
//   }

//   for (const user of store.values()) {
//     if (user.email === email) {
//       throw new Err('This email is already registered on another account', ErrKind.EINVALID);
//     }
//   }

//   validatePassword(password, 'new ');
//   validateName(nameFirst, 'first ');
//   validateName(nameLast, 'last ');

//   const crypto = require('crypto');
//   const newUser: UserData = {
//     email: email,
//     password: crypto.createHash('sha256').update(password).digest('hex'),
//     nameFirst: nameFirst,
//     nameLast: nameLast,
//     prevPasswords: new Set(),
//     numSuccessfulLogins: 1,
//     numFailedPasswordsSinceLastLogin: 0,
//   };

//   const userId = store.size + 1;
//   store.set(userId, newUser);

//   setData(); // this to. 
//   return { userId: userId };
// }

// /**
//  * Given a registered user's email and password returns their userId value.
//  *
//  * @param {email} - Users email
//  * @param {password} - Users password
//  * @return {userId: number} userId - Unique identifier for an
//  * authenticated user
//  *
//  */
// export function userLogin(
//   email: string,
//   password: string
// ): never | { userId: UserId } {
//   const store = getData().users;

//   const userEntry = [...store.entries()].find(([_, user]) => user.email === email);

//   if (!userEntry) {
//     throw new Err('email adress does not exist', ErrKind.EINVALID);
//   }

//   const [userId, user] = userEntry;

//   const crypto = require('crypto');
//   const inputHash = crypto.createHash('sha256').update(password).digest('hex');
//   if (user.password !== inputHash) {
//     user.numFailedPasswordsSinceLastLogin += 1;
//     throw new Err('Password does not match the following email', ErrKind.EINVALID);
//   }

//   user.numFailedPasswordsSinceLastLogin = 0;
//   user.numSuccessfulLogins += 1;
//   setData();
//   return {
//     userId: userId,
//   };
// }

// /**
//  * User is logged out, sessioniD is deleted.
//  *
//  * @param {number} userId - unique identifier for an authenticated user
//  * @returns {{} | Err } -
//  * empty object or invalid {error: string}
//  */
// export function userLogout(sessionId: SessionId): EmptyObj | never {
//   const sessions = getData().userSessions;

//   if (!sessions.has(sessionId)) {
//     throw new Err('Invalid User Token', ErrKind.ENOTOKEN);
//   }

//   sessions.delete(sessionId);
//   return {};
// }

// /**
//  * Check if a password is strong enough. DOES NOT CHECK A USER'S PREV PASSWORDS!
//  *
//  * @param {string} password - the password to validate
//  * @returns {boolean | Err} - valid (true) or invalid {error: string} password.
//  */
// function validatePassword(password: string, message: string): true | never {
//   if (!/\d/.test(password)) {
//     throw new Err(`${message}password does not contain a number!`, ErrKind.EINVALID);
//   }
//   if (!/[A-Za-z]/.test(password)) {
//     throw new Err(`${message}password does not contain a letter!`, ErrKind.EINVALID);
//   }
//   if (password.length < 8) {
//     throw new Err(`${message}password is less than 8 characters long!`, ErrKind.EINVALID);
//   }
//   return true;
// }

// /**
//  * Given admin users userId returns details about user.
//  *
//  * @param   {integers} userId.
//  * @returns {user: {
// * userId: number,
// * name: string,
// * email: string,
// * numSuccessfulLogins: number,
// * numFailedPasswordsSinceLastLogin: number}}
// */
// export function userDetails(userId: UserId): { user: UserDataSummary } | never {
//  const store = getData().users;

//  const currentUser = store.get(userId)!;
//  return {
//    user: {
//      userId: userId,
//      name: currentUser.nameFirst + ' ' + currentUser.nameLast,
//      email: currentUser.email,
//      numSuccessfulLogins: currentUser.numSuccessfulLogins,
//      numFailedPasswordsSinceLastLogin: currentUser.numFailedPasswordsSinceLastLogin,
//    },
//  };
// }

// /**
// * Given admin users userId and a set of properties,
// * update the properties of the admin user.
// *
// * @param {integers} userId - unique identitifier for an authenticated user
// * @param {string} email - Users email
// * @param {string} nameFirst - Users First Name
// * @param {string} nameLast - Users Last Name
// * @returns {} - empty object
// */
// export function userDetailsUpdate(
//  userId: UserId,
//  email: string,
//  nameFirst: string,
//  nameLast: string
// ): EmptyObj | never {
//  const store = getData().users;
//  for (const [userId, userData] of store.entries()) {
//    if (userId !== userId && userData.email === email) {
//      throw new Err('This email is already registered on another account', ErrKind.EINVALID);
//    }
//  }
//  if (!validator.isEmail(email)) {
//    throw new Err('Email is invalid', ErrKind.EINVALID);
//  }
//  validateName(nameFirst, 'first ');
//  validateName(nameLast, 'last ');

//  const user = store.get(userId)!;
//  user.email = email;
//  user.nameFirst = nameFirst;
//  user.nameLast = nameLast;
//  setData();
//  return {};
// }

// /**
//  * Check if a name follows the rules for it1
//  *
//  * @param {string} name - the name to validate
//  * @returns {boolean | Err } - valid (true) or invalid {error: string} name.
//  */
// function validateName(name: string, message: string): true | never {
//   const invalidChar = /[^a-zA-Z' -]/;
//   if (invalidChar.test(name)) {
//     throw new Err(
//       `${message}name can only contain letters, spaces, hyphens, and apostrophes.`,
//       ErrKind.EINVALID
//     );
//   }
//   if (name.length < 2 || name.length > 20) {
//     throw new Err(
//       `${message}name must be between 2 and 20 characters long.`,
//       ErrKind.EINVALID
//     );
//   }

//   return true;
// }
