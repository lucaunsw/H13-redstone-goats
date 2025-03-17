CREATE TABLE DeliveryInstructions (
    id                SERIAL PRIMARY KEY,
    street_name       TEXT NOT NULL,
    city_name         TEXT NOT NULL,
    postal_zone       TEXT NOT NULL,
    country_subentity TEXT NOT NULL,
    address_line      TEXT NOT NULL,
    cbc_code          TEXT,
    start_date        DATE NOT NULL,
    start_time        TIME NOT NULL,
    end_date          DATE NOT NULL,
    end_time          TIME NOT NULL
);

CREATE TABLE Orders (
    id          SERIAL PRIMARY KEY,
    buyer_id    INTEGER NOT NULL REFERENCES Users(id),
    billing_id  INTEGER NOT NULL REFERENCES BillingDetails(id),
    delivery_id INTEGER NOT NULL REFERENCES DeliveryInstructions(id),
    last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP  NOT NULL,
    status      TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')), -- Enum-like constraint
    total_price DECIMAL(10,2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
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