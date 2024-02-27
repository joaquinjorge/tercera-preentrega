const usuariosService = require("../repository/usuarios.services.js");

class SessionController {
  constructor() {}

  static async getSessionUsuario(req, res) {
    req.session.usuario = {
      nombre: req.user.first_name,
      email: req.user.email,
      edad: req.user.age,
      apellido: req.user.last_name,
      rol: req.user.role,
      cart: req.user.cart,
    };
    req.logger.info(JSON.stringify(req.session.usuario));
    res.redirect("/products");
  }
  static async getCurrentSession(req, res) {
    if (!req.session.usuario) {
      res.status(400).json({
        status: "Bad Request",
        error: "no hay un usuario logueado actualmente",
      });
    } else {
      let usuario = await usuariosService.getUsuariosDto(
        req.session.usuario.email
      );
      req.logger.info(JSON.stringify(usuario));
      res.status(200).json({ currentUser: usuario });
    }
  }

  static async registro(req, res) {
    let { email } = req.body;

    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
  }

  static async disconnect(req, res) {
    req.session.destroy((error) => {
      if (error) {
        res.redirect("/login?error=fallo en el logout");
      }
    });

    res.redirect("/login");
  }

  static async githubError(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      error: "Error al autenticar con Github",
    });

    res.redirect("/login");
  }
}
module.exports = SessionController;
