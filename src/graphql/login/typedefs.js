import { gql } from "apollo-server";

export const loginTypeDefs = gql`
  extend type Mutation {
    login(data: LoginInput!): Login!
  }

  type Login {
    userId: String!
    token: String!
  }

  input LoginInput {
    userName: String!
    password: String!
  }
`;
