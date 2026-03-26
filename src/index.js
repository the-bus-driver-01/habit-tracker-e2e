#!/usr/bin/env node

const HabitCLI = require('./cli/habitCli');
const fs = require('fs');
const path = require('path');

async function main() {
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const cli = new HabitCLI();

  try {
    await cli.initialize();

    // Get command line arguments (skip node and script name)
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log('Habit Tracker with Archiving Functionality');
      console.log('Run with "help" to see available commands');
      console.log('');
      await cli.run(['help']);
    } else {
      await cli.run(args);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await cli.shutdown();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };