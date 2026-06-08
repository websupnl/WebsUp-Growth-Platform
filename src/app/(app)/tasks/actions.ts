"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { TaskStatus, Level } from "@prisma/client";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const due = String(formData.get("dueDate") ?? "").trim();

  await db.task.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      priority: (formData.get("priority") as Level) ?? "MIDDEL",
      dueDate: due ? new Date(due) : null,
    },
  });
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  await db.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await db.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/");
}
