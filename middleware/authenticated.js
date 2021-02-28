const jwt = require('jwt-simple');
const moment = require('moment');

const SECRET_KEY = 'JKD5G4F57Ffd';

exports.ensureAuth = (req, res, next) => {
	if (!req.headers.authorization) {
		return res
			.status(403)
			.send({ message: 'La peticion no tiene cabecera de autenticacion' });
	}

	const token = req.headers.authorization.replace(/['"]+/g, '');

	try {
		var payload = jwt.decode(token, SECRET_KEY);
		if (payload.exp <= moment.unix()) {
			return res.status(401).send({ message: 'El token a expirado' });
		}
	} catch (ex) {
		return res.status(401).send({ message: 'Token invalido' });
	}

	req.user = payload;
	next();
};
