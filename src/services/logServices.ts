import prismaDB from "../db";

export async function createLog(
  taskId: number,
  userId: number,
  action: string
): Promise<void> {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  await prismaDB.log.create({
    data: {
      taskId,
      userId,
      action,
      timestamp: currentDate,
    },
  });
}
