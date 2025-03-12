import { orderChange } from '../app.ts';
import { OrderItem, OrderChangeResponse } from '../types';

// Mock Data
const orderId = 1
const orderItems: OrderItem[] = [
    {orderId: 1, itemId: 1, quantity: 5},
    {orderId: 1, itemId: 5, quantity: 2},
    {orderId: 9, itemId: 1, quantity: 5} //non existent orderId
]

describe('OrderId is valid', () => {
    test('error returned for invalid orderId', () => {
        const response: OrderChangeResponse = orderChange(invalidOrderId, orderItems);
        expect(response.error).toBeDefined();
        expect(response.success).toBe(false);
    });
  
    test('success returned for valid orderId', () => {
        const response: OrderChangeResponse = orderChange(validOrderId, orderItems);
        expect(response.error).toBeUndefined();
        expect(response.success).toBe(true);
    });
});

describe('Order item updates', () => {
    test('quantity updates correctly for existing order item', () => {
        const response: OrderChangeResponse = orderChange(validOrderId, [
            { orderId: validOrderId, itemId: 1, quantity: 10 }
        ]);
        expect(response.success).toBe(true);
        expect(response.updatedItems).toContainEqual({ orderId: validOrderId, itemId: 1, quantity: 10 });
    });

    test('error returned when updating non-existent item', () => {
        const response: OrderChangeResponse = orderChange(validOrderId, [
            { orderId: validOrderId, itemId: 99, quantity: 3 } // itemId 99 does not exist
        ]);
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
    });

    test('order update fails when quantity is negative', () => {
        const response: OrderChangeResponse = orderChange(validOrderId, [
            { orderId: validOrderId, itemId: 1, quantity: -5 }
        ]);
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
    });
});