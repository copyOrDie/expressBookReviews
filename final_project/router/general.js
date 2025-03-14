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
public_users.get('/',function (req, res) {
  // Send JSON response with books formatted data
  return res.status(300).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(300).send(JSON.stringify(books[isbn],null,4));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const filteredBooks = filterBooks(books,'author', author);
  return res.status(300).send(JSON.stringify(filteredBooks, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.replace('_',' ');
    const filteredBooks = filterBooks(books,'title', title);
    return res.status(300).send(JSON.stringify(filteredBooks, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const reviews = books[isbn].reviews;
  return res.status(300).send(JSON.stringify({[isbn]: {"reviews": reviews}},null,4));
});

module.exports.general = public_users;
