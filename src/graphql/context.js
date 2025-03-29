import jwt from "jsonwebtoken";
import { UsersApi } from "./user/datasources.js";
// import fetch from 'node-fetch';
// import { getUsers } from './user/utils.js';
// import { getPosts } from './post/utils.js';

// const _getUsers = getUsers(fetch);
// const _getPosts = getPosts(fetch);

// export const context = () => {
//   return {
//     getUsers: _getUsers,
//     getPosts: _getPosts,
//   };
// };
export const context = async ({ req }) => {
  const loggedUserId = await authorizeUser(req);
  return {
    loggedUserId,
  };
};

const authorizeUser = async (req) => {
  const { headers } = req;
  const { authorization } = headers;

  try {
    const [_bearer, token] = authorization.split(" ");
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const userApi = new UsersApi();
    userApi.initialize({});
    const foundUser = await userApi.getUser(userId);

    if (foundUser.token !== token) {
      return "";
    }

    return userId;
  } catch (e) {
    console.log("Error: ", e);
    return "";
  }
};
