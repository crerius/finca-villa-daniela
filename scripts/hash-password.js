const bcrypt = require('bcryptjs');
const { program } = require('commander'); // npm install commander

program
  .requiredOption('-p, --password <password>', 'Password to hash')
  .option('-s, --salt-rounds <rounds>', 'Salt rounds for bcrypt', '10'); // 10-12 es un buen valor

program.parse(process.argv);
const options = program.opts();

const saltRounds = parseInt(options.saltRounds, 10);
if (isNaN(saltRounds)) {
    console.error('Salt rounds must be a number.');
    process.exit(1);
}

console.log(`Hashing password: "${options.password}" with ${saltRounds} salt rounds...`);

bcrypt.hash(options.password, saltRounds, function(err, hash) {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("BCrypt Hash:", hash);
  console.log("\n¡Copia este hash y guárdalo de forma segura en la base de datos para tu usuario admin!");
});