import { OrderParam } from "./types";

const xml2js = require('xml2js');

/**
 * Helper function to produce UBL XML document for order creation/change.
 * @param {number} orderId - Unique identifier for an order.
 * @param {OrderParam} order - object containing all the order information.
 * @returns { string } UBL document - A string containing the UBL XML document.
 */
export function generateUBL(orderId: number, order: OrderParam) {
    const builder = new xml2js.Builder({
        headless: false,
        renderOpts: { 'pretty': true }
    });

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
                "cbc:CustomerAssignedAccountID": order.user.userId,
                "cac:Party": {
                    "cac:PartyName": { "cbc:Name": order.user.name },
                    "cac:PostalAddress": {
                        "cbc:StreetName": order.user.streetName,
                        "cbc:CityName": order.user.cityName,
                        "cbc:PostalZone": order.user.postalZone,
                        "cac:Country": { "cbc:IdentificationCode": order.user.cbcCode }
                    }
                }
            },
            "cac:SellerSupplierParty": {
                "cbc:CustomerAssignedAccountID": order.seller.userId,
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
                    "cbc:BuildingName": order.delivery.buildingName,
                    "cbc:BuildingNumber": order.delivery.buildingNumber,
                    "cbc:CityName": order.delivery.citName,
                    "cbc:PostalZone": order.delivery.postalZone,
                    "cbc:CountrySubentity": order.delivery.countrySubentity,
                    "cac:AddressLine": {
                        "cbc:Line": order.delivery.adressLine
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
            // "cac:OrderLine": orderData.items.map((item, index) => ({
            //     "cbc:Note": "This is an illustrative order line",
            //     "cac:LineItem": {
            //         "cbc:ID": index + 1,
            //         "cbc:Quantity": { _: item.quantity, $: { unitCode: item.unit } },
            //         "cbc:LineExtensionAmount": { _: item.amount, $: { currencyID: "GBP" } },
            //         "cac:Item": {
            //             "cbc:Description": item.description,
            //             "cbc:Name": item.name,
            //             "cac:BuyersItemIdentification": { "cbc:ID": item.buyerItemId },
            //             "cac:SellersItemIdentification": { "cbc:ID": item.sellerItemId }
            //         }
            //     }
            // }))
        }
    };

    return builder.buildObject(ublOrder);
}