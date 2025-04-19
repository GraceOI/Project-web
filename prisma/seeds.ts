import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin user created:', admin.email);
    
    // Create regular user
    const userPassword = await hash('user123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Test User',
        password: userPassword,
        role: 'USER',
      },
    });
    
    console.log('Regular user created:', user.email);
    
    // Create Thai dessert products
    const products = [
      {
        name: 'Mango Sticky Rice',
        description: 'Sweet sticky rice served with fresh mango slices and coconut milk. A classic Thai dessert loved by all.',
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1621302201297-9bfb12159194?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Tub Tim Krob',
        description: 'Water chestnut rubies in coconut milk and syrup, served with crushed ice. Refreshing and colorful.',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1626516011762-d4930055d9d4?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Khanom Chan',
        description: 'Layered Thai dessert made from pandan, coconut milk, and tapioca flour. Soft, chewy, and aromatic.',
        price: 7.99,
        imageUrl: 'https://images.unsplash.com/photo-1624466571717-bdae8ab89144?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Bua Loy',
        description: 'Glutinous rice balls in warm coconut milk. Can be filled with black sesame or served with taro or pumpkin.',
        price: 5.99,
        imageUrl: 'https://images.unsplash.com/photo-1574562350094-3a1e5cb48ff6?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Khanom Buang',
        description: 'Crispy Thai crepes filled with meringue and shredded coconut. Sweet and savory versions available.',
        price: 9.99,
        imageUrl: 'https://images.unsplash.com/photo-1624466665263-c66412c9bb04?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Lod Chong',
        description: 'Green rice flour noodles in coconut milk and palm sugar syrup. Served cold with crushed ice.',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1633952291947-bb7f1305db4c?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Khanom Krok',
        description: 'Coconut rice pudding cups. Crispy edges with soft centers, topped with corn or green onions.',
        price: 7.99,
        imageUrl: 'https://images.unsplash.com/photo-1624466571736-432645f69c3e?w=800&auto=format&fit=crop',
        inStock: true,
      },
      {
        name: 'Foi Thong',
        description: 'Golden egg yolk threads cooked in syrup. Royal Thai dessert with a delicate sweet flavor.',
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1625938144058-9a985c943f57?w=800&auto=format&fit=crop',
        inStock: true,
      }
    ];
    
    for (const product of products) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: {},
        create: product,
      });
    }
    
    console.log(`${products.length} products created`);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();