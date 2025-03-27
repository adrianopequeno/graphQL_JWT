import { ValidationError } from "apollo-server";

export const createUserFn = async (userData, datasource) => {
  checkUserFields(userData, true);

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
  checkUserFields(userData, false);

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

const checkUserFields = (user, AllFieldsRequired = false) => {
  const userFields = ["firstName", "lastName", "userName"];

  for (const field of userFields) {
    if (!AllFieldsRequired) {
      if (typeof user[field] === "undefined") {
        continue;
      }
    }

    if (field === "userName") {
      validateUserName(user[field]);
    }

    if (!user[field]) {
      throw new Error(`Missing ${field}`);
    }
  }
};

const validateUserName = (userName) => {
  const userNameRegExp = /^[a-z]([a-z0-9_.-]+)+$/gi;

  if (!userName.match(userNameRegExp)) {
    throw new ValidationError(`userName must match ${userNameRegExp}`);
  }
};
