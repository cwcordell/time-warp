# Time Warp App

Time warp is a golang application that serves a single page application. The app is intended to memic slow server response and errors that may be present in common applications.

## Use

The application can be ran locally or on a server and either with the go CLI, as a binary and static, as a Docker container, or other host method such as PaaS.

### Go CLI

This method requires that the Go CLI be installed on the machine in which to run the code. Clone the repository and then run the go server.

``` shell
    go run main.go
```

### Binary and Static Upload to Server

[Build the binary](#Building-the-Binary)) and then upload the binary and the static directory to the server.

``` shell
    go build main.go
```

### Docker

Run this app as a Docker container with the following:

``` shell
    docker run --name timewarp -p 8000:8000 cordelltech/timewarp
```

The host port can be changed to suite your needs, i.e. `-p $(your-host-port):8000`.

## Building

### Building the Binary

The GoLang binary can be built for the local system using the go CLI.

``` shell
go build -o timewarp .
```

If building for another system then the GOOS and GOARCH variables can be used. For example, the Windows binary can be built with `GOOS=win GOARCH=amd64 go build -o timewarp`. See the  [GoLang Build documentation](https://golang.org/pkg/go/build/) for more information.

### Building the Docker Image

The docker image can be built if desired in lieu of using the Docker Image at [cordelltech/timewarp](https://hub.docker.com/r/cordelltech/timewarp). From the project root directory run:

``` shell
docker build -t timewarp .
```
