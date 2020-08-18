import DCServer from "./DCServer";

const DEFAULT_PORT = 3030;

const Server: DCServer = new DCServer(DEFAULT_PORT);

Server.listen(port => {
    console.log(`Server is listening on http://localhost:${port}`);
});