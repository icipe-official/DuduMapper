import { PrismaClient } from '@/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.vectorRiskData.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        notifications: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

