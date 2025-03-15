const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Function for filtering books by property
function filterBooks(books, property, paramValue) {
    const filteredBooks = {};
    for (const key in books) {
        if (books.hasOwnProperty(key)) {
            if (books[key][property] === paramValue) {
                filteredBooks[key] = books[key];
            }
        }
    }
    return filteredBooks;
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  //check if values are provided
  if (username && password){
    if(isValid(username)){
        // Add the user to the users array
        users.push({username, password});
        return res.status(200).json({message: "User successfully registered. Now you can login."});
    } else {
        return res.status(404).json({message: "User Already exists!"});
    }
  }
  // if user or password is missing
  return res.status(404).json({message: "Unable to register User."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Since booksdb.js is a local file, we can directly access the 'books' object.
        // To simulate an async operation, we'll wrap it in a Promise.
        const booksData = await new Promise((resolve) => {
            resolve(books);
        });

        // Send JSON response with books formatted data
        return res.status(200).send(JSON.stringify(booksData, null, 4));

    } catch (error) {
        console.error("Error fetching books:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        // Simulate an asynchronous operation (wrapping the book access in a Promise)
        const bookData = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });

        return res.status(200).send(JSON.stringify(bookData, null, 4)); // 200 instead of 300

    } catch (error) {
        if (error === "Book not found") {
            return res.status(404).send("Book not found");
        }
        console.error("Error fetching book:", error);
        return res.status(500).send("Internal Server Error");
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        // Simulate an asynchronous operation (wrapping the filterBooks function in a Promise)
        const filteredBooks = await new Promise((resolve) => {
            resolve(filterBooks(books, 'author', author));
        });

        return res.status(200).send(JSON.stringify(filteredBooks, null, 4)); // 200 instead of 300

    } catch (error) {
        console.error("Error fetching books by author:", error);
        return res.status(500).send("Internal Server Error");
    }
});


// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try {
        const title = req.params.title.replace('_',' ');
    // Simulate an asynchronous operation (wrapping the filterBooks function in a Promise)
    const filteredBooks = await new Promise((resolve) =>{
        resolve(filterBooks(books,'title', title));
    });
    return res.status(300).send(JSON.stringify(filteredBooks, null, 4));
    } catch (error) {
    console.error("Error fetching books by title:", error);
        return res.status(500).send("Internal Server Error");
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const reviews = books[isbn].reviews;
  return res.status(300).send(JSON.stringify({[isbn]: {"reviews": reviews}},null,4));
});

module.exports.general = public_users;
