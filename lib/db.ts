import prisma from "@/lib/prisma"

export async function createUser(email: string, password: string, name?: string) {
  return prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  })
}

export async function emailExists(email: string) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })
  return !!existing
}

