# VUSD distributed application

## Development

```sh
npm install
npx lerna run --stream dev
```

Then open the browser at <http://localhost:3000>.

### Issues in macOS

`node-gyp@5` fails to complete the Lerna bootstrapping process in macOS.
An alternative to spin up the app is to run everything inside a container:

```sh
docker run -it --rm -p 3000:3000 -v $(pwd):/root node:14 bash
```

Then, run:

```sh
cd
npm ci
npx lerna bootstrap
```

Finally, start the app with:

```sh
cd site
npm run dev
```
