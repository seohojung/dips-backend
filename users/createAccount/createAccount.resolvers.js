import bcrypt from "bcrypt";
import {
  defaultExercises,
  processExercises,
} from "../../exercises/exercises.utils";
import prisma from "../../prisma";

export default {
  Mutation: {
    createAccount: async (_, { username, email, password }) => {
      try {
        // Check if username/email already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ username }, { email }],
          },
        });
        if (existingUser) {
          return {
            ok: false,
            error: "이메일 또는 닉네임이 이미 사용 중입니다.",
          };
        }

        // Create a new user with an encrypted password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Prepare exerciseObjs (default set of exercises) that will be connected to new user
        let exerciseObjs = [];
        if (defaultExercises) {
          exerciseObjs = processExercises(defaultExercises);
        }

        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            password: encryptedPassword,
            ...(exerciseObjs.length > 0 && {
              exercises: {
                connectOrCreate: exerciseObjs,
              },
            }),
          },
        });
        return {
          ok: true,
          id: newUser.id,
        };
      } catch (e) {
        return {
          ok: false,
          error: "계정을 만들 수 없습니다.",
        };
      }
    },
  },
};
