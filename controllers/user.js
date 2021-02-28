const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('../services/jwt');
const User = require('../models/user');
const user = require('../models/user');

async function signUp(req, res) {
	const user = new User();

	const { name, lastname, email, password, repeatPassword } = req.body;
	user.name = name;
	user.lastname = lastname;
	user.email = email.toLowerCase();
	user.role = 'admin';
	user.active = false;

	if (!password || !repeatPassword) {
		res.status(422).send({ message: 'Las contraseñas son obligatorias' });
	}

	if (password !== repeatPassword) {
		res.status(422).send({ message: 'Las contraseñas no son iguales' });
	}

	const hash = await bcrypt.hashSync(password);
	user.password = hash;

	user.save((err, userStored) => {
		if (err) res.status(500).send({ message: 'El usuario ya existe' });
		if (!userStored) {
			res.status(404).send({ message: 'Error al crear el usuario' });
		}

		res.status(201).send({ user: userStored });
	});
}

async function signIn(req, res) {
	const params = req.body;
	const email = params.email.toLowerCase();
	const password = params.password;

	User.findOne({ email }, async (err, userStored) => {
		if (err) {
			res.status(500).send({ message: 'Error del servidor' });
		}

		if (!userStored) {
			res
				.status(401)
				.send({ message: 'El usuario o la contraseña no son correctos' });
		}

		const compare = await bcrypt.compare(password, userStored.password);
		if (!compare) {
			res
				.status(401)
				.send({ message: 'El usuario o la contraseña no son correctos' });
		}

		if (!userStored.active) {
			res.status(401).send({ message: 'El usuario no esta activo' });
		}

		res.status(200).send({
			accessToken: jwt.createAccessToken(userStored),
			refreshToken: jwt.createRefreshToken(userStored),
		});
	});
}

function getUsers(req, res) {
	User.find().then((users) => {
		if (!users) {
			res.status(404).send({ message: 'No se ha encontrado nigun usuario' });
		}

		res.status(200).send({ users });
	});
}

function getUsersActive(req, res) {
	const query = req.query;

	User.find({ active: query.active }).then((users) => {
		if (!users) {
			res.status(404).send({ message: 'No se ha encontrado nigun usuario' });
		}

		res.status(200).send({ users });
	});
}

function uploadAvatar(req, res) {
	const params = req.params;

	User.findById({ _id: params.id }, (err, userData) => {
		if (err) res.status(500).send({ message: 'Error del servidor' });
		if (!userData) {
			res.status(404).send({ message: 'No se ha encontrado ningun usuario' });
		} else {
			let user = userData;

			if (req.files) {
				let filePath = req.files.avatar.path;
				let fileName = filePath.replace(/^.*[\\\/]/, '');

				let extSplit = fileName.split('.');
				let fileExt = extSplit[1];

				if (fileExt !== 'png' && fileExt !== 'jpg') {
					res.status(400).send({
						message:
							'La extension de la imagen no es valida. (Extensiones permitadas: .png y .jpg)',
					});
				} else {
					user.avatar = fileName;
					User.findByIdAndUpdate(
						{ _id: params.id },
						user,
						(err, userResult) => {
							if (err) res.status(500).send({ message: 'Error del servidor' });
							if (!userResult) {
								res
									.status(404)
									.send({ message: 'No se ha encontrado ningun usuario' });
							} else {
								res.status(200).send({ avatarName: fileName });
							}
						}
					);
				}
			}
		}
	});
}

function getAvatar(req, res) {
	const avatarName = req.params.avatarName;

	const filePath = './uploads/avatar/' + avatarName;

	fs.exists(filePath, (exists) => {
		if (!exists) res.status(404).send({ message: 'El avatar no existe' });
		res.sendFile(path.resolve(filePath));
	});
}

async function updateUser(req, res) {
	let userData = req.body;
	userData.email = req.body.email.toLowerCase();
	const params = req.params;

	if (userData.password) {
		const hash = await bcrypt.hashSync(userData.password);
		userData.password = hash;
	}

	User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
		if (err) res.status(500).send({ message: 'Error del servidor' });

		if (!userUpdate) {
			res.status(404).send({ message: 'No se ha encontrado ningun usuario' });
		} else {
			res.status(200).send({ message: 'Usuario actualizado correctamente' });
		}
	});
}

function activateUser(req, res) {
	const { id } = req.params;
	const { active } = req.body;

	User.findByIdAndUpdate(id, { active }, (err, userStored) => {
		if (err) res.status(500).send({ message: 'Error del servidor' });
		if (!userStored) res.status(404).send({ message: 'Usuario no encontrado' });

		if (active === true) {
			res.status(200).send({ message: 'Usuario activa correctamente' });
		} else {
			res.status(200).send({ message: 'Usuario desactivado correctamente' });
		}
	});
}

module.exports = {
	signUp,
	signIn,
	getUsers,
	getUsersActive,
	uploadAvatar,
	getAvatar,
	updateUser,
	activateUser,
};
