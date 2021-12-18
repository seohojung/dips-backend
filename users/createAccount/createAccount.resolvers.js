import bcrypt from "bcrypt";
import client from "../../client";

export default {
  Mutation: {
    createAccount: async (_, { username, email, password }) => {
      try {
        const existingUser = await client.user.findFirst({
          where: {
            OR: [{ username }, { email }],
          },
        });
        if (existingUser) {
          return {
            ok: false,
            error: "이미 사용중인 아이디/이메일입니다.",
          };
        } else {
          const encryptedPassword = await bcrypt.hash(password, 10);
          await client.user.create({
            data: {
              username,
              email,
              password: encryptedPassword,
            },
          });
          return {
            ok: true,
          };
        }
      } catch (e) {
        return {
          ok: false,
          error: "계정을 만들 수 없습니다.",
        };
      }
    },
  },
};
