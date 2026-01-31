import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

// ==================== CREATE ====================

export async function createUser(data: {
  username: string;
  password: string;
  namaPuskesmas: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
}) {
  // Hash password sebelum menyimpan
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      namaPuskesmas: true,
      provinsi: true,
      kota: true,
      kecamatan: true,
      kelurahan: true,
      createdAt: true,
    },
  });
}

// ==================== READ ====================

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      namaPuskesmas: true,
      provinsi: true,
      kota: true,
      kecamatan: true,
      kelurahan: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      namaPuskesmas: true,
      provinsi: true,
      kota: true,
      kecamatan: true,
      kelurahan: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ==================== UPDATE ====================

export async function updateUser(
  id: string,
  data: {
    namaPuskesmas?: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kelurahan?: string;
  }
) {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      namaPuskesmas: true,
      provinsi: true,
      kota: true,
      kecamatan: true,
      kelurahan: true,
      updatedAt: true,
    },
  });
}

export async function updatePassword(id: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  return await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: {
      id: true,
      username: true,
    },
  });
}

// ==================== DELETE ====================

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}

// ==================== AUTH ====================

export async function verifyUser(username: string, password: string) {
  const user = await getUserByUsername(username);
  
  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return null;
  }

  // Return user tanpa password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
