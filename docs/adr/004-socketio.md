# ADR 004: Socket.IO for Real-Time Updates

**Status:** Accepted

## Context
When a user books a slot, or an operator checks a car in, the UI needs to update instantly to reflect the new slot availability. Polling the server every X seconds via HTTP is inefficient and adds unnecessary load to the database.

## Decision
We implemented Socket.IO to maintain persistent, bi-directional WebSocket connections between the client and the server.
- The backend emits events on the `parking_updates` channel when state changes.
- The React frontend listens to these events and optimistically updates the UI state.

## Consequences
- **Positive:** Real-time user experience without constant HTTP polling overhead.
- **Negative:** Socket.IO connections are stateful. To horizontally scale the Node.js backend across multiple ECS tasks, we will eventually need to introduce a Redis pub/sub adapter to broadcast events across all nodes.
