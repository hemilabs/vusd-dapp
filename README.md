# VUSD distributed application

## Development

```sh
npm install
npx lerna run --stream dev
```

Then open the browser at <http://localhost:3000>.

### Issues in Apple silicon Macs

Node 14 fails to compile natively so the option is to run it with Rosetta:

```sh
arch -x86_64 zsh
nvm install 14
nvm use
```

And when installing the dependencies `node-gyp@5` may fail to complete the Lerna bootstrapping process.
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
