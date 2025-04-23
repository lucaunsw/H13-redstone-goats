import { renderXML } from '../app';
import dotenv from 'dotenv';
import { server } from '../server';
import { getLatestOrderXMLV1  } from '../dataStoreV1';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStoreV1', () => ({
    getLatestOrderXMLV1: jest.fn(),
}));
  
jest.mock('@redis/client', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  })),
}));

describe('Test orderCreate route', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from invalid orderId entered', async () => {
    (getLatestOrderXMLV1 as jest.Mock).mockResolvedValueOnce(null);
    await expect(renderXML(1)).rejects.toThrowError('Invalid orderId entered');
  });

  test('Successfully returns xml string for an order', async () => {
    (getLatestOrderXMLV1 as jest.Mock).mockResolvedValueOnce(
      "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Order xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:Order-2\" xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\" xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\">\n  <cbc:UBLVersionID>2.0</cbc:UBLVersionID>\n  <cbc:CustomizationID>urn:oasis:names:specification:ubl:xpath:Order-2.0:sbs-1.0-draft</cbc:CustomizationID>\n  <cbc:ID>73</cbc:ID>\n  <cbc:IssueDate>2025-04-23</cbc:IssueDate>\n  <cac:BuyerCustomerParty>\n    <cbc:CustomerAssignedAccountID>79</cbc:CustomerAssignedAccountID>\n    <cac:Party>\n      <cac:PartyName>\n        <cbc:Name>Test User</cbc:Name>\n      </cac:PartyName>\n      <cac:PostalAddress>\n        <cbc:StreetName>Yellow St</cbc:StreetName>\n        <cbc:CityName>Brisbane</cbc:CityName>\n        <cbc:PostalZone>4000</cbc:PostalZone>\n        <cac:Country>\n          <cbc:IdentificationCode>AU</cbc:IdentificationCode>\n        </cac:Country>\n      </cac:PostalAddress>\n    </cac:Party>\n  </cac:BuyerCustomerParty>\n  <cac:SellerSupplierParty>\n    <cbc:CustomerAssignedAccountID>78</cbc:CustomerAssignedAccountID>\n    <cac:Party>\n      <cac:PartyName>\n        <cbc:Name>Test User</cbc:Name>\n      </cac:PartyName>\n      <cac:PostalAddress>\n        <cbc:StreetName>Yellow St</cbc:StreetName>\n        <cbc:CityName>Brisbane</cbc:CityName>\n        <cbc:PostalZone>4000</cbc:PostalZone>\n        <cac:Country>\n          <cbc:IdentificationCode>AU</cbc:IdentificationCode>\n        </cac:Country>\n      </cac:PostalAddress>\n    </cac:Party>\n  </cac:SellerSupplierParty>\n  <cac:Delivery>\n    <cac:DeliveryAddress>\n      <cbc:StreetName>White St</cbc:StreetName>\n      <cbc:CityName>Sydney</cbc:CityName>\n      <cbc:PostalZone>2000</cbc:PostalZone>\n      <cbc:CountrySubentity>NSW</cbc:CountrySubentity>\n      <cac:AddressLine>\n        <cbc:Line>33 White St, Sydney NSW</cbc:Line>\n      </cac:AddressLine>\n      <cac:Country>\n        <cbc:IdentificationCode>AU</cbc:IdentificationCode>\n      </cac:Country>\n    </cac:DeliveryAddress>\n    <cac:RequestedDeliveryPeriod>\n      <cbc:StartDate>2025-07-04</cbc:StartDate>\n      <cbc:StartTime>13:00</cbc:StartTime>\n      <cbc:EndDate>2025-08-04</cbc:EndDate>\n      <cbc:EndTime>13:00</cbc:EndTime>\n    </cac:RequestedDeliveryPeriod>\n  </cac:Delivery>\n  <cac:Item>\n    <cbc:Description>This is a table</cbc:Description>\n    <cbc:Name>table</cbc:Name>\n  </cac:Item>\n  <cac:Item>\n    <cbc:Description>This is soap</cbc:Description>\n    <cbc:Name>soap</cbc:Name>\n  </cac:Item>\n  <cac:TaxAmount>\n    <cbc:Tax>50</cbc:Tax>\n    <cbc:TotalTaxAmount>12.5</cbc:TotalTaxAmount>\n  </cac:TaxAmount>\n  <cac:AnticipatedMonetaryTotal>\n    <cbc:PayableAmount>25</cbc:PayableAmount>\n    <cbc:TotalAfterTax>37.5</cbc:TotalAfterTax>\n  </cac:AnticipatedMonetaryTotal>\n</Order>"
    );
    const response = await renderXML(1);
    expect(response).toStrictEqual(
      {
        xmlDocument: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Order xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:Order-2\" xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\" xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\">\n  <cbc:UBLVersionID>2.0</cbc:UBLVersionID>\n  <cbc:CustomizationID>urn:oasis:names:specification:ubl:xpath:Order-2.0:sbs-1.0-draft</cbc:CustomizationID>\n  <cbc:ID>73</cbc:ID>\n  <cbc:IssueDate>2025-04-23</cbc:IssueDate>\n  <cac:BuyerCustomerParty>\n    <cbc:CustomerAssignedAccountID>79</cbc:CustomerAssignedAccountID>\n    <cac:Party>\n      <cac:PartyName>\n        <cbc:Name>Test User</cbc:Name>\n      </cac:PartyName>\n      <cac:PostalAddress>\n        <cbc:StreetName>Yellow St</cbc:StreetName>\n        <cbc:CityName>Brisbane</cbc:CityName>\n        <cbc:PostalZone>4000</cbc:PostalZone>\n        <cac:Country>\n          <cbc:IdentificationCode>AU</cbc:IdentificationCode>\n        </cac:Country>\n      </cac:PostalAddress>\n    </cac:Party>\n  </cac:BuyerCustomerParty>\n  <cac:SellerSupplierParty>\n    <cbc:CustomerAssignedAccountID>78</cbc:CustomerAssignedAccountID>\n    <cac:Party>\n      <cac:PartyName>\n        <cbc:Name>Test User</cbc:Name>\n      </cac:PartyName>\n      <cac:PostalAddress>\n        <cbc:StreetName>Yellow St</cbc:StreetName>\n        <cbc:CityName>Brisbane</cbc:CityName>\n        <cbc:PostalZone>4000</cbc:PostalZone>\n        <cac:Country>\n          <cbc:IdentificationCode>AU</cbc:IdentificationCode>\n        </cac:Country>\n      </cac:PostalAddress>\n    </cac:Party>\n  </cac:SellerSupplierParty>\n  <cac:Delivery>\n    <cac:DeliveryAddress>\n      <cbc:StreetName>White St</cbc:StreetName>\n      <cbc:CityName>Sydney</cbc:CityName>\n      <cbc:PostalZone>2000</cbc:PostalZone>\n      <cbc:CountrySubentity>NSW</cbc:CountrySubentity>\n      <cac:AddressLine>\n        <cbc:Line>33 White St, Sydney NSW</cbc:Line>\n      </cac:AddressLine>\n      <cac:Country>\n        <cbc:IdentificationCode>AU</cbc:IdentificationCode>\n      </cac:Country>\n    </cac:DeliveryAddress>\n    <cac:RequestedDeliveryPeriod>\n      <cbc:StartDate>2025-07-04</cbc:StartDate>\n      <cbc:StartTime>13:00</cbc:StartTime>\n      <cbc:EndDate>2025-08-04</cbc:EndDate>\n      <cbc:EndTime>13:00</cbc:EndTime>\n    </cac:RequestedDeliveryPeriod>\n  </cac:Delivery>\n  <cac:Item>\n    <cbc:Description>This is a table</cbc:Description>\n    <cbc:Name>table</cbc:Name>\n  </cac:Item>\n  <cac:Item>\n    <cbc:Description>This is soap</cbc:Description>\n    <cbc:Name>soap</cbc:Name>\n  </cac:Item>\n  <cac:TaxAmount>\n    <cbc:Tax>50</cbc:Tax>\n    <cbc:TotalTaxAmount>12.5</cbc:TotalTaxAmount>\n  </cac:TaxAmount>\n  <cac:AnticipatedMonetaryTotal>\n    <cbc:PayableAmount>25</cbc:PayableAmount>\n    <cbc:TotalAfterTax>37.5</cbc:TotalAfterTax>\n  </cac:AnticipatedMonetaryTotal>\n</Order>"
      }
    );
    
  });

});