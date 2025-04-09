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
exports.generateUBL = generateUBL;
exports.userExists = userExists;
exports.validItemList = validItemList;
exports.validSellers = validSellers;
exports.addItems = addItems;
exports.generatePDF = generatePDF;
const dataStore_1 = require("./dataStore");
const xml2js = require('xml2js');
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const { createCanvas } = require("canvas");
const { Chart, registerables } = require("chart.js");
Chart.register(...registerables);
/**
 * Helper function to produce UBL XML document for order creation/change.
 * @param {number} orderId - Unique identifier for an order.
 * @param {Order} order - object containing all the order information.
 * @returns { string } UBL document - A string containing the UBL XML document.
 */
function generateUBL(orderId, order) {
    // Create a map to keep track of unique sellers.
    const uniqueSellers = new Map();
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
            "cac:SellerSupplierParty": Array.from(uniqueSellers.values()).map(seller => ({
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
function userExists(userId, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, dataStore_1.getUser)(userId);
        if (!user || `${user.nameFirst} ${user.nameLast}` !== name) {
            return false;
        }
        return true;
    });
}
/**
 * Helper function to check if the order contains a valid item list and
 * calculates the total price if so.
 * @param {Order} order - object containg all the order information.
 * @returns { number } totalPrice - Total price of the order if the item list is
 * valid.
 */
function validItemList(order) {
    return __awaiter(this, void 0, void 0, function* () {
        let totalPrice = 0;
        const itemIds = new Set();
        for (let i = 0; i < order.items.length; i++) {
            const item = order.items[i];
            // Check if each item Id is provided/valid.
            if (!item.id) {
                throw new Error('No item Id provided');
            }
            else if (itemIds.has(item.id)) {
                throw new Error('Same item Id is registered to a different item name');
            }
            const orderItem = yield (0, dataStore_1.getItem)(item.id);
            if (orderItem && orderItem.name !== item.name) {
                throw new Error('Same item Id is registered to a different item name');
            }
            // Check if item price is valid and correct amount of quantities are provided.
            if (item.price < 0) {
                throw new Error('Invalid item price');
            }
            else if (order.quantities[i] <= 0) {
                throw new Error('Invalid quantities provided');
            }
            else {
                itemIds.add(item.id);
                totalPrice += item.price * order.quantities[i];
            }
        }
        // Return total order price.
        return totalPrice;
    });
}
/**
 * Helper function to check if all sellers in an order are valid.
 * @param {Order} order - object containg all the order information.
 * @returns { boolean } - True if all the sellers are valid, false else.
 */
function validSellers(order) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < order.items.length; i++) {
            const item = order.items[i];
            if (!item.seller.id) {
                throw new Error('No seller Id provided');
            }
            const seller = yield userExists(item.seller.id, item.seller.name);
            if (!seller) {
                throw new Error('Invalid sellerId or a different name is registered to sellerId');
            }
        }
        return true;
    });
}
/**
 * Helper function to add all order items to the datastore.
 * @param {Order} order - object containg all the order information.
 * @returns nothing.
 */
function addItems(order) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add each order Item to the datastore.
        for (const item of order.items) {
            if (item.id) {
                const itemId = yield (0, dataStore_1.getItem)(item.id);
                if (itemId == null) {
                    yield (0, dataStore_1.addItem)(item);
                }
            }
        }
        return;
    });
}
/**
 * Helper function to generate PDF containg user sales.
 * @param {ItemSales} sales - object containg all the sales of a user.
 * @param {number} sellerId - unique identifier for a user.
 * @param {string} PDFdirPath - directory path to the pdf file.
 * @returns nothing.
 */
function generatePDF(sales, sellerId, PDFdirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the new PDF document
        const doc = new pdfkit_1.default();
        // Create the path to the csv file
        const filePath = path_1.default.join(PDFdirPath, `sales_${sellerId}.pdf`);
        const writeStream = fs_1.default.createWriteStream(filePath);
        doc.pipe(writeStream);
        // Extract sales information for piechart.
        const labels = sales.map((item) => item.name);
        const amountSoldValues = sales.map((item) => item.amountSold);
        // Calculate total revenue for each item.
        const revenueValues = sales.map((item) => item.price * item.amountSold);
        // Create first pie chart.
        const canvas1 = createCanvas(400, 400);
        const chart1 = canvas1.getContext("2d");
        new Chart(chart1, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [
                    {
                        data: amountSoldValues,
                        backgroundColor: ["red", "blue", "green", "orange", "purple"],
                    },
                ],
            },
        });
        const chart1Image = canvas1.toBuffer("image/png");
        // Create second pie chart.
        const canvas2 = createCanvas(400, 400);
        const chart2 = canvas2.getContext("2d");
        new Chart(chart2, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [
                    {
                        data: revenueValues,
                        backgroundColor: ["red", "blue", "green", "orange", "purple"],
                    },
                ],
            },
        });
        const chart2Image = canvas2.toBuffer("image/png");
        // Add title
        const robotoFontPath = path_1.default.join(__dirname, 'resources', 'fonts', 'Roboto-VariableFont_wdth,wght.ttf');
        doc.font(robotoFontPath);
        doc.fontSize(20).text("Sales Report", { align: "center" });
        doc.moveDown(5);
        // Add Pie Charts to PDF
        doc.fontSize(16)
            .text("Amount Sold by Item", 70, doc.y)
            .text("Total Revenue by Item", 350, doc.y);
        doc.image(chart1Image, 70, doc.y, { fit: [200, 200] });
        doc.image(chart2Image, 350, doc.y, { fit: [200, 200] });
        doc.addPage();
        // Add sales data to pdf.
        for (const item of sales) {
            doc.fontSize(14).text(`ID: ${item.id}`);
            doc.text(`Name: ${item.name}`);
            doc.text(`Description: ${item.description}`);
            doc.text(`Price: $${item.price}`);
            doc.text(`Amount Sold: ${item.amountSold}`);
            doc.moveDown();
        }
        doc.end();
        return;
    });
}
