import { addItem, addOrder, addToken, addUser, deleteItem, deleteOrder, deleteToken, deleteUser, getItem, getOrder, getOrdersByUser, getUser, updateOrder, updateUser, validToken } from "./dataStore";
import { Item, Order, User } from "./types";
/*
// Adds and runs tests on a user with 2 items, and 2 orders
async function testDatabase() {
    try {
        console.log("🚀 Starting database test...");

////////////////////////////// PART 1: TEST USER ///////////////////////////////
        console.log("\n// PART 1: TEST USER //\n");

        // Add user
        const newUser: User = {
            id: -1,
            nameFirst: "John",
            nameLast: "Smith",
            email: "javasmith@gmail.com",
            password: "example123",
            numSuccessfulLogins: 0,
            numFailedPasswordsSinceLastLogin: 0
        };
        newUser.id = await addUser(newUser);
        console.log("➕ User added with id:", newUser.id);

        // Fetch and log the newly added user
        const fetchedUser = await getUser(newUser.id);
        console.log("🔍 Fetched User:", fetchedUser);

        // Update the user's details
        const updatedUser: User = { ...newUser, nameFirst: "Stacy", nameLast: "Mittens", email: "smitten@gmail.com" };
        const updatedUserResult = await updateUser(updatedUser);
        console.log("✏️  User updated?", updatedUserResult);

        // Fetch and log the updated user
        const fetchedUpdatedUser = await getUser(newUser.id);
        console.log("🔍 Updated User:", fetchedUpdatedUser);

///////////////////////////// PART 2: TEST SESSION /////////////////////////////
        console.log("\n// PART 2: TEST SESSION //\n");

        // Add session
        const addTokenResult = await addToken(42, newUser.id);
        console.log("✏️  Session added?", addTokenResult);

        // Check valid then invalid session
        const validTokenResult = await validToken(42);
        const invalidTokenResult = await validToken(404);
        console.log("✏️  Valid then invalid Sessions?", validTokenResult, invalidTokenResult);

////////////////////////////// PART 3: TEST ITEMS //////////////////////////////
        console.log("\n// PART 3: TEST ITEMS //\n");

        // Add items
        const item1: Item = {
            id: -1,
            name: "Headphones",
            price: 100
        };
        item1.id = await addItem(item1);
        console.log("➕ Item added with id:", item1.id);

        const item2: Item = {
            id: -1,
            name: "Laptop",
            price: 200
        };
        item2.id = await addItem(item2);
        console.log("➕ Item added with id:", item2.id);

        // Fetch and log the first newly added item
        const fetchedItem = await getItem(item1.id);
        console.log("🔍 Fetched Item:", fetchedItem);

///////////////////////////// PART 4: TEST ORDERS //////////////////////////////
        console.log("\n// PART 4: TEST ORDERS //\n");

        // Add orders
        const order1: Order = {
            id: -1,
            userId: newUser.id,
            totalPrice: 300
        }
        const orderItems1: OrderItem[] = [{
            orderId: -1,
            itemId: item1.id,
            quantity: 3
        }];

        const orderRes1 = await addOrder(order1, orderItems1);
        if (orderRes1 === null) throw Error;
        order1.id = orderRes1;
        for (const item of orderItems1) {
            item.orderId = order1.id;
        };
        console.log("➕ Order added with id:", order1.id);

        const order2: Order = {
            id: -1,
            userId: newUser.id,
            totalPrice: 500
        }
        const orderItems2: OrderItem[] = [{
            orderId: -1,
            itemId: item1.id,
            quantity: 1
        },{
            orderId: -1,
            itemId: item2.id,
            quantity: 2
        }];

        const orderRes2 = await addOrder(order2, orderItems2);
        if (orderRes2 === null) throw Error;
        order2.id = orderRes2;
        for (const item of orderItems1) {
            item.orderId = order2.id;
        };
        console.log("➕ Order added with id:", order2.id);

        // Fetch and log the second newly added order
        const fetchedOrder = await getOrder(order2.id);
        console.log("🔍 Fetched Order:", fetchedOrder);

        // Update the first newly added order
        const updatedOrder1: Order = {
            id: order1.id,
            userId: newUser.id,
            totalPrice: 800
        }
        const updatedOrderItems1: OrderItem[] = [{
            orderId: order1.id,
            itemId: item1.id,
            quantity: 8
        }];

        const updatedOrderResult = await updateOrder(updatedOrder1, updatedOrderItems1);
        console.log("✏️  Order updated?", updatedOrderResult);

        // Fetch and log all orders added by user
        const fetchedOrdersByUser = await getOrdersByUser(newUser.id);
        console.log("🔍 Fetched Orders by User:", fetchedOrdersByUser);

////////////////////////// PART 5: DELETE EVERYTHING ///////////////////////////
        console.log("\n// PART 5: DELETE EVERYTHING //\n");

        // Delete the first order
        const deleteOrderResult1 = await deleteOrder(order1.id);
        console.log("🗑️  Order 1 deleted?", deleteOrderResult1);

        // Delete the second order
        const deleteOrderResult2 = await deleteOrder(order2.id);
        console.log("🗑️  Order 2 deleted?", deleteOrderResult2);

        // Delete the first item
        const deleteItemResult1 = await deleteItem(item1.id);
        console.log("🗑️  Item 1 deleted?", deleteItemResult1);

        // Delete the second item
        const deleteItemResult2 = await deleteItem(item2.id);
        console.log("🗑️  Item 2 deleted?", deleteItemResult2);

        // Delete the session
        const deleteTokenResult = await deleteToken(42);
        console.log("🗑️  Session deleted?", deleteTokenResult);

        // Delete the user
        const deleteUserResult = await deleteUser(newUser.id);
        console.log("🗑️  User deleted?", deleteUserResult);

        // Try fetching deleted user (null)
        const deletedUser = await getUser(newUser.id);
        console.log("🔍 Deleted User (should be null):", deletedUser);

        console.log("✅ Database test completed successfully!");
    } catch (error) {
        console.error("❌ Error during database test:", error);
    }
}

// Run the test function
testDatabase();
*/