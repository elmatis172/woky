// Emergency script to fix production database
// Run with: node scripts/fix-prod-db.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚨 EMERGENCY DATABASE FIX');
    console.log('Checking for shippingStatus column...');

    // Check if column exists
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' AND column_name = 'shippingStatus';
    `;

    console.log('Column check result:', columns);

    if (Array.isArray(columns) && columns.length > 0) {
      console.log('⚠️  shippingStatus column EXISTS - DROPPING IT...');
      
      await prisma.$executeRaw`
        ALTER TABLE "Order" DROP COLUMN "shippingStatus";
      `;

      console.log('✅ Column dropped successfully!');
    } else {
      console.log('✅ Column does NOT exist - schema is correct');
    }

    // Show final structure
    console.log('\n📋 Final Order table structure:');
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Order'
      ORDER BY ordinal_position;
    `;
    console.table(finalColumns);

    console.log('\n🎉 Database fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
