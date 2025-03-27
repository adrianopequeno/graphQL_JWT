export const login = async (_, { data }, { dataSources }) => {
  // console.log("dataSources", dataSources);
  const { userName, password } = data;
  return dataSources.loginApi.login(userName, password);
};

export const loginResolvers = {
  Mutation: {
    login,
  },
};
