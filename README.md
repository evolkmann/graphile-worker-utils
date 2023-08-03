# graphile-worker-utils

This package provides a number of utilities for working with
[graphile-worker](https://github.com/graphile/worker).

- [GraphileQueueManager](./src/manager.ts):
    A wrapper class around `WorkerUtils` with the intention
    to provide a more convenient and typed API for scheduling jobs.
- [GraphileQueueWorker](./src/worker.ts):
    A helper with a convenient API to implement a worker.
- [PersistentGraphileQueueWorker](./src/persistent-worker.ts):
    Completed jobs will not be deleted, but instead copied
    to a separate table. This allows to inspect the results
    and history of completed jobs.

## Demo

### 1. Start the demo database

```sh
yarn demo:db:reset
```

This will (shut down and) start a postgres database via docker-compose.
You can access the database with the credentials in `demo/docker-compose.yml`.

### 2. Install the demo worker schema

```sh
yarn demo:worker:install-schema
```

This will install the `graphile-worker` schema.

### 3. Run the demo

```sh
ts-node demo/demo.ts
```

This will create a couple of jobs and demonstrate the behaviour of the
[PersistentGraphileQueueWorker](./src/persistent-worker.ts).
