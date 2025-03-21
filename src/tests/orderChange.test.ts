// IMPORTS + CONFIGS
import request from "sync-request-curl";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { OrderChangeParam, SessionId, UserSimple, Item, BillingDetails, DeliveryInstructions, Order } from '../types';
import { reqHelper, userRegister } from "./testHelper";
import { getOrder} from "../dataStore";

// CONSTANTS 
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;

// HTTP REQUEST FUNCTION 

function orderChangePutRequest(  
    route: string,
    body: OrderChangeParam, ) {
    
    const res = request("PUT", SERVER_URL + route, {
      json: body,
      timeout: TIMEOUT_MS,
    });

    // // DEBUG
    // console.log('HTTP REQUEST FUNCTION: orderChange Response Body', res.body.toString());
    // console.log('HTTP REQUEST FUNCTION: orderChange Status Code', res.statusCode);

    return {
      body: JSON.parse(res.body.toString()),
      statusCode: res.statusCode,
    };
}

// OrderCreate
async function orderCreatePutRequest( body: Order,) {
    const res = request("POST", SERVER_URL + `/v1/order/create`, {
      json: body,
      timeout: TIMEOUT_MS,
    });

    // console.log('HTTP REQUEST FUNCTION: orderCreate Response Body:', res.body.toString());

    return {
      body: JSON.parse(res.body.toString()),
      statusCode: res.statusCode,
    };
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

// Initalise Values
let testBuyerId: number;
let testSellerId: number;
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem1: Item;
let testItem2: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
let createTestParam: Order;
const date = new Date().toISOString().split('T')[0];

// Clear DB before each test
beforeEach(async() => {
    await reqHelper('DELETE', '/v1/clear');
})

// Setup test values:
// Available before each test is
// - buyerToken
// - sellerToken
// - all valid test details
beforeEach(async() => {

    //console.log('PRE SETUP!')

    // REGISTER TEST BUYER TOKEN
    const buyerToken = await userRegister(
        'example10@email.com', 
        'example123', 
        'TestBuyer', 
        'Name').body.token;
      const decodedBuyer = jwt.verify(buyerToken, process.env.JWT_SECRET as string) as { userId: number };
      testBuyerId = decodedBuyer.userId;

    // console.log('PRE-TEST: Test Buyer has been created', testBuyerId);

    // REGISTER TEST SELLER TOKEN
    const sellerToken = await userRegister(
        'example20@email.com', 
        'example123', 
        'TestSeller', 
        'Name').body.token;
        const decodedSeller = jwt.verify(sellerToken, process.env.JWT_SECRET as string) as { userId: number };
        testSellerId = decodedSeller.userId

       // console.log('PRE-TEST: Test Seller has been created', testSellerId);

    // TEST BUYER DETAILS
      testBuyer = {
        id: testBuyerId,
        name: 'TestBuyer Name',
        streetName: 'TestStreetName',
        cityName: 'TestCityName',
        postalZone: '0000',
        cbcCode: 'AU'
    };

    // TEST SELLER DETAILS
      testSeller = {
        id: testSellerId,
        name: 'TestSeller Name',
        streetName: 'TestStreetName',
        cityName: 'TestCityName',
        postalZone: '0000',
        cbcCode: 'AU'
    };

    // TEST ITEM 1 DETAILS
    testItem1 = {
        id: 1,
        name: 'TestItem1',
        seller: testSeller,
        description: 'TestDescription1',
        price: 100
    };

    // TEST ITEM 2 DETAILS
    testItem2 = {
        id: 2,
        name: 'TestItem2',
        seller: testSeller,
        description: 'TestDescription2',
        price: 120
    };

    // TEST BILLING DETAILS
    testBillingDetails = {
        creditCardNumber: '1000000000000000',
        CVV: 111,
        expiryDate: date, // double check this
    };

    // TEST DELIVERY DETAILS
    testDeliveryDetails = {
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        countrySubentity: 'NSW',
        addressLine: '33 White St, Sydney NSW',
        cbcCode: 'AU',
        startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
        startTime: '13:00',
        endDate: new Date(2025, 9, 10).toISOString().split('T')[0],
        endTime: '13:00'
    };

    // TEST ORDER - VALID
    createTestParam = {
        items: [testItem1, testItem2],
        quantities: [1,2],
        buyer: testBuyer,
        billingDetails: testBillingDetails,
        delivery: testDeliveryDetails,
        totalPrice: 340, // ? not yet calculated
        createdAt: new Date(),
    }

    //console.log('PRE SETUP!')

})

//console.log('MIDDLE OF NOWHERE')

///////////////////////////////////////////////////////////////////////////



describe('SUCCESS CASES', () => {

    test('Tests orderCreate is successful', async () => {
        // Valid order create
        const CreateResponse = await orderCreatePutRequest(createTestParam);
        const orderId = CreateResponse.body.orderId;
        console.log('SUITE 1: order create body is:',CreateResponse.body);
        console.log('SUITE 1: order create orderId is:',orderId);

        // Expect success status code, correct body
        expect(CreateResponse.statusCode).toBe(201);
        expect(CreateResponse.body).toStrictEqual({ orderId: expect.any(Number) });
        console.log('CreateResponse is:', CreateResponse);
    })

    test('Tests orderChange is successful', async () => {
        // Valid order create
        const CreateResponse2 = await orderCreatePutRequest(createTestParam);
        const orderId2 = CreateResponse2.body.orderId;
        console.log('SUITE 2: First, order create orderId is:',orderId2);   

        // Valid order change input
        const changeTestParam = {
            userId: testBuyerId, orderId: orderId2,
            items: [
                {itemId: 1, 
                newQuantity: 3,
                name: 'TestItem1',
                seller: testSeller,
                description: 'TestDescription1',
                price: 100}
            ] 
        }
        
        // order change!
        const changeResponse = await orderChangePutRequest(`/v1/${testBuyerId}/order/${orderId2}/change`,changeTestParam);
        const orderId3 = changeResponse.body.orderId;
        // console.log('SUITE 2: Second, order change orderId is:',orderId3);   
        // console.log('SUITE 2: Second, order change return body:',changeResponse);   

        // Expect success status code, correct body
        expect(changeResponse.statusCode).toBe(200);
        expect(changeResponse.body).toStrictEqual({ orderId: expect.any(Number) });

        // console.log('changeResponse is:', changeResponse);
    })
})

describe.only('INVALID INPUT', () => {
    test('Tests for 401 error when orderId (Route) is invalid', async () => {
        const CreateResponse3 = await orderCreatePutRequest(createTestParam);
        const orderId3 = CreateResponse3.body.orderId;      

        /// Valid order change param
        const changeTestParam2 = {
            userId: testBuyerId, orderId: orderId3, 
            items: [
                {itemId: 1, 
                newQuantity: 3,
                name: 'TestItem1',
                seller: testSeller,
                description: 'TestDescription1',
                price: 100}
            ] 
        }  

        let url = `/v1/${testBuyerId}/order/${orderId3 + 1234}/change`;
        const changeResponse = await orderChangePutRequest(url,changeTestParam2);
        
        // Expect: 401 status code
        expect(changeResponse.statusCode).toBe(401);
        console.log('invalid route orderId', changeResponse);
    })

    test('Tests for 401 error when userId (Param) in invalid', async () => {
        const CreateResponse4 = await orderCreatePutRequest(createTestParam);
        const orderId4 = CreateResponse4.body.orderId;      
        
        /// Invalid order change param
        const changeTestParam3 = {
            userId: testBuyerId + 123, orderId: orderId4, 
            items: [
                {itemId: 1, 
                newQuantity: 3,
                name: 'TestItem1',
                seller: testSeller,
                description: 'TestDescription1',
                price: 100}
            ] 
        }  

        let url = `/v1/${testBuyerId + 123}/order/${orderId4}/change`;
        const changeResponse = await orderChangePutRequest(url,changeTestParam3);
        
        // Expect: 401 status code
        expect(changeResponse.statusCode).toBe(401);
        console.log('invalid route userId', changeResponse);
    })
})



//         // TEST TEMPLATE
// describe('INVALID INPUT', () => {

//     test('Tests for 401 error when userId is invalid', async () => {
       
//     })

//     test('Tests orderChange is successful', async () => {
        
//     })
// })


// describe.only('SUCCESS', () => {

//     let changeTestParam: { 
//         userId: UserSimple, 
//         orderId: number, 
//         updatedData: { items: Array<{ itemId: number, newQuantity: number, name: string, seller: UserSimple, description: string, price: number }> }
//     };
//     let orderId: number;

//     beforeAll(async () => {
//         // Valid order create
//         const CreateResponse = await orderCreatePutRequest(orderCreateTestParam);
//         orderId = CreateResponse.body.orderId;

//         // Expect success status code, correct body
//         expect(CreateResponse.statusCode).toBe(201);
//         expect(CreateResponse.body).toStrictEqual({ orderId: expect.any(Number) });
//         // console.log(CreateResponse);

//         // Successful order change
//         changeTestParam = {
//             userId: testBuyer, orderId: orderId, updatedData: {
//                 items: [
//                     {itemId: 1, 
//                     newQuantity: 3,
//                     name: 'TestItem1',
//                     seller: testSeller,
//                     description: 'TestDescription1',
//                     price: 100}
//                 ] 
//             }        
//         }    
//     });

//     test('Tests for correct successful return type', async () => {
//         const changeResponse = await orderChangePutRequest(changeTestParam);
        
//         // Expect success status code, correct body
//         expect(changeResponse.statusCode).toBe(201);
//         expect(changeResponse.body).toStrictEqual({ orderId: expect.any(Number) });

//         console.log(changeResponse);
//     })

//     test('', async () => {
        
//     })
// })





// describe('ERROR - INVALID INPUT', () => {
//     beforeAll(async () => {
//         // Valid Order Create
//         const CreateResponse = await orderCreatePutRequest(orderCreateTestParam);
//         const orderId = CreateResponse.body.orderId;

//         // Expect: success status code, correct body
//         expect(CreateResponse.statusCode).toBe(201);
//         expect(CreateResponse.body).toStrictEqual({ orderId: expect.any(Number) });
//         //console.log(CreateResponse);
//     });

//     test('Tests for Error 401, Invalid OrderId', async () => {
//         // Order change with invalid orderId
//         const changeTestInvalidOrderId = {
//             userId: testBuyer, orderId: 10001, updatedData: {
//                 items: [
//                     {itemId: 1, 
//                     newQuantity: 3,
//                     name: 'TestItem1',
//                     seller: testSeller,
//                     description: 'TestDescription1',
//                     price: 100}
//                 ] 
//             }        
//         }            

//         const changeResponse = await orderChangePutRequest(changeTestInvalidOrderId);
        
//         // Expect: 401 status code
//         expect(changeResponse.statusCode).toBe(401);
//         console.log(changeResponse);
//     })

//     test('Tests for Error 401, Invalid UserId', async () => {
//         const changeTestInvalidUserId = {
//             userId: 10001, orderId: orderId, updatedData: {
//                 items: [
//                     {itemId: 1, 
//                     newQuantity: 3,
//                     name: 'TestItem1',
//                     seller: testSeller,
//                     description: 'TestDescription1',
//                     price: 100}
//                 ] 
//             }        
//         }  
        
//         const changeResponse = await orderChangePutRequest(changeTestInvalidUserId);
        
//         // Expect 401 status code
//         expect(changeResponse.statusCode).toBe(401);
//         console.log(changeResponse);

//     })
// })
