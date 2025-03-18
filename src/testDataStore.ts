import { addItem, addOrder, addToken, addUser, clearAll, deleteItem, deleteOrder, deleteToken, deleteUser, getAllUsers, getItem, getOrder, getOrdersByBuyer, getUser, updateOrder, updateUser, validToken } from "./dataStore";
import { Item, Order, User } from "./types";

// Adds and runs tests on a user with 2 items, and 2 orders
async function testDatabase() {
    try {
        console.log("🚀 Starting database test...");

////////////////////////////// PART 1: TEST USER ///////////////////////////////
        console.log("\n// PART 1: TEST USER //\n");

        // Add user
        const newUser: User = {
            nameFirst: "John",
            nameLast: "Smith",
            email: "javasmith@gmail.com",
            password: "example123",
            numSuccessfulLogins: 0,
            numFailedPasswordsSinceLastLogin: 0
        };
        newUser.id = await addUser(newUser);
        console.log("➕ User added with id:", newUser.id);

        const newUser2: User = {
            nameFirst: "AAA",
            nameLast: "BBB",
            email: "aaabbb@gmail.com",
            password: "example123",
            numSuccessfulLogins: 0,
            numFailedPasswordsSinceLastLogin: 0
        };
        newUser2.id = await addUser(newUser2);
        console.log("➕ User added with id:", newUser.id);

        const fetchedUsers = await getAllUsers();
        console.log(fetchedUsers);

        // Clear
        await clearAll();

        const fetchedUsers2 = await getAllUsers();
        console.log(fetchedUsers2);

        console.log("✅ Database test completed successfully!");
    } catch (error) {
        console.error("❌ Error during database test:", error);
    }
}

// Run the test function
testDatabase();
