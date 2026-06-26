# 🪝 Webhooks Documentation

Webhooks allow Pulse Server to send *real-time* notifications to your backend application (Laravel/Node.js) when certain WebSocket activities occur.

## 1. Webhook Configuration

Webhooks are configured per-application in the database within the `webhooks` column (JSON format).

### Configuration JSON Structure
```json
[
  {
    "url": "https://api.yourservice.com/pusher/webhook",
    "event_types": ["client_event", "member_added", "member_removed"],
    "filter": {
      "channel_name_starts_with": "chat-",
      "channel_name_ends_with": "-room"
    },
    "headers": {
      "X-Custom-Auth": "your-secret-token"
    }
  }
]
```

### Configuration Parameters:
- `url`: The target URL that will receive the POST data.
- `event_types`: List of events to monitor (see the list below).
- `filter` (Optional): Restrict webhooks to specific channels only.
- `headers` (Optional): Additional headers to send to your server.

---

## 2. Supported Event Types

| Event Name | Description |
| :--- | :--- |
| `client_event` | When a user sends a client event (e.g., `client-typing`). |
| `member_added` | When a user joins a Presence Channel (comes Online). |
| `member_removed` | When a user leaves a Presence Channel (goes Offline). |
| `channel_occupied` | When a new channel is created (first person joins). |
| `channel_vacated` | When a channel becomes empty (last person leaves). |
| `cache_miss` | When a cache data request is not found. |

---

## 3. Security & Verification

Every webhook request includes a **`X-Pusher-Signature`** header. You **MUST** verify this signature on your server side to ensure the data genuinely originates from Pulse Server.

### Verification Method (Node.js Example):
The signature is the result of **HMAC SHA256** of the *request body* using your **App Secret** as the key.

```javascript
const crypto = require('crypto');

function verifyWebhook(body, receivedSignature, appSecret) {
    const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(JSON.stringify(body))
        .digest('hex');

    return expectedSignature === receivedSignature;
}
```

---

## 4. Data Format (Payload)

Data is sent in JSON format as follows:

```json
{
  "time_ms": 1625000000000,
  "events": [
    {
      "name": "member_added",
      "channel": "presence-chat",
      "user_id": "123"
    }
  ]
}
```

---

## 5. Implementation Tips
1. **Quick Response**: Your server should respond with a `200 OK` status code as soon as possible.
2. **Queue**: It is highly recommended to push webhook data into a *Queue* on your server side to avoid impacting Pusher's performance if your server responds slowly.
3. **Idempotency**: Since network connections can be unstable, there is a possibility that a webhook may be delivered twice. Ensure your server can handle duplicate deliveries gracefully.
