const fs = require('fs');
const path = require('path');

console.log('📱 Icon Generator for Expo');
console.log('');
console.log('Untuk generate icon, gunakan salah satu cara berikut:');
console.log('');
console.log('1. Manual Replace:');
console.log('   - Replace file di: assets/images/icon.png (1024x1024)');
console.log('   - Replace file di: assets/images/android-icon-foreground.png');
console.log('   - Replace file di: assets/images/android-icon-background.png');
console.log('   - Replace file di: assets/images/android-icon-monochrome.png');
console.log('');
console.log('2. Online Tool (RECOMMENDED):');
console.log('   🔗 https://icon.kitchen/');
console.log('   🔗 https://easyappicon.com/');
console.log('   🔗 https://appicon.co/');
console.log('');
console.log('3. Setelah replace, jalankan:');
console.log('   npx expo prebuild --clean');
console.log('   npx expo run:android');
console.log('');

const currentIcons = {
  'icon.png': fs.existsSync('./assets/images/icon.png'),
  'android-icon-foreground.png': fs.existsSync('./assets/images/android-icon-foreground.png'),
  'android-icon-background.png': fs.existsSync('./assets/images/android-icon-background.png'),
  'android-icon-monochrome.png': fs.existsSync('./assets/images/android-icon-monochrome.png'),
  'splash-icon.png': fs.existsSync('./assets/images/splash-icon.png'),
  'favicon.png': fs.existsSync('./assets/images/favicon.png'),
};

console.log('Current icon files:');
Object.entries(currentIcons).forEach(([file, exists]) => {
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});
console.log('');
