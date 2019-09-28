To generate SSL:
* https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
* https://medium.com/@mohan08p/install-and-renew-lets-encrypt-ssl-on-amazon-ami-6d3e0a61693

```
./certbot-auto certonly --manual
```

* http://mathgame.com.au/.well-known/acme-challenge/a-string

Add:
```
// Certificate
const privateKey = fs.readFileSync('/app/mathgame.com.au/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/app/mathgame.com.au/cert.pem', 'utf8');
const ca = fs.readFileSync('/app/mathgame.com.au/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
...
  // SSL Server
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(SSL_PORT, function() {
    console.log('Server started on port '+SSL_PORT);
    console.log('DONE');
  });
```
