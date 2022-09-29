# Minimal viable MySQL service

For some reason that I do not understand, the MySQL part of the jamsync server causes the app to crash after some minutes if deployed to Netlify. I do not know if this is specific to Netlify and it is difficult to debug.

So far it looks like it might be related to the fact that the MySQL server is dropping idle connections after some time (this seems to be intended behavior of MySQL servers). This is surprising because the MySQL connection should be closed after each transaction.
