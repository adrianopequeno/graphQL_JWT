import jwt from "jsonwebtoken";
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
export const context = ({ req }) => {
  const loggedUserId = authorizeUser(req);
  return {
    loggedUserId,
  };
};

const authorizeUser = (req) => {
  const { headers } = req;
  const { authorization } = headers;

  try {
    const [_bearer, token] = authorization.split(" ");
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  } catch (e) {
    return "";
  }
};
