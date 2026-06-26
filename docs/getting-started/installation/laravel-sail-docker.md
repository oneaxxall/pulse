# Laravel Sail (Docker)

For Laravel Sail, you may utilize Socket's [Docker](docker.md) images by adding a new service in your `docker-compose.yaml` file:

```yaml
# For more information: https://laravel.com/docs/sail
version: '3'
services:
    # ...

    Socket:
        image: 'quay.io/Socket/Socket:latest-16-alpine'
        environment:
            DEBUG: '1'
            METRICS_SERVER_PORT: '9601'
        ports:
            - '${Socket_PORT:-6001}:6001'
            - '${Socket_METRICS_SERVER_PORT:-9601}:9601'
        networks:
            - sail

networks:
    sail:
        driver: bridge
```

After adding the server definition to your application's `docker-compose.yml` file, you should configure your broadcasting environment variables as well as [the broadcasting driver](../backend-configuration/laravel-broadcasting.md):

```
PUSHER_HOST=Socket
PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret
```
