const { defineConfig } =  require('drizzle-kit');

export default defineConfig({
    dialect: "postgresql",
    schema: './src/db/schemas.js',
    out: './src/migrations'
})

