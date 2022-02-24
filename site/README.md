# VUSD website

## Setup

Create a `.env` file with the following configuration

```
NEXT_PUBLIC_NODE_URL=node used client side for some wallet connectors
NODE_URL=node used server side
EHTPLORER_API_KEY=ethplorer key
ALLOWED_SITES=origins allowed to use with cors ("*" for all, nothing to disable it)
```

To start the local server, run the following command

```
npm run dev
```
