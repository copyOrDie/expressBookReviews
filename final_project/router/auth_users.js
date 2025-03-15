const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Filter the users array for any user with the same name
let sameNameUsers = users.filter((user)=>{
    user.username === username;
});
return sameNameUsers.length == 0;
}

const authenticatedUser = (username, password)=>{ //returns boolean
//Filter the users array for any user with the same user and password
let validuser = users.filter((user) =>{
    return (user.username === username && user.password === password);
});
return validuser.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password){
    return res.status(404).json({message: "Error loggin in"});
  }
  // Authenticate user
  if (authenticatedUser(username, password)){
    //generate JWT access token
    let accessToken = jwt.sign({data: password}, "access",{expiresIn: 60 * 60});
    // Store access token and user name in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).json({message: "user successfully logged in"});
  } else {
    return res.status(208).json({message: "invalid Login. Check username and password"});
  }
 
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization?.username; // Get username from session

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {}; // Initialize reviews if it doesn't exist
    }

    books[isbn].reviews[username] = review; // Add or update review

    return res.status(200).json({ message: "Review added or updated", review: books[isbn].reviews[username] });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Delete the review
        return res.status(200).json({ message: "Review deleted" });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
