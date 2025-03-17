FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o kurkkumopo-catcher .

FROM registry.access.redhat.com/ubi9/ubi-minimal
#FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/kurkkumopo-catcher .
COPY ./dist/ ./dist/
RUN chmod -R 755 ./dist/

EXPOSE 8080

USER 1001

CMD ["./kurkkumopo-catcher"]