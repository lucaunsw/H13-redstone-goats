-- Create full schema:
----------------------
CREATE TABLE Users (
    id          SERIAL PRIMARY KEY,
    name_first  TEXT NOT NULL,
    name_last   TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL, -- Will be hashed
    street_name TEXT,
    city_name   TEXT,
    postal_zone TEXT,
    cbc_code    TEXT,
    num_successful_logins INTEGER DEFAULT 0 NOT NULL CHECK (num_successful_logins >= 0),
    num_failed_passwords_since_last_login INTEGER DEFAULT 0 NOT NULL CHECK (num_failed_passwords_since_last_login >= 0)
);

CREATE TABLE Tokens (
    token   TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id)
);

CREATE TABLE Items (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    seller_id   INTEGER NOT NULL REFERENCES Users(id),
    description TEXT,
    price       DECIMAL(10,2) NOT NULL -- Precision for currency
);

CREATE TABLE BillingDetails (
    id             SERIAL PRIMARY KEY,
    credit_card_no TEXT NOT NULL,
    cvv            INTEGER NOT NULL CHECK (cvv BETWEEN 100 AND 999), -- Ensures a valid CVV
    expiry_date    TEXT NOT NULL
);

CREATE TABLE DeliveryInstructions (
    id                SERIAL PRIMARY KEY,
    street_name       TEXT NOT NULL,
    city_name         TEXT NOT NULL,
    postal_zone       TEXT NOT NULL,
    country_subentity TEXT NOT NULL,
    address_line      TEXT NOT NULL,
    cbc_code          TEXT,
    start_date        TEXT NOT NULL,
    start_time        TEXT NOT NULL,
    end_date          TEXT NOT NULL,
    end_time          TEXT NOT NULL
);

CREATE TABLE Orders (
    id           SERIAL PRIMARY KEY,
    buyer_id     INTEGER NOT NULL REFERENCES Users(id),
    billing_id   INTEGER NOT NULL REFERENCES BillingDetails(id),
    delivery_id  INTEGER NOT NULL REFERENCES DeliveryInstructions(id),
    last_edited  TEXT NOT NULL,
    status       TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')), -- Enum-like constraint
    total_price  DECIMAL(10,2) NOT NULL,
    tax_amount   DECIMAL(10,2),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_xml_id INTEGER
);

CREATE TABLE OrderItems (
    order_id INTEGER REFERENCES Orders(id),
    item_id  INTEGER REFERENCES Items(id),
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, item_id)
);

CREATE TABLE OrderXMLs (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER REFERENCES Orders(id),
    xml_content TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Drop full schema:
--------------------
DROP TABLE OrderItems;
DROP TABLE Items;
DROP TABLE OrderXMLs;
DROP TABLE Orders;
DROP TABLE BillingDetails;
DROP TABLE DeliveryInstructions;
DROP TABLE Tokens;
DROP TABLE Users;

-- Clear all data:
------------------
DELETE FROM OrderItems;
DELETE FROM Items;
DELETE FROM OrderXMLs;
DELETE FROM Orders;
DELETE FROM BillingDetails;
DELETE FROM DeliveryInstructions;
DELETE FROM Tokens;
DELETE FROM Users;