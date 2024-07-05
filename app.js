import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { createBookWithImage, updateBookById, deleteBookById, getBooks, getBookById } from "./database.js";

// Define __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'book_images'); // Directory to save the images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique name
    }
});

const upload = multer({ storage: storage });

app.get("/books", async (req, res) => {
    try {
        const books = await getBooks();
        res.status(200).send(books);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving books");
    }
});

app.get("/books/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const bookByID = await getBookById(id);
        if (!bookByID) {
            return res.status(404).send(`Book with ID ${id} not found`);
        }
        res.status(200).send(bookByID);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Error retrieving book with ID ${id}`);
    }
});

app.post("/createBookWithImage", upload.single('book_image'), async (req, res) => {
    const { book_name, book_description, genre } = req.body;
    const book_image = req.file ? `/book_images/${req.file.filename}` : null;

    if (!book_name || !book_description || !genre || !book_image) {
        return res.status(400).send("All fields (book_name, book_description, genre, book_image) are required");
    }

    try {
        const book = await createBookWithImage(book_name, book_description, genre, book_image);
        res.status(201).send(book);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating book with image");
    }
});

app.put("/updateBookById/:book_id", upload.single('book_image'), async (req, res) => {
    const book_id = req.params.book_id;
    const { book_name, book_description, genre } = req.body;
    const book_image = req.file ? `/book_images/${req.file.filename}` : null;

    if (!book_name && !book_description && !genre && !book_image) {
        return res.status(400).send("No fields provided to update");
    }

    try {
        const result = await updateBookById(book_id, book_name, book_description, genre, book_image);
        res.status(200).send(result);
    } catch (error) {
        if (error.message.includes("not found")) {
            res.status(404).send(`Book with ID ${book_id} not found`);
        } else {
            console.error(`Error updating book with ID ${book_id}:`, error);
            res.status(500).send(`Error updating book with ID ${book_id}`);
        }
    }
});

app.delete("/deleteBookById/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const deleteBook = await deleteBookById(id);
        if (!deleteBook.affectedRows) {
            return res.status(404).send(`Book with ID ${id} not found`);
        }
        res.status(200).send(`Book with ID ${id} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting book with ID ${id}:`, error);
        res.status(500).send(`Error deleting book with ID ${id}`);
    }
});

app.use('/book_images', express.static(path.join(__dirname, 'book_images')));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! 💩');
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
