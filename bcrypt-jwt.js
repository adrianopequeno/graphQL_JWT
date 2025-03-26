import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// bcrypt
// (async () => {
//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash("123456", salt);
//   console.log(hash);

//   const userLogginPassword = "123456";
//   const isPasswordValid = await bcrypt.compare(userLogginPassword, hash);

//   console.log(isPasswordValid);
// })();

(async () => {
  const JWT_SECRET = "O_MEU_SECRET";
  const token = jwt.sign({ UserId: "123", userName: "Fulano" }, JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log(token);

  const tokenData = jwt.verify(token, JWT_SECRET);
  console.log(tokenData);
})();
