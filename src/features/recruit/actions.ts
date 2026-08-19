"use server";

import { prisma } from "@/server/db";
import { createRecruitSchema, CreateRecruitInput } from "./schema";

export async function createRecruit(input: CreateRecruitInput, userId: string) {
  const validated = createRecruitSchema.parse(input);
  
  const recruit = await prisma.recruit.create({
    data: {
      ...validated,
      authorId: userId,
    },
  });

  return recruit;
}
