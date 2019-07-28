# Cache service

Part of the microservices interview task. The related microservices [can be found here.](https://github.com/Doesntmeananything/microservices-task)

## Description

Based on Redis, this caching microservice performs the following tasks:

1. Every minute queries the Postgres database and puts the results in Redis store
2. Serves the [cached contents](https://caching-service-task.herokuapp.com/cache/top5) of the store to be consumed by REST API
3. Sets the expiry time for cache to be 60 seconds
4. In case it can't retreive the queried information, serves empty array to signify issues and refrain from propagating stale data.
