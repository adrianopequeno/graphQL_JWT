import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RESTDataSource } from "apollo-datasource-rest";
import { AuthenticationError } from "apollo-server";

export class LoginApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.API_URL + "users";
    // this.jwt_secret = process.env.JWT_SECRET;
  }

  async login(userName, password) {
    const user = await this.get("", { userName }, { cacheOptions: { ttl: 0 } });
    const found = !!user.length;

    if (!found) {
      throw new AuthenticationError("User does not exist.");
    }

    const { passwordHash, id: userId } = user[0];
    const isPasswordValid = await this.checkUserPassword(
      password,
      passwordHash
    );

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid password!");
    }

    const token = this.createJwtToken({ userId });
    await this.patch(userId, { token }, { cacheOptions: { ttl: 0 } });

    return { userId, token };
  }

  checkUserPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }

  createJwtToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  }
}
