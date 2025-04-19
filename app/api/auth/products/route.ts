import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../[...nextauth]/route';

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching products' },
      { status: 500 }
    );
  }
}

// POST create a new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, description, price, imageUrl, inStock } = body;
    
    // Validate required fields
    if (!name || !description || price === undefined || !imageUrl) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        inStock: inStock ?? true,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the product' },
      { status: 500 }
    );
  }
}