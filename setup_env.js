const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = '.env';

if (!fs.existsSync(envPath)) {
  console.log('[!] Configuration file (.env) not found.');
  rl.question('[?] Enter your Groq API Key: ', (apiKey) => {
    if (apiKey.trim()) {
      fs.writeFileSync(envPath, `GROQ_API_KEY=${apiKey.trim()}\n`);
      console.log('[+] .env file created successfully.');
    } else {
      console.log('[!] Error: API Key cannot be empty.');
    }
    rl.close();
  });
} else {
  console.log('[*] .env file already exists.');
  rl.close();
}
