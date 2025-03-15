import { Order } from "./types";
import { getUser } from './dataStore'

const xml2js = require('xml2js');

/**
 * Helper function to produce UBL XML document for order creation/change.
 * @param {number} orderId - Unique identifier for an order.
 * @param {Order} order - object containing all the order information.
 * @returns { string } UBL document - A string containing the UBL XML document.
 */
export function generateUBL(orderId: number, order: Order) {
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
                    "cac:PartyName": { "cbc:Name": order.buyer.nameFirst + " " + order.buyer.nameLast },
                    "cac:PostalAddress": {
                        "cbc:StreetName": order.buyer.streetName,
                        "cbc:CityName": order.buyer.cityName,
                        "cbc:PostalZone": order.buyer.postalZone,
                        "cac:Country": { "cbc:IdentificationCode": order.buyer.cbcCode }
                    }
                }
            },
            "cac:SellerSupplierParty": {
                "cbc:CustomerAssignedAccountID": order.seller.id,
                "cac:Party": {
                    "cac:PartyName": { "cbc:Name": order.seller.name },
                    "cac:PostalAddress": {
                        "cbc:StreetName": order.seller.streetName,
                        "cbc:CityName": order.seller.cityName,
                        "cbc:PostalZone": order.seller.postalZone,
                        "cac:Country": { "cbc:IdentificationCode": order.seller.cbcCode }
                    }
                }
            },
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
  if (user === null || `${user.nameFirst} ${user.nameLast}` !== name) {
    return false
  }
  return true;
}