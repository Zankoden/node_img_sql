import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function getBooks() {
    try {
        const [rows] = await pool.query("SELECT * FROM books");
        return rows;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw new Error("Failed to fetch books");
    }
}

export async function getBookById(id) {
    try {
        const [rows] = await pool.query("SELECT * FROM books WHERE book_id = ?", [id]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error(`Book with ID ${id} not found`);
        }
    } catch (error) {
        console.error(`Error fetching book with ID ${id}:`, error);
        throw new Error(`Failed to fetch book with ID ${id}`);
    }
}

export async function createBookWithImage(book_name, book_description, genre, book_image) {
    try {
        const [resultCreate] = await pool.query(`
            INSERT INTO books (book_name, book_description, genre, book_image)
            VALUES (?, ?, ?, ?)
        `, [book_name, book_description, genre, book_image]);

        const id = resultCreate.insertId;
        return getBookById(id);
    } catch (error) {
        console.error("Error creating book with image:", error);
        throw new Error("Failed to create book with image");
    }
}

export async function updateBookById(book_id, book_name, book_description, genre, book_image) {
    try {
        const query = `
            UPDATE books
            SET 
                book_name = COALESCE(?, book_name), 
                book_description = COALESCE(?, book_description), 
                genre = COALESCE(?, genre),
                book_image = COALESCE(?, book_image)
            WHERE book_id = ?
        `;

        const [resultUpdate] = await pool.query(query, [book_name, book_description, genre, book_image, book_id]);

        if (resultUpdate.affectedRows > 0) {
            return { message: `Book with ID ${book_id} updated successfully` };
        } else {
            throw new Error(`Book with ID ${book_id} not found`);
        }
    } catch (error) {
        console.error(`Error updating book with ID ${book_id}:`, error);
        throw new Error(`Failed to update book with ID ${book_id}`);
    }
}

export async function deleteBookById(id) {
    try {
        const resultDelete = await pool.query("DELETE FROM books WHERE book_id = ?", [id]);
        return resultDelete[0];
    } catch (error) {
        console.error(`Error deleting book with ID ${id}:`, error);
        throw new Error(`Failed to delete book with ID ${id}`);
    }
}
