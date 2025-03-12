CREATE TABLE Users (
    userId    SERIAL PRIMARY KEY,
    nameFirst VARCHAR(255) NOT NULL,
    nameLast  VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL,
    currPass  VARCHAR(255) NOT NULL,
    prevPass  VARCHAR(255),
    numSuccessulLogins INTEGER CHECK (numSuccessulLogins >= 0),
    numFailedPasswordsSinceLastLogin INTEGER CHECK (numFailedPasswordsSinceLastLogin >= 0)
  );

CREATE TABLE Items (
    itemId SERIAL PRIMARY KEY,
    name   VARCHAR(255) NOT NULL,
    price  NUMERIC(10,2) NOT NULL
);

CREATE TABLE Orders (
    orderId    SERIAL PRIMARY KEY,
    userId     INTEGER REFERENCES users(userId) ON DELETE CASCADE,
    totalPrice NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE OrderItems (
    orderId  INTEGER REFERENCES Orders(orderId) ON DELETE CASCADE,
    itemId   INTEGER REFERENCES Items(itemId) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (orderId, itemId)
);

CREATE TABLE Sessions (
    sessionId INTEGER PRIMARY KEY,
    userId    INTEGER REFERENCES Users(userId) ON DELETE CASCADE
);