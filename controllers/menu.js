const Menu = require('../models/menu');

function addMenu(req, res) {
	const { title, url, order, active } = req.body;
	const menu = new Menu();
	menu.title = title;
	menu.url = url;
	menu.order = order;
	menu.active = active;

	menu.save((err, createdMenu) => {
		if (err) res.status(500).send({ message: 'Error del servidor' });
		if (!createdMenu) {
			res.status(500).send({ message: 'Error al crear el menu' });
		} else {
			res.status(200).send({ message: 'Menu creado correctamente' });
		}
	});
}

function getMenus(req, res) {
	Menu.find()
		.sort({ order: 'asc' })
		.exec((err, menusStored) => {
			if (err) res.status(500).send({ message: 'Error del servidor' });
			if (!menusStored) {
				res.status(404).send({ message: 'No se ha encontrado ningun menu' });
			} else {
				res.status(200).send({ menu: menusStored });
			}
		});
}

function updateMenu(req, res) {
	let menuData = req.body;

	const params = req.params;

	Menu.findByIdAndUpdate(params.id, menuData, (err, menuUpdated) => {
		if (err) res.status(500).send({ message: 'Error del servidor' });
		if (!menuUpdated) {
			res.status(404).message({ message: 'No se ha encontrado ningun menu' });
		} else {
			res.status(200).send({ message: 'Menu actualizado correctamente' });
		}
	});
}

function activateMenu(req, res) {
	const { id } = req.params;
	const { active } = req.body;

	Menu.findByIdAndUpdate(id, { active }, (err, menuUpdated) => {
		if (err) res.status(500).send({ message: 'Error del servidor' });
		if (!menuUpdated) {
			res.status(404).send({ message: 'No se ha encontrado el menu' });
		} else {
			if (active === true) {
				res.status(200).send({ message: 'Menu activado correctamente' });
			} else {
				res.status(200).send({ message: 'Menu desactivado correctamente' });
			}
		}
	});
}
module.exports = {
	addMenu,
	getMenus,
	updateMenu,
	activateMenu,
};
