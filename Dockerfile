FROM golang:1.14 AS builder
WORKDIR /go/src/github.com/cwcodell/time-warp
COPY ./app/main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o timewarp .

FROM alpine:3.12
COPY --from=builder /go/src/github.com/cwcodell/time-warp .
COPY ./app/static ./static
CMD ["./timewarp"]
