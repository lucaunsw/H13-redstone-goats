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
Object.defineProperty(exports, "__esModule", { value: true });
const dataStore_1 = require("./dataStore");
// Adds and runs tests on a user with 2 items, and 2 orders
function testDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🚀 Starting database test...");
            ////////////////////////////// PART 1: TEST USER ///////////////////////////////
            console.log("\n// PART 1: TEST USER //\n");
            // Add user
            const newUser = {
                nameFirst: "John",
                nameLast: "Smith",
                email: "javasmith@gmail.com",
                password: "example123",
                numSuccessfulLogins: 0,
                numFailedPasswordsSinceLastLogin: 0
            };
            newUser.id = yield (0, dataStore_1.addUser)(newUser);
            console.log("➕ User added with id:", newUser.id);
            const newUser2 = {
                nameFirst: "AAA",
                nameLast: "BBB",
                email: "aaabbb@gmail.com",
                password: "example123",
                numSuccessfulLogins: 0,
                numFailedPasswordsSinceLastLogin: 0
            };
            newUser2.id = yield (0, dataStore_1.addUser)(newUser2);
            console.log("➕ User added with id:", newUser.id);
            const fetchedUsers = yield (0, dataStore_1.getAllUsers)();
            console.log(fetchedUsers);
            // Clear
            yield (0, dataStore_1.clearAll)();
            const fetchedUsers2 = yield (0, dataStore_1.getAllUsers)();
            console.log(fetchedUsers2);
            console.log("✅ Database test completed successfully!");
        }
        catch (error) {
            console.error("❌ Error during database test:", error);
        }
    });
}
// Run the test function
testDatabase();
