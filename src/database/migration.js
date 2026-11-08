const fs = require('fs');
const path = require('path');
const db = require('../config/db.config');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting Database Migrations...');

    // 1. تحديد فولدر الـ migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // 2. قراءة كل الملفات وترتيبها أَبْجَدِيّاً (001_, 002_, ...)
    const files = fs.readdirSync(migrationsDir).sort();

    // 3. تنفيذ كل ملف SQL بالترتيب
    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`⏳ Executing: ${file}`);
        await db.query(sql);
        console.log(`✅ Finished: ${file}`);
      }
    }

    console.log('🚀 All Migrations Executed Successfully!');
  } catch (error) {
    console.error('❌ Migration Failed:', error.message);
  } finally {
    // 4. إنهاء الاتصال بعد الـ Migration
    process.exit();
  }
};

runMigrations();