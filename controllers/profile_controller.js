/*  Profile controller */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { matchedData, validationResult } = require("express-validator");
const { User, Book } = require('../models');


// Show the authenticated user
const getProfile = async (req, res) => {

	// Retrieve authenticated user's profile
	let user = null;
	try {
		// user = await new User({ id: req.user.sub }).fetch();
		user = await User.fetchById(req.user.data.id);
	} catch (err) {
		res.status(404).send({
			status: 'fail',
			data: 'User not found.',
		});
		throw err;
	}

	// Send (parts of) user profile to requester
	res.send({
		status: 'success',
		data: {
			user: {
				username: user.get('username'),
				first_name: user.get('first_name'),
				last_name: user.get('last_name'),
			},
		}
	});

	// /* With HTTP Basic */

	// if (!req.user) {
	// 	res.status(401).send({
	// 		status: 'fail',
	// 		data: 'Authentication Required.',
	// 	});
	// 	return;
	// }

	// res.send({
	// 	status: 'success',
	// 	data: {
	// 		user: req.user,
	// 	}
	// });
}


// Show the authenticated user's books
const getBooks = async (req, res) => {
	// Query db for user and get their books

	let user = null;
	try {
		// user = await new User ({ id: req.user.sub }).fetch({ withRelated: "books" });
		user = await User.fetchById(req.user.data.id, { withRelated: "books" });
	} catch {
		res.status(404).send({
			status: 'fail',
			data: 'Books not found.',
		});
	}

	// Get this user's books
	const books = user.related("books");

	res.send({
		status: 'success',
		data: {
			books,
		}
	});

	// /* With HTTP Basic */
	// if (!req.user) {
	// 	res.status(401).send({
	// 		status: "fail",
	// 		data: "Authentication required",
	// 	})
	// 	return;
	// }

	// // Query db for the the user's books

	// // Either...
	// // const userId = req.user.get("id");
	// // const user = await new User({ id: userId }).fetch({ withRelated: "books" });
	// // const books = user.related("books");


	// //...or...
	// await req.user.load("books");
	// const books = req.user.related("books");

	// res.send({
	// 	status: 'success',
	// 	data: {
	// 		books,
	// 	}
	// });

};

// Add a book to the user's profile
const addBook = async (req, res) => {
	// Find any validation errors and wrap them in an object
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(422).send({
			status: 'fail',
			data: errors.array(),
		});
		return;
	}

	try {
		const book = await Book.fetchById(req.body.book_id);

		const user = await User.fetchById(req.user.data.id);

		const result = await user.books().attach(book);

		res.status(201).send({
			status: "success",
			data: result,
		})
	} catch (err) {
		res.status(500).send({
			status: 'error',
			data: "Exeption thrown when trying to add book to the user's profile.",
		});
		throw err;
	}
}

// Update the authenticated user's profile
const updateProfile = async (req, res) => {
	// Query db for user
	let user = null;
	try {
		user = await User.fetchById(req.user.data.id);
	} catch (err) {
		console.error(err);
		res.sendStatus(404);
		return;
	}

	// Find any validation errors and wrap them in an object
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(422).send({
			status: 'fail',
			data: errors.array(),
		});
		return;
	}

	const validData = matchedData(req);

	// If request contains password, hash it
	if (validData.password) {
		try {
			validData.password = await bcrypt.hash(validData.password, User.hashSaltRounds)
		} catch (err) {
			res.status(500).send({
				status: 'error',
				message: 'Exception thrown when hashing the password.',
			});
			throw error;
		}
	}

	try {
		await user.save(validData);
		res.status(204).send({  // Successfully processed request but returned no content
			status: 'success',
			data: null
		});
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Error thrown in database when updating profile.',
		});
		throw error;
	}


	// /* With HTTP Basic */
	// if (!req.user) {
	// 	res.status(401).send({
	// 		status: 'fail',
	// 		data: 'Authentication Required.',
	// 	});
	// 	return;
	// }

	// // Finds the validation errors in this request and wraps them in an object with handy functions
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	console.log("Update profile request failed validation:", errors.array());
	// 	res.status(422).send({
	// 		status: 'fail',
	// 		data: errors.array(),
	// 	});
	// 	return;
	// }

	// const validData = matchedData(req);

	// // if request contains password, hash it
	// if (validData.password) {
	// 	try {
	// 		validData.password = await bcrypt.hash(validData.password, User.hashSaltRounds)
	// 	} catch (err) {
	// 		res.status(500).send({
	// 			status: 'error',
	// 			message: 'Exception thrown when hashing the password.',
	// 		});
	// 		throw error;
	// 	}
	// }

	// try {
	// 	const updatedUser = await req.user.save(validData);

	// 	res.send({
	// 		status: 'success',
	// 		data: {
	// 			user: updatedUser,
	// 		},
	// 	});

	// } catch (error) {
	// 	res.status(500).send({
	// 		status: 'error',
	// 		message: 'Exception thrown in database when updating profile.',
	// 	});
	// 	throw error;
	// }
};


module.exports = {
	addBook,
	getProfile,
	getBooks,
	updateProfile,
}


