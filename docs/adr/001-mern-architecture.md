# ADR 001: MERN Stack Architecture

**Status:** Accepted

## Context
We needed a full-stack technology solution to build a real-time smart parking application. The team requires rapid iteration, a unified language across the stack, and strong community support.

## Decision
We chose the MERN stack (MongoDB, Express.js, React, Node.js).
- **React** allows us to build a dynamic, responsive SPA for both customers and operators.
- **Node.js + Express** provides a lightweight, non-blocking I/O backend perfect for handling concurrent API requests and WebSockets.
- **MongoDB** provides a flexible document model suitable for varying parking lot layouts.

## Consequences
- **Positive:** Context switching is minimized as JavaScript/TypeScript is used end-to-end. High developer velocity.
- **Negative:** Node.js is single-threaded; CPU-intensive tasks (like complex report generation) must be offloaded to separate worker processes.
