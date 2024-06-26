const errors = require("../customError.js");
const errorHandler = require("../errorHandler.js");
const usuariosService = require("../repository/usuarios.services.js");
const mongoose = require("mongoose");

class UsersController {
  constructor() {}

  static async getUsers(req, res) {
    let usuarios;
    let users;
    try {
      usuarios = await usuariosService.getUsuarios();
      users = usuarios.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      req.logger.error(error.message);
    }
    res.status(200).json({ users });
  }

  static async getUsersById(req, res) {
    let id = req.params.uid;

    if (!mongoose.isValidObjectId(id)) {
      req.logger.error(`el id ${id}no es un id valido de mongoose `);
      const error = new Error(errors.INVALID_ID);
      const { message, status } = errorHandler(
        error,
        `el id: ${id} no es valido`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
    }

    let existe;

    try {
      existe = await usuariosService.getUsuarioById({ _id: id });
    } catch (error) {
      req.logger.error(error.message);
      res.setHeader("Content-Type", "application/json");
      return res
        .status(500)
        .json({ error: `No se encontro el usuario`, message: error.message });
    }

    if (!existe) {
      req.logger.error(`el usuario con id ${id}no se encontro en DB`);
      const error = new Error(errors.CART_NOT_FOUND);
      const { message, status } = errorHandler(
        error,
        `el usuario con id ${id} no se encontro en DB`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.CART_NOT_FOUND, detalle: message });
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ usuario: existe });
  }
  static async deleteUser(req, res) {
    const userId = req.params.uid;
    try {
      const user = await usuariosService.getUsuarioById({ _id: userId });
      if (!user) {
        return res.status(404).json("User not found.");
      }
      await usuariosService.deleteUsuarioById(userId);
      res.status(200).json(`Usuario eliminado con exito`);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }
  static async changeUsersRol(req, res) {
    const { uid } = req.params;

    try {
      const user = await usuariosService.getUsuarioById({ _id: uid });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Verificar el rol actual del usuario y cambiarlo
      if (user.role === "usuario") {
        user.role = "premium";
      } else if (user.role === "premium") {
        user.role = "usuario";
      }

      await usuariosService.updateUsuarios({ _id: uid }, user);

      res
        .status(200)
        .json({ message: "Rol actualizado con éxito", newRole: user.role });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el rol" + error.message });
    }
  }

  //   return await productosModelo.updateOne(
  //     { deleted: false, _id: id },
  //     { $set: { deleted: true } }
  //   );
}
module.exports = UsersController;
