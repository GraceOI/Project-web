import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { items, totalAmount } = body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Cart items are required' },
        { status: 400 }
      );
    }
    
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return NextResponse.json(
        { message: 'Valid total amount is required' },
        { status: 400 }
      );
    }
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        orderItems: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const isAdmin = session.user.role === 'ADMIN';
    
    // If admin and fetchAll is set, return all orders
    if (isAdmin && searchParams.get('fetchAll') === 'true') {
      const orders = await prisma.order.findMany({
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
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json(orders);
    }
    
    // Otherwise, return only the user's orders
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}