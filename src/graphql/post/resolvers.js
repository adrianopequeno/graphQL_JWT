import { AuthenticationError } from "apollo-server";
import { checkIsLoggedIn } from "../login/utils/login-functions.js";

// Querys Resolvers
const posts = async (_, { input }, { dataSources, loggedUserId }) => {
  // console.log(loggedUserId);
  if (!loggedUserId) {
    throw new AuthenticationError("You have to log in!");
  }
  const posts = await dataSources.postsApi.getPosts(input);
  return posts;
};

const post = async (_, { id }, { dataSources }) => {
  const post = await dataSources.postsApi.getPost(id);
  return post;
};

// Mutations Resolvers
const createPost = async (_, { data }, { dataSources, loggedUserId }) => {
  checkIsLoggedIn(loggedUserId);
  data.userId = loggedUserId;
  return await dataSources.postsApi.createPost(data);
};

const updatePost = async (
  _,
  { postId, data },
  { dataSources, loggedUserId }
) => {
  checkIsLoggedIn(loggedUserId);
  return dataSources.postsApi.updatePost(postId, data);
};

const deletePost = async (_, { postId }, { dataSources }) => {
  return dataSources.postsApi.deletePost(postId);
};

// Fields Resolvers
// async (parent)
const user = async ({ userId }, __, { dataSources }) => {
  return dataSources.usersApi.batchLoadByPostId(userId);
};

export const postResolvers = {
  Query: {
    posts,
    post,
  },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
    // deleteAllPosts,
  },
  Post: { user },
};
