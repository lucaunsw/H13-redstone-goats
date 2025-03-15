CREATE TABLE OrderXMLs (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER REFERENCES Orders(id),
    xml_content TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);