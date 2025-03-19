"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegister = userRegister;
exports.userLogin = userLogin;
exports.userLogout = userLogout;
exports.userDetails = userDetails;
const dataStore_1 = require("./dataStore");
const types_1 = require("./types");
const validator_1 = __importDefault(require("validator"));
const server_1 = require("./server"); // Redis client
/**
 * Register a user with an email, password, and names, then returns their
 * userId value
 *
 * @param {string} email - Users email
 * @param {string} password - Users password
 * @param {string} nameFirst - Users first name
 * @param {string} nameLast - Users last name
 * @returns {{userId: number}} userId - Unique identifier for an
 * authenticated user
 */
function userRegister(email, password, nameFirst, nameLast) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validator_1.default.isEmail(email)) {
            throw new types_1.Err('Email is invalid', types_1.ErrKind.EINVALID);
        }
        const existingUsers = yield (0, dataStore_1.getAllUsers)();
        for (const user of existingUsers) {
            if (user.email === email) {
                throw new types_1.Err('This email is already registered on another account', types_1.ErrKind.EINVALID);
            }
        }
        validatePassword(password, 'new ');
        validateName(nameFirst, 'first ');
        validateName(nameLast, 'last ');
        const crypto = require('crypto');
        const newUser = {
            email: email,
            password: crypto.createHash('sha256').update(password).digest('hex'),
            nameFirst: nameFirst,
            nameLast: nameLast,
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
        };
        const userId = yield (0, dataStore_1.addUser)(newUser);
        return { userId: userId };
    });
}
/**
 * Given a registered user's email and password returns their userId value.
 *
 * @param {email} - Users email
 * @param {password} - Users password
 * @return {userId: number} userId - Unique identifier for an
 * authenticated user
 *
 */
function userLogin(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const crypto = require('crypto');
        // Fetch all users and find the one with the matching email
        const allUsers = yield (0, dataStore_1.getAllUsers)();
        const user = allUsers.find((u) => u.email === email);
        if (!user) {
            throw new types_1.Err('Email address does not exist', types_1.ErrKind.EINVALID);
        }
        // Hash the input password and compare with stored password
        const inputHash = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password !== inputHash) {
            user.numFailedPasswordsSinceLastLogin += 1;
            yield (0, dataStore_1.updateUser)(user); // Update failed login count in DB
            throw new types_1.Err('Password does  notmatch the provided email', types_1.ErrKind.EINVALID);
        }
        // Reset failed login attempts and increment successful logins
        user.numFailedPasswordsSinceLastLogin = 0;
        user.numSuccessfulLogins += 1;
        yield (0, dataStore_1.updateUser)(user);
        return { userId: user.id };
    });
}
/**
 * User is logged out, sessioniD is deleted.
 *
 * @param {number} userId - unique identifier for an authenticated user
 * @returns {{} | Err } -
 * empty object or invalid {error: string}
 */
function userLogout(token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield server_1.redisClient.set(`blacklist_${token}`, 'true', { EX: 3600 });
        return {};
    });
}
/**
 * Given admin users userId returns details about user.
 *
 * @param   {integers} userId.
 * @returns {user: {
* userId: number,
* name: string,
* email: string,
* numSuccessfulLogins: number,
* numFailedPasswordsSinceLastLogin: number}}
*/
function userDetails(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = yield (0, dataStore_1.getUser)(userId);
        if (!currentUser) {
            throw new types_1.Err('User not found', types_1.ErrKind.EINVALID);
        }
        return {
            user: {
                userId: userId,
                name: currentUser.nameFirst + ' ' + currentUser.nameLast,
                email: currentUser.email,
                numSuccessfulLogins: currentUser.numSuccessfulLogins,
                numFailedPasswordsSinceLastLogin: currentUser.numFailedPasswordsSinceLastLogin,
            },
        };
    });
}
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
/**
 * Check if a name follows the rules for it1
 *
 * @param {string} name - the name to validate
 * @returns {boolean | Err } - valid (true) or invalid {error: string} name.
 */
function validateName(name, message) {
    const invalidChar = /[^a-zA-Z' -]/;
    if (invalidChar.test(name)) {
        throw new types_1.Err(`${message}name can only contain letters, spaces, hyphens, and apostrophes.`, types_1.ErrKind.EINVALID);
    }
    if (name.length < 2 || name.length > 20) {
        throw new types_1.Err(`${message}name must be between 2 and 20 characters long.`, types_1.ErrKind.EINVALID);
    }
    return true;
}
/**
 * Check if a password is strong enough. DOES NOT CHECK A USER'S PREV PASSWORDS!
 *
 * @param {string} password - the password to validate
 * @returns {boolean | Err} - valid (true) or invalid {error: string} password.
 */
function validatePassword(password, message) {
    if (!/\d/.test(password)) {
        throw new types_1.Err(`${message}password does not contain a number!`, types_1.ErrKind.EINVALID);
    }
    if (!/[A-Za-z]/.test(password)) {
        throw new types_1.Err(`${message}password does not contain a letter!`, types_1.ErrKind.EINVALID);
    }
    if (password.length < 8) {
        throw new types_1.Err(`${message}password is less than 8 characters long!`, types_1.ErrKind.EINVALID);
    }
    return true;
}
