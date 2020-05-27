/**
 * Authentication middleware
 */

const jwt = require("jsonwebtoken");
const { getTokenfromHeaders } = require("../auth_controller")
const { User } = require('../../models');

const basic = async (req, res, next) => {

	// check if Authorization header exists, otherwise bail
	if (!req.headers.authorization) {
		res.status(401).send({
			status: 'fail',
			data: 'Authorization required',
		});
		return;
	}

	// "Basic a2FsbGUyMDAwOnNjcmlwdC1raWRxd2Vxd2Vxd2Vxd2Vxd2Vxd2Vxd2U="
	// =>
	// [0] = "Basic"
	// [1] = "a2FsbGUyMDAwOnNjcmlwdC1raWRxd2Vxd2Vxd2Vxd2Vxd2Vxd2Vxd2U="
	const [authSchema, base64Payload] = req.headers.authorization.split(' ');

	if (authSchema.toLowerCase() !== "basic") {
		// not ours to authenticate
		next();
	}

	const decodedPayload = Buffer.from(base64Payload, 'base64').toString('ascii');

	// kalle:omg-food
	const [username, password] = decodedPayload.split(':');

	const user = await User.login(username, password);

	// After authenticating the user and know that they are who they claim to be,
	// attach the user object to the request, so that other parts of the api can use the user
	req.user = user;
	req.user.data = { id: user.get('id') }

	next();
}

const validateJWT = (req, res, next) => {

	const token = getTokenfromHeaders(req);
	if (!token) {
		res.status(401).send({
			status: 'fail',
			data: 'No token found in request headers.',
		});
		return;
	}

	// Validate token and extract payload
	let payload = null;

	try {
		payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
	} catch (err) {
		res.status(403).send({
			status: 'fail',
			data: 'Authentication Failed.',
		});
		throw err;
	}

	// Attach apyload to req.user
	req.user = payload;

	next();
}

module.exports = {
	basic,
	validateJWT,
}

