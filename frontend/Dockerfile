FROM node:20-alpine

WORKDIR /app

COPY package.json ./

# The user is using pnpm? Wait, package.json says "packageManager": "pnpm@12.3.4"
# But package-lock.json might not exist, or they might be using npm install as per the instructions.
# I'll install pnpm globally just in case, but run npm install if the user explicitly mentioned it in their instructions.
# User instructions: "Execute o comando npm install para baixar as dependencias."
# So we will just use npm install to be safe, but wait, the package.json says packageManager: pnpm@12.3.4
# We'll use npm install as requested by user.

RUN npm install

COPY . .

EXPOSE 5173

# Expose Vite dev server to the outside network of the container
CMD ["npm", "run", "dev", "--", "--host"]
