import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../[...nextauth]/route';

interface Params {
  params: {
    id: string;
  };
}

// GET a single product by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the product' },
      { status: 500 }
    );
  }
}

// PUT update a product
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
    const { name, description, price, imageUrl, inStock } = body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price: price ?? existingProduct.price,
        imageUrl: imageUrl ?? existingProduct.imageUrl,
        inStock: inStock !== undefined ? inStock : existingProduct.inStock,
      },
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the product' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(request: Request, { params }: Params) {
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
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product from database
    await prisma.product.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the product' },
      { status: 500 }
    );
  }
}