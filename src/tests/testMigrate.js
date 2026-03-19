const { exec } = require("child_process");

const testMigrate = async () => {
  try {
    await new Promise((resolve, reject) => {
      const reset = exec(
        "npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate",
        { env: process.env },
        (err) => (err ? reject(err) : resolve())
      );

      console.log("🔄 Resetting database and running migrations...");

      // Forward stdout+stderr to this process
      reset.stdout.pipe(process.stdout);
      reset.stderr.pipe(process.stderr);
    });

    console.log("✅ Successfully migrated - database reset complete");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
};

module.exports = testMigrate;
