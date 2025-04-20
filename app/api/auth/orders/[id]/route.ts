import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface Params {
  params: {
    id: string;
  };
}

// GET a single order by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to view this order
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = order.userId === session.user.id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the order' },
      { status: 500 }
    );
  }
}

// PUT update an order (mainly for updating status)
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the order status' },
      { status: 500 }
    );
  }
}
