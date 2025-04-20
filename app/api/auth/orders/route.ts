import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized - no session' }, { status: 401 });
    }

    // Get user from DB to retrieve role and id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('fetchAll') === 'true';

    if (fetchAll && user.role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(orders);
    }

    // Return only user's own orders if not admin or fetchAll not true
    const userOrders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(userOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'An error occurred while fetching orders' }, { status: 500 });
  }
}
