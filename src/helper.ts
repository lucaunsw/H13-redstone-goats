import { Order, UserSimple } from "./types";
import { getUser, addItem,
  getItem } from './dataStore'

const xml2js = require('xml2js');

/**
 * Helper function to produce UBL XML document for order creation/change.
 * @param {number} orderId - Unique identifier for an order.
 * @param {Order} order - object containing all the order information.
 * @returns { string } UBL document - A string containing the UBL XML document.
 */
export function generateUBL(orderId: number, order: Order) {
  // Create a map to keep track of unique sellers.
  const uniqueSellers = new Map<number, UserSimple>();
  // Add unique sellers into the map.
  for (const item of order.items) {
    if (item.seller.id && !uniqueSellers.has(item.seller.id)) {
      uniqueSellers.set(item.seller.id, item.seller);
    }
  }

  const builder = new xml2js.Builder({
      headless: false,
      renderOpts: { 'pretty': true }
  });
  let total = 0;
  for (const item of order.items) {
    total += item.price;
  }
  const ublOrder = {
      Order: {
          $: {
            xmlns: "urn:oasis:names:specification:ubl:schema:xsd:Order-2",
            "xmlns:cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
            "xmlns:cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
          },
          "cbc:UBLVersionID": "2.0",
          "cbc:CustomizationID": "urn:oasis:names:specification:ubl:xpath:Order-2.0:sbs-1.0-draft",
          "cbc:ID": orderId,
          "cbc:IssueDate": order.lastEdited,
          "cac:BuyerCustomerParty": {
            "cbc:CustomerAssignedAccountID": order.buyer.id,
            "cac:Party": {
              "cac:PartyName": { "cbc:Name": order.buyer.name },
              "cac:PostalAddress": {
                "cbc:StreetName": order.buyer.streetName,
                "cbc:CityName": order.buyer.cityName,
                "cbc:PostalZone": order.buyer.postalZone,
                "cac:Country": { "cbc:IdentificationCode": order.buyer.cbcCode }
              }
            }
          },
          "cac:SellerSupplierParty": 
            Array.from(uniqueSellers.values()).map(seller => ({
              "cbc:CustomerAssignedAccountID": seller.id,
              "cac:Party": {
                "cac:PartyName": { "cbc:Name": seller.name },
                "cac:PostalAddress": {
                  "cbc:StreetName": seller.streetName,
                  "cbc:CityName": seller.cityName,
                  "cbc:PostalZone": seller.postalZone,
                  "cac:Country": { "cbc:IdentificationCode": seller.cbcCode }
                }
              },
            })),
          "cac:Delivery": {
            "cac:DeliveryAddress": {
              "cbc:StreetName": order.delivery.streetName,
              "cbc:CityName": order.delivery.cityName,
              "cbc:PostalZone": order.delivery.postalZone,
              "cbc:CountrySubentity": order.delivery.countrySubentity,
              "cac:AddressLine": {
                "cbc:Line": order.delivery.addressLine
              },
              "cac:Country": {
                "cbc:IdentificationCode": order.delivery.cbcCode
              }
            },
            "cac:RequestedDeliveryPeriod": {
              "cbc:StartDate": order.delivery.startDate,
              "cbc:StartTime": order.delivery.startTime,
              "cbc:EndDate": order.delivery.endDate,
              "cbc:EndTime": order.delivery.endTime,
            }
          },
          "cac:Item": order.items.map(item => ({
            "cbc:Description": item.description,
            "cbc:Name": item.name,
          })),
          "cac:AnticipatedMonetaryTotal": {
            "cbc:PayableAmount": total,
          },
      }
  };
  return builder.buildObject(ublOrder);
}

/**
 * Helper function to check if a user exists.
 * @param {number} userId - Unique identifier for a user.
 * @returns { boolean } - True if the user exists false else.
 */
export async function userExists(userId: number, name: string) {
  const user = await getUser(userId);
  if (!user || `${user.nameFirst} ${user.nameLast}` !== name) {
    return false
  }
  return true;
}

/**
 * Helper function to check if the order contains a valid item list and 
 * calculates the total price if so.
 * @param {Order} order - object containg all the order information.
 * @returns { number } totalPrice - Total price of the order if the item list is
 * valid.
 */
export async function validItemList(order: Order) {
  let totalPrice = 0;
  const itemIds = new Set<number>();
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    // Check if each item Id is provided/valid.
    if (!item.id) {
      throw new Error ('No item Id provided');
    } else if (itemIds.has(item.id)) {
      throw new Error ('Same item Id is registered to a different item name');
    } else if (!item.seller.id) {
      throw new Error ('No seller Id provided');
    }
    const seller = await userExists(item.seller.id, item.seller.name);
    if (!seller) {
      throw new Error 
    ('Invalid sellerId or a different name is registered to sellerId');
    }
    const orderItem = await getItem(item.id);
    if (orderItem && orderItem.name !== item.name) {
      throw new Error ('Same item Id is registered to a different item name');
    }
    if (!userExists(item.seller.id, item.seller.name)) {
      throw new Error ('Invalid seller details');
    }

    // Check if item price is valid and correct amount of quantities are provided.
    if (item.price < 0) {
      throw new Error ('Invalid item price');
    } else if (order.quantities[i] <= 0) {
      throw new Error ('Invalid quantities provided');
    } else {
      itemIds.add(item.id);
      totalPrice += item.price * order.quantities[i];
    }
  }
  // Return total order price.
  return totalPrice;
}

/**
 * Helper function to add all order items to the datastore.
 * @param {Order} order - object containg all the order information.
 * @returns nothing.
 */
export async function addItems(order: Order) {
  // Add each order Item to the datastore.
  for (const item of order.items) {
    if (item.id) {
      const itemId = await getItem(item.id);
      if (itemId == null) {
        await addItem(item);
      }
    }
  }
  return;
}