# Personal Blogging Platform API

> A production-grade RESTful API for a personal blogging platform — secure, documented, and ready to deploy.

[![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

This API enables users to register, authenticate, and manage their own blog posts. It is designed to demonstrate clean architecture, secure authentication, and operational best practices.

> Full documentation, architecture diagrams (Mermaid), API reference, and deployment guide will be added in a later commit.

## Quick start (preview)

```bash
git clone https://github.com/<your-username>/Meta-Software-Intern-Task
cd Meta-Software-Intern-Task
cp .env.example .env
docker compose up -d          # or point DATABASE_URL to a hosted Postgres
npm install
npm run db:migrate -- --name init
npm run dev
```

## Status

🚧 Initial scaffold — features are being implemented incrementally. See commit history.
