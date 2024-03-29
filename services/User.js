import connection from '../config/connectionDB.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {generateToken} from '../utils/jwt/token.js';



class UserService {
  constructor() {}

  async login(email, password) {
    const user = await this.findEmail(email);
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const getId = await this.findEmail(email);
        const token = jwt.sign({ email: user.email, id: getId.idUser }, 'hola');
        generateToken(user);
        return {user, token};
      } else {
        throw new Error('Contraseña incorrecta');
      }
    } else {
      throw new Error(`No se encontró ningún usuario con el email ${email}`);
    }
  }

  async findEmail(email) {
    try {
      const query = 'SELECT * FROM usuario WHERE email = ?';
      const [user] = await connection.query(query, [email]);
    
      if (user.length === 0) {
        return null;
      }
      return user[0];
    } catch (error) {
      console.error(`Error al obtener el usuario con email ${email}: `, error);
      throw error;
    }
  
  }
  async register(fullname, email, password, phone) {
    try {
  
      const existingUser = await this.findEmail(email);
      
      if (existingUser) {
        throw new Error(`El email ${email} ya está registrado`);
      }
      const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña
      const query = 'INSERT INTO usuario (fullname, email, password, phone) VALUES (?, ?, ?, ?)';
      const result = await connection.query(query, [fullname, email, hashedPassword, phone]);

      const newUser = {
        id: result.insertId,
        email: email,
        password: hashedPassword,
        phone: phone
      };

      return newUser;
    } catch (error) {

      throw error;
    }
  }
}

export default UserService;
