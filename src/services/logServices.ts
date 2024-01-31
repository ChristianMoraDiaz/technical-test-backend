import prismaDB from "../db";

export async function createLog(
  taskId: number,
  userId: number,
  action: string
): Promise<void> {
  await prismaDB.log.create({
    data: {
      taskId,
      userId,
      action,
      timestamp: new Date(),
    },
  });
}
