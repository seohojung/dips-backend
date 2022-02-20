import prisma from "../../prisma";
import { protectedResolver } from "../../users/users.utils";
import { checkBodyPart } from "../exercises.utils";

export default {
  Mutation: {
    createExercise: protectedResolver(
      async (_, { exercise, bodyPart }, { loggedInUser }) => {
        try {
          // Check if body part is correct
          if (!checkBodyPart(bodyPart)) {
            return {
              ok: false,
              error:
                "운동 부위가 올바르지 않습니다 (Arm, Back, Chest, Core, Leg, Shoulder 중 선택).",
            };
          }

          // If exercise exists, connect to loggedInUser
          const existingExercise = await prisma.exercise.findFirst({
            where: {
              exercise,
              bodyPart,
            },
          });

          if (existingExercise) {
            const updatedExercise = await prisma.exercise.update({
              where: {
                id: existingExercise.id,
              },
              data: {
                users: {
                  connect: {
                    id: loggedInUser.id,
                  },
                },
              },
            });

            return {
              ok: true,
              id: updatedExercise.id,
            };
          }

          // If exercise does not exist, create one
          const newExercise = await prisma.exercise.create({
            data: {
              exercise,
              bodyPart,
              users: {
                connect: {
                  id: loggedInUser.id,
                },
              },
            },
          });
          return {
            ok: true,
            id: newExercise.id,
          };
        } catch (e) {
          return {
            ok: false,
            error: "종목을 생성할 수 없습니다.",
          };
        }
      }
    ),
  },
};
