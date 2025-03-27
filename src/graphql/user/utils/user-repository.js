import { UserInputError, ValidationError } from "apollo-server";
import bcrypt from "bcrypt";

export const createUserFn = async (userData, datasource) => {
  await checkUserFields(userData, true);

  const indexRefUser = await datasource.get("", {
    _limit: 1,
    _sort: "indexRef",
    _order: "desc",
  });

  const indexRef = indexRefUser[0].indexRef + 1;

  const foundUser = await userExists(userData.userName, datasource);

  if (typeof foundUser !== "undefined") {
    throw new ValidationError(
      `userName ${userData.userName} has already been taken`
    );
  }

  return datasource.post("", {
    ...userData,
    indexRef,
    createdAt: new Date().toISOString(),
  });
};

export const updateUserFn = async (userId, userData, datasource) => {
  await checkUserFields(userData, false);

  if (!userId) throw new ValidationError(`Missing userId`);

  if (userData.userName) {
    const foundUser = await userExists(userData.userName, datasource);

    if (typeof foundUser !== "undefined" && foundUser.id !== userId) {
      throw new ValidationError(
        `userName ${userData.userName} has already been taken`
      );
    }
  }

  return datasource.patch(userId, {
    ...userData,
  });
};

export const deleteUserFn = async (userId, datasource) => {
  if (!userId) throw new ValidationError(`Missing userId`);

  return !!(await datasource.delete(userId));
};

const userExists = async (userName, datasource) => {
  // /users/?userName=nomeBuscado
  const found = await datasource.get("", {
    userName,
  });
  return found[0];
};

const checkUserFields = async (user, AllFieldsRequired = false) => {
  const userFields = ["firstName", "lastName", "userName", "password"];

  for (const field of userFields) {
    if (!AllFieldsRequired) {
      if (typeof user[field] === "undefined") {
        continue;
      }
    }

    if (field === "userName") {
      validateUserName(user[field]);
    }

    if (field === "password") {
      validateUsePassword(user[field]);
    }

    if (!user[field]) {
      throw new Error(`Missing ${field}`);
    }
  }

  if (user.password && !user.passwordHash) {
    const { password } = user;
    const passwordHash = await bcrypt.hash(password, 12);
    user.passwordHash = passwordHash;
    delete user["password"];
  }
};

const validateUserName = (userName) => {
  const userNameRegExp = /^[a-z]([a-z0-9_.-]+)+$/gi;

  if (!userName.match(userNameRegExp)) {
    throw new ValidationError(`userName must match ${userNameRegExp}`);
  }
};

const validateUsePassword = (password) => {
  /*
    1- ^ - Início da string.
    2- (?=.*[a-z]) - Deve conter pelo menos uma letra minúscula.
    3- (?=.*[A-Z]) - Deve conter pelo menos uma letra maiúscula.
    4- (?=.*\d) - Deve conter pelo menos um número.
    5- (?=.*[@$!%*?&]) - Deve conter pelo menos um caractere especial entre @$!%*?&.
    6- [A-Za-z\d@$!%*?&]{8,} - Deve ter pelo menos 8 caracteres, podendo conter letras maiúsculas, minúsculas, números e os caracteres especiais permitidos.
    7- $ - Fim da string.

    Ex: ✅ Abcdef1@
        ✅ Str0ngP@ss!
        ✅ XyZ9$lmno
        ✅ Secure#123
        ✅ Passw0rd!
  */
  const passwordRegExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

  if (!password.match(passwordRegExp)) {
    throw new UserInputError(
      "Password must contain at least: " +
        "have at least 8 characters, at least one uppercase letter, at least one lowercase letter, at least one number, and at least one special character (between @$!%*?&)"
    );
  }
};
