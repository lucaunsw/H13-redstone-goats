import pool from "./db";
import { UserData, Item, Order, OrderItem } from "./types";

export async function getUser(userId: number): Promise<UserData | null> {
  const res = await pool.query("SELECT * FROM Users WHERE userId = $1", [userId]);
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function addUser(user: UserData): Promise<number> {
  const res = await pool.query(
    "INSERT INTO Users (nameFirst, nameLast, email, currPass, numSuccessulLogins, numFailedPasswordsSinceLastLogin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [user.nameFirst, user.nameLast, user.email, user.password, user.numSuccessfulLogins, user.numFailedPasswordsSinceLastLogin]
  );
  return res.rows[0].userid; // Returns the inserted user
}

export async function updateUser(user: UserData): Promise<boolean> {
  const res = await pool.query(
    "UPDATE Users SET nameFirst = $1, nameLast = $2, email = $3, currPass = $4, numSuccessulLogins = $5, numFailedPasswordsSinceLastLogin = $6 WHERE userId = $7 RETURNING *",
    [user.nameFirst, user.nameLast, user.email, user.password, user.numSuccessfulLogins, user.numFailedPasswordsSinceLastLogin, user.id]
  );
  return (res.rows.length > 0);
}

export async function deleteUser(userId: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM Users WHERE userId = $1 RETURNING *", [userId]);
  return (res.rows.length > 0);
}
